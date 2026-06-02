import { isValidVideoId } from "./youtube";

export type MutedSide = "a" | "b";
export type LayoutMode = "col" | "row";

export interface ShareState {
  a: string;
  b: string;
  offset: number;
  startA: number;
  muted: MutedSide;
  layout: LayoutMode;
}

function roundSeconds(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function parseNumber(raw: string | null): number {
  if (raw === null) return 0;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Serializes the share state into a query string (without a leading "?"). */
export function encodeShareState(state: ShareState): string {
  const params = new URLSearchParams();
  params.set("a", state.a);
  params.set("b", state.b);
  params.set("o", roundSeconds(state.offset));
  params.set("s", roundSeconds(state.startA));
  params.set("m", state.muted);
  params.set("l", state.layout);
  return params.toString();
}

/** Parses a share state from search params, or null when video ids are missing. */
export function parseShareState(params: URLSearchParams): ShareState | null {
  const a = params.get("a");
  const b = params.get("b");
  if (!a || !b || !isValidVideoId(a) || !isValidVideoId(b)) return null;

  const muted = params.get("m") === "b" ? "b" : "a";
  const layout = params.get("l") === "row" ? "row" : "col";

  return {
    a,
    b,
    offset: parseNumber(params.get("o")),
    startA: parseNumber(params.get("s")),
    muted,
    layout,
  };
}
