"use client";

import { useCallback, useEffect, useRef } from "react";
import type { YouTubePlayer } from "react-youtube";
import type { MutedSide } from "@/lib/share-state";

const DRIFT_CHECK_MS = 500;
const DRIFT_TOLERANCE_SEC = 0.3;

export interface SyncSnapshot {
  startA: number;
  offset: number;
}

/**
 * Holds references to the two YouTube players and drives synced playback.
 * Offset (timeB - timeA) is owned by the caller as a single value; setOffset()
 * positions B relative to A so editing stays deterministic and jitter-free.
 */
export function useSyncedPlayers() {
  const playerARef = useRef<YouTubePlayer | null>(null);
  const playerBRef = useRef<YouTubePlayer | null>(null);
  const driftTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const registerA = useCallback((player: YouTubePlayer) => {
    playerARef.current = player;
  }, []);

  const registerB = useCallback((player: YouTubePlayer) => {
    playerBRef.current = player;
  }, []);

  const stopDriftCorrection = useCallback(() => {
    if (driftTimer.current) {
      clearInterval(driftTimer.current);
      driftTimer.current = null;
    }
  }, []);

  const startDriftCorrection = useCallback(
    (offset: number) => {
      stopDriftCorrection();
      driftTimer.current = setInterval(() => {
        const a = playerARef.current;
        const b = playerBRef.current;
        if (!a || !b) return;
        const target = a.getCurrentTime() + offset;
        if (Math.abs(b.getCurrentTime() - target) > DRIFT_TOLERANCE_SEC) {
          b.seekTo(target, true);
        }
      }, DRIFT_CHECK_MS);
    },
    [stopDriftCorrection],
  );

  /** Reads A's current position; offset is owned by the caller as state. */
  const getStartA = useCallback((): number => {
    return playerARef.current?.getCurrentTime() ?? 0;
  }, []);

  /** Repositions B so that offset (timeB - timeA) equals the given value. */
  const setOffset = useCallback((value: number) => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return;
    b.seekTo(Math.max(0, a.getCurrentTime() + value), true);
  }, []);

  /** Seeks both players by the same delta, preserving their offset. */
  const seekBothBy = useCallback((deltaSeconds: number) => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return;
    const timeA = a.getCurrentTime();
    const timeB = b.getCurrentTime();
    // Clamp so the earlier of the two never goes below 0, keeping offset intact.
    const delta = Math.max(deltaSeconds, -Math.min(timeA, timeB));
    a.seekTo(timeA + delta, true);
    b.seekTo(timeB + delta, true);
  }, []);

  const applyMute = useCallback((muted: MutedSide) => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return;
    if (muted === "a") {
      a.mute();
      b.unMute();
    } else {
      b.mute();
      a.unMute();
    }
  }, []);

  const playSynced = useCallback(
    ({ startA, offset }: SyncSnapshot, muted: MutedSide) => {
      const a = playerARef.current;
      const b = playerBRef.current;
      if (!a || !b) return;
      a.seekTo(startA, true);
      b.seekTo(startA + offset, true);
      applyMute(muted);
      a.playVideo();
      b.playVideo();
      startDriftCorrection(offset);
    },
    [applyMute, startDriftCorrection],
  );

  /** Plays both from their current positions without drift correction (editor preview). */
  const playBoth = useCallback(
    (muted: MutedSide) => {
      stopDriftCorrection();
      applyMute(muted);
      playerARef.current?.playVideo();
      playerBRef.current?.playVideo();
    },
    [applyMute, stopDriftCorrection],
  );

  const pauseBoth = useCallback(() => {
    stopDriftCorrection();
    playerARef.current?.pauseVideo();
    playerBRef.current?.pauseVideo();
  }, [stopDriftCorrection]);

  useEffect(() => stopDriftCorrection, [stopDriftCorrection]);

  return {
    registerA,
    registerB,
    getStartA,
    setOffset,
    seekBothBy,
    playSynced,
    playBoth,
    pauseBoth,
    applyMute,
  };
}
