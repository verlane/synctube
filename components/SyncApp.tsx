"use client";

import { useCallback, useMemo, useState } from "react";
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
import { OffsetControl } from "./OffsetControl";
import { PlayPrompt } from "./PlayPrompt";
import { UrlInputs } from "./UrlInputs";
import { Controls } from "./Controls";

export function SyncApp() {
  const searchParams = useSearchParams();
  const players = useSyncedPlayers();

  const shared = useMemo<ShareState | null>(
    () => parseShareState(searchParams),
    [searchParams],
  );
  const [forceEdit, setForceEdit] = useState(false);
  const isViewer = shared !== null && !forceEdit;

  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [idA, setIdA] = useState<string | null>(shared?.a ?? null);
  const [idB, setIdB] = useState<string | null>(shared?.b ?? null);
  const [muted, setMuted] = useState<MutedSide>(shared?.muted ?? "b");
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [fromStart, setFromStart] = useState(true);
  const [layout, setLayout] = useState<LayoutMode>(shared?.layout ?? "col");
  const [offset, setOffsetState] = useState(shared?.offset ?? 0);

  const ready = Boolean(idA && idB);
  const isEditing = !isViewer && ready;

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
    setOffsetState(0);
    setIdA(a);
    setIdB(b);
  }, [urlA, urlB]);

  const handlePlay = useCallback(() => {
    if (isViewer && shared) {
      players.playSynced(
        { startA: shared.startA, offset: shared.offset },
        muted,
      );
    } else {
      // Editor preview: B is already positioned via setOffset/seek, play as-is.
      players.playBoth(muted);
    }
    setIsPlaying(true);
    setHasPlayed(true);
  }, [players, shared, muted, isViewer]);

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

  // Offset is the single source of truth; every adjustment writes state then
  // repositions B from A. No reading back from the player, so no jitter.
  const handleApplyOffset = useCallback(
    (value: number) => {
      const rounded = Math.round(value * 100) / 100;
      setOffsetState(rounded);
      players.setOffset(rounded);
      setShareUrl(null);
    },
    [players],
  );

  const handleNudgeOffset = useCallback(
    (delta: number) => handleApplyOffset(offset + delta),
    [handleApplyOffset, offset],
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
    if (!idA || !idB) {
      setError("영상을 먼저 불러와 주세요.");
      return;
    }
    // "처음부터 재생"은 정렬을 유지한 채 둘 중 이른 영상을 0초에 맞춘다.
    const startA = fromStart ? Math.max(0, -offset) : players.getStartA();
    const state: ShareState = {
      a: idA,
      b: idB,
      offset,
      startA,
      muted,
      layout,
    };
    const query = encodeShareState(state);
    setShareUrl(`${window.location.origin}/?${query}`);
    setError(null);
    setCopied(false);
  }, [players, idA, idB, muted, fromStart, layout, offset]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setError("클립보드 복사에 실패했어요. 링크를 길게 눌러 직접 복사해 주세요.");
    }
  }, [shareUrl]);

  const handleSeekBoth = useCallback(
    (delta: number) => players.seekBothBy(delta),
    [players],
  );

  // Switch a shared link into editing while keeping the videos and sync loaded.
  const handleEdit = useCallback(() => {
    players.pauseBoth();
    setIsPlaying(false);
    players.setOffset(offset);
    setForceEdit(true);
  }, [players, offset]);

  // Full reset to a blank editor (to load different videos).
  const handleNewStart = useCallback(() => {
    window.location.href = window.location.origin + "/";
  }, []);

  useKeyboardShortcuts({
    enabled: isEditing,
    onNudge: handleNudgeOffset,
    onTogglePlay: handleTogglePlay,
  });

  const showInputs = !idA || !idB;
  const playerWrap =
    layout === "row"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : "flex flex-col gap-4";

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
            <PlayerFrame
              videoId={idA}
              label="위 영상"
              audible={muted === "b"}
              onReady={players.registerA}
            />
            <PlayerFrame
              videoId={idB}
              label="아래 영상"
              audible={muted === "a"}
              onReady={players.registerB}
            />
          </div>

          {!isViewer && (
            <>
              <OffsetControl
                offset={offset}
                onNudge={handleNudgeOffset}
                onApply={handleApplyOffset}
              />
              <p className="text-xs text-white/40">
                오프셋 버튼·직접 입력으로 싱크를 맞추세요. 키보드 ← → (Shift
                +1초)로 미세조정, Space로 동시 재생/정지. 맞춘 뒤 &ldquo;이 싱크로
                URL 만들기&rdquo;를 누르세요.
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
            onSeekBoth={handleSeekBoth}
            onToggleMute={handleToggleMute}
            onToggleLayout={handleToggleLayout}
            onToggleFromStart={setFromStart}
            onCapture={handleCapture}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onNewStart={handleNewStart}
          />
        </>
      )}

      {isViewer && ready && !hasPlayed && (
        <PlayPrompt muted={muted} onPlay={handlePlay} onEdit={handleEdit} />
      )}
    </div>
  );
}
