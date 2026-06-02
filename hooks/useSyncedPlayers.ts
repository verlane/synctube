"use client";

import { useCallback, useEffect, useRef } from "react";
import type { YouTubePlayer } from "react-youtube";
import type { MutedSide } from "@/lib/share-state";

const DRIFT_CHECK_MS = 500;
const DRIFT_TOLERANCE_SEC = 0.3;
const PLAYER_STATE_PLAYING = 1;

export interface SyncSnapshot {
  startA: number;
  offset: number;
}

/**
 * Holds references to the two YouTube players and drives synced playback:
 * - captureSync() reads the current manual alignment
 * - playSynced() seeks both to the aligned positions and starts drift correction
 * - applyMute() enforces the single-audible-side rule
 */
export function useSyncedPlayers() {
  const playerARef = useRef<YouTubePlayer | null>(null);
  const playerBRef = useRef<YouTubePlayer | null>(null);
  const driftTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Accumulated seek target per side while paused. YouTube rounds getCurrentTime()
  // to the nearest decoded frame when paused, so sub-second nudges must be summed
  // by us instead of re-read from the player each click.
  const nudgeTargetRef = useRef<{ a: number | null; b: number | null }>({
    a: null,
    b: null,
  });

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

  const nudge = useCallback((side: MutedSide, deltaSeconds: number) => {
    const player = side === "a" ? playerARef.current : playerBRef.current;
    if (!player) return;
    const isPlaying = player.getPlayerState() === PLAYER_STATE_PLAYING;
    const pending = nudgeTargetRef.current[side];
    const base =
      isPlaying || pending === null ? player.getCurrentTime() : pending;
    const next = Math.max(0, base + deltaSeconds);
    player.seekTo(next, true);
    // Keep accumulating while paused; reset to live time once playing.
    nudgeTargetRef.current[side] = isPlaying ? null : next;
  }, []);

  const resetNudgeTargets = useCallback(() => {
    nudgeTargetRef.current = { a: null, b: null };
  }, []);

  const captureSync = useCallback((): SyncSnapshot | null => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return null;
    const startA = a.getCurrentTime();
    return { startA, offset: b.getCurrentTime() - startA };
  }, []);

  const getOffset = useCallback((): number | null => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return null;
    return b.getCurrentTime() - a.getCurrentTime();
  }, []);

  /** Repositions B so that offset (timeB - timeA) equals the given value. */
  const setOffset = useCallback((value: number) => {
    const a = playerARef.current;
    const b = playerBRef.current;
    if (!a || !b) return;
    b.seekTo(Math.max(0, a.getCurrentTime() + value), true);
    nudgeTargetRef.current = { a: null, b: null };
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
      resetNudgeTargets();
      startDriftCorrection(offset);
    },
    [applyMute, resetNudgeTargets, startDriftCorrection],
  );

  /** Plays both players from their current positions without drift correction (editor preview). */
  const playBoth = useCallback(
    (muted: MutedSide) => {
      stopDriftCorrection();
      applyMute(muted);
      playerARef.current?.playVideo();
      playerBRef.current?.playVideo();
      resetNudgeTargets();
    },
    [applyMute, resetNudgeTargets, stopDriftCorrection],
  );

  const pauseBoth = useCallback(() => {
    stopDriftCorrection();
    playerARef.current?.pauseVideo();
    playerBRef.current?.pauseVideo();
    resetNudgeTargets();
  }, [resetNudgeTargets, stopDriftCorrection]);

  useEffect(() => stopDriftCorrection, [stopDriftCorrection]);

  return {
    registerA,
    registerB,
    nudge,
    getOffset,
    setOffset,
    captureSync,
    playSynced,
    playBoth,
    pauseBoth,
    applyMute,
  };
}
