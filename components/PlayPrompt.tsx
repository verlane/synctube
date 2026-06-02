"use client";

import type { MutedSide } from "@/lib/share-state";

interface PlayPromptProps {
  muted: MutedSide;
  onPlay: () => void;
  onEdit: () => void;
}

export function PlayPrompt({ muted, onPlay, onEdit }: PlayPromptProps) {
  const audibleLabel = muted === "a" ? "아래 영상" : "위 영상";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="동시 재생"
      onClick={onPlay}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/70 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onPlay}
        aria-label="동시 재생 시작"
        className="group flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-black shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-300/20 transition hover:scale-105 hover:bg-emerald-400"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="ml-1 h-12 w-12"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-lg font-semibold text-white">동시 재생</p>
        <p className="text-sm text-white/60">소리: {audibleLabel}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="text-sm text-white/50 underline-offset-4 transition hover:text-white hover:underline"
      >
        직접 만들기
      </button>
    </div>
  );
}
