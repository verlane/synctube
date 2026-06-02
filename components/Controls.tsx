"use client";

import type { LayoutMode, MutedSide } from "@/lib/share-state";

interface ControlsProps {
  isViewer: boolean;
  isPlaying: boolean;
  muted: MutedSide;
  layout: LayoutMode;
  shareUrl: string | null;
  copied: boolean;
  fromStart: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeekBoth: (delta: number) => void;
  onToggleMute: () => void;
  onToggleLayout: () => void;
  onToggleFromStart: (value: boolean) => void;
  onCapture: () => void;
  onCopy: () => void;
  onReset: () => void;
}

const btnBase =
  "rounded-lg px-4 py-2 font-semibold transition disabled:opacity-40";

const SEEK_STEPS = [-10, -5, 5, 10] as const;

function formatSeek(delta: number): string {
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta)}s`;
}

export function Controls({
  isViewer,
  isPlaying,
  muted,
  layout,
  shareUrl,
  copied,
  fromStart,
  onPlay,
  onPause,
  onSeekBoth,
  onToggleMute,
  onToggleLayout,
  onToggleFromStart,
  onCapture,
  onCopy,
  onReset,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="flex flex-wrap items-center gap-3">
        {isPlaying ? (
          <button
            className={`${btnBase} bg-amber-400 text-black hover:bg-amber-300`}
            onClick={onPause}
          >
            ⏸ 정지
          </button>
        ) : (
          <button
            className={`${btnBase} bg-emerald-500 text-black hover:bg-emerald-400`}
            onClick={onPlay}
          >
            ▶ 동시 재생
          </button>
        )}

        <div className="flex items-center gap-1.5">
          {SEEK_STEPS.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => onSeekBoth(delta)}
              title="두 영상을 동시에 이동"
              className="rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {formatSeek(delta)}
            </button>
          ))}
        </div>

        <button
          className={`${btnBase} bg-white/10 text-white hover:bg-white/20`}
          onClick={onToggleMute}
        >
          소리: {muted === "a" ? "아래 영상" : "위 영상"}
        </button>

        <button
          className={`${btnBase} bg-white/10 text-white hover:bg-white/20`}
          onClick={onToggleLayout}
        >
          {layout === "col" ? "위아래" : "좌우"}
        </button>

        {!isViewer && (
          <>
            <button
              className={`${btnBase} bg-sky-500 text-black hover:bg-sky-400`}
              onClick={onCapture}
            >
              이 싱크로 URL 만들기
            </button>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={fromStart}
                onChange={(e) => onToggleFromStart(e.target.checked)}
                className="h-4 w-4 accent-sky-400"
              />
              처음부터 재생
            </label>
          </>
        )}

        {isViewer && (
          <button
            className={`${btnBase} bg-white/10 text-white hover:bg-white/20`}
            onClick={onReset}
          >
            직접 만들기
          </button>
        )}
      </div>

      {shareUrl && (
        <div className="flex flex-col gap-2 rounded-lg bg-black/40 p-3 ring-1 ring-white/10">
          <span className="text-xs text-white/50">공유 링크</span>
          <div className="flex items-center gap-2">
            <input
              readOnly
              aria-label="공유 링크"
              value={shareUrl}
              className="flex-1 truncate rounded bg-black/40 px-2 py-1 text-sm text-emerald-300 outline-none"
            />
            <button
              className={`${btnBase} bg-emerald-500 px-3 py-1 text-sm text-black hover:bg-emerald-400`}
              onClick={onCopy}
            >
              {copied ? "복사됨!" : "복사"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
