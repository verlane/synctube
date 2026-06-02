"use client";

import YouTube, { type YouTubePlayer, type YouTubeProps } from "react-youtube";

interface PlayerFrameProps {
  videoId: string;
  label: string;
  audible: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onReady: (player: YouTubePlayer) => void;
}

const PLAYER_OPTS: YouTubeProps["opts"] = {
  playerVars: {
    controls: 1,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
  },
};

export function PlayerFrame({
  videoId,
  label,
  audible,
  selectable = false,
  selected = false,
  onSelect,
  onReady,
}: PlayerFrameProps) {
  const ring = selected
    ? "ring-2 ring-sky-400"
    : "ring-1 ring-white/10";
  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg ${ring}`}
    >
      <span
        className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
          audible
            ? "bg-emerald-500/90 text-black"
            : "bg-black/60 text-white/70"
        }`}
      >
        {label} {audible ? "🔊" : "🔇"}
      </span>
      {selectable && (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold transition ${
            selected
              ? "bg-sky-400 text-black"
              : "bg-black/60 text-white/70 hover:bg-black/80"
          }`}
        >
          {selected ? "선택됨" : "선택"}
        </button>
      )}
      <YouTube
        videoId={videoId}
        opts={PLAYER_OPTS}
        onReady={(event) => onReady(event.target)}
        className="h-full w-full"
        iframeClassName="h-full w-full"
      />
    </div>
  );
}
