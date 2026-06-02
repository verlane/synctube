"use client";

import { useEffect } from "react";

interface KeyboardShortcutHandlers {
  enabled: boolean;
  onNudge: (delta: number) => void;
  onTogglePlay: () => void;
}

const STEP_SMALL = 0.1;
const STEP_LARGE = 1;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * Global keyboard shortcuts for sync editing:
 * - ArrowLeft / ArrowRight: nudge selected player by ±0.1s
 * - Shift + Arrow: nudge by ±1s
 * - Space: toggle synced playback
 */
export function useKeyboardShortcuts({
  enabled,
  onNudge,
  onTogglePlay,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const step = event.shiftKey ? STEP_LARGE : STEP_SMALL;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNudge(-step);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNudge(step);
      } else if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onNudge, onTogglePlay]);
}
