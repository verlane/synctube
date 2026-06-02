"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { extractVideoId } from "@/lib/youtube";
import {
  encodeShareState,
  parseShareState,
  type LayoutMode,
  type MutedSide,
  type ShareState,
} from "@/lib/share-state";
import { useSyncedPlayers } from "@/hooks/useSyncedPlayers";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { PlayerFrame } from "./PlayerFrame";
import { NudgeControls } from "./NudgeControls";
import { OffsetControl } from "./OffsetControl";
import { UrlInputs } from "./UrlInputs";
import { Controls } from "./Controls";

const OFFSET_POLL_MS = 300;

export function SyncApp() {
  const searchParams = useSearchParams();
  const players = useSyncedPlayers();

  const shared = useMemo<ShareState | null>(
    () => parseShareState(searchParams),
    [searchParams],
  );
  const isViewer = shared !== null;

  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [idA, setIdA] = useState<string | null>(shared?.a ?? null);
  const [idB, setIdB] = useState<string | null>(shared?.b ?? null);
  const [muted, setMuted] = useState<MutedSide>(shared?.muted ?? "a");
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fromStart, setFromStart] = useState(true);
  const [layout, setLayout] = useState<LayoutMode>(shared?.layout ?? "col");
  const [selectedSide, setSelectedSide] = useState<MutedSide>("a");
  const [liveOffset, setLiveOffset] = useState<number | null>(null);

  const ready = Boolean(idA && idB);
  const isEditing = !isViewer && ready;

  // Poll the live offset while editing so the user sees alignment in real time.
  useEffect(() => {
    if (!isEditing) return;
    const timer = setInterval(() => {
      setLiveOffset(players.getOffset());
    }, OFFSET_POLL_MS);
    return () => clearInterval(timer);
  }, [isEditing, players]);

  const handleLoad = useCallback(() => {
    const a = extractVideoId(urlA);
    const b = extractVideoId(urlB);
    if (!a || !b) {
      setError("두 링크 모두 올바른 YouTube 주소여야 해요.");
      return;
    }
    setError(null);
    setShareUrl(null);
    setIsPlaying(false);
    setIdA(a);
    setIdB(b);
  }, [urlA, urlB]);

  const handlePlay = useCallback(() => {
    if (shared) {
      players.playSynced(
        { startA: shared.startA, offset: shared.offset },
        muted,
      );
    } else {
      players.playBoth(muted);
    }
    setIsPlaying(true);
  }, [players, shared, muted]);

  const handleNudge = useCallback(
    (side: MutedSide, delta: number) => {
      players.nudge(side, delta);
      setShareUrl(null);
    },
    [players],
  );

  const handlePause = useCallback(() => {
    players.pauseBoth();
    setIsPlaying(false);
  }, [players]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePause, handlePlay]);

  const handleApplyOffset = useCallback(
    (value: number) => {
      players.setOffset(value);
      setLiveOffset(value);
      setShareUrl(null);
    },
    [players],
  );

  const handleToggleLayout = useCallback(() => {
    setLayout((prev) => (prev === "col" ? "row" : "col"));
  }, []);

  const handleToggleMute = useCallback(() => {
    const next: MutedSide = muted === "a" ? "b" : "a";
    setMuted(next);
    players.applyMute(next);
  }, [muted, players]);

  const handleCapture = useCallback(() => {
    const snapshot = players.captureSync();
    if (!snapshot || !idA || !idB) {
      setError("영상을 먼저 불러와 주세요.");
      return;
    }
    // "처음부터 재생"은 정렬을 유지한 채 둘 중 이른 영상을 0초에 맞춘다.
    const startA = fromStart
      ? Math.max(0, -snapshot.offset)
      : snapshot.startA;
    const state: ShareState = {
      a: idA,
      b: idB,
      offset: snapshot.offset,
      startA,
      muted,
      layout,
    };
    const query = encodeShareState(state);
    setShareUrl(`${window.location.origin}/?${query}`);
    setError(null);
    setCopied(false);
  }, [players, idA, idB, muted, fromStart, layout]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setError("클립보드 복사에 실패했어요. 링크를 길게 눌러 직접 복사해 주세요.");
    }
  }, [shareUrl]);

  const handleReset = useCallback(() => {
    window.location.href = window.location.origin + "/";
  }, []);

  const handleNudgeSelected = useCallback(
    (delta: number) => handleNudge(selectedSide, delta),
    [handleNudge, selectedSide],
  );

  useKeyboardShortcuts({
    enabled: isEditing,
    onNudge: handleNudgeSelected,
    onTogglePlay: handleTogglePlay,
  });

  const showInputs = !idA || !idB;
  const playerWrap =
    layout === "row" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "flex flex-col gap-4";

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-5 px-4 py-8 ${
        layout === "row" && ready ? "max-w-5xl" : "max-w-2xl"
      }`}
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">SyncTube</h1>
        <p className="text-sm text-white/50">
          두 영상의 싱크를 맞추고 링크로 공유하세요.
        </p>
      </header>

      {showInputs && (
        <UrlInputs
          urlA={urlA}
          urlB={urlB}
          error={error}
          onChangeA={setUrlA}
          onChangeB={setUrlB}
          onLoad={handleLoad}
        />
      )}

      {idA && idB && (
        <>
          <div className={playerWrap}>
            <div className="flex flex-col gap-2">
              <PlayerFrame
                videoId={idA}
                label="위 영상"
                audible={muted === "b"}
                selectable={!isViewer}
                selected={selectedSide === "a"}
                onSelect={() => setSelectedSide("a")}
                onReady={players.registerA}
              />
              {!isViewer && (
                <NudgeControls
                  label="위 영상"
                  onNudge={(delta) => handleNudge("a", delta)}
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <PlayerFrame
                videoId={idB}
                label="아래 영상"
                audible={muted === "a"}
                selectable={!isViewer}
                selected={selectedSide === "b"}
                onSelect={() => setSelectedSide("b")}
                onReady={players.registerB}
              />
              {!isViewer && (
                <NudgeControls
                  label="아래 영상"
                  onNudge={(delta) => handleNudge("b", delta)}
                />
              )}
            </div>
          </div>

          {!isViewer && (
            <>
              <OffsetControl offset={liveOffset} onApply={handleApplyOffset} />
              <p className="text-xs text-white/40">
                영상을 <strong className="text-white/60">선택</strong>한 뒤
                키보드 ← → (Shift +1초), Space로 동시 재생. 재생바·미세조정으로
                싱크를 맞춘 뒤 &ldquo;이 싱크로 URL 만들기&rdquo;를 누르세요.
              </p>
            </>
          )}

          {!showInputs && error && (
            <p className="text-sm text-rose-400">{error}</p>
          )}

          <Controls
            isViewer={isViewer}
            isPlaying={isPlaying}
            muted={muted}
            layout={layout}
            shareUrl={shareUrl}
            copied={copied}
            fromStart={fromStart}
            onPlay={handlePlay}
            onPause={handlePause}
            onToggleMute={handleToggleMute}
            onToggleLayout={handleToggleLayout}
            onToggleFromStart={setFromStart}
            onCapture={handleCapture}
            onCopy={handleCopy}
            onReset={handleReset}
          />
        </>
      )}
    </div>
  );
}
