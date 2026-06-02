"use client";

import { useState } from "react";

const STEPS = [-1, -0.1, 0.1, 1] as const;

interface OffsetControlProps {
  offset: number;
  onNudge: (delta: number) => void;
  onApply: (value: number) => void;
}

function formatStep(delta: number): string {
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta)}s`;
}

function formatOffset(offset: number): string {
  return `${offset >= 0 ? "+" : "−"}${Math.abs(offset).toFixed(2)}s`;
}

export function OffsetControl({ offset, onNudge, onApply }: OffsetControlProps) {
  const [input, setInput] = useState("");

  const handleApply = () => {
    const value = Number.parseFloat(input);
    if (Number.isFinite(value)) onApply(value);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">오프셋 (아래 − 위)</span>
        <span className="font-mono text-lg font-bold text-sky-300">
          {formatOffset(offset)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onNudge(delta)}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            {formatStep(delta)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApply();
            }}
            placeholder="직접 입력"
            aria-label="오프셋 직접 입력 (초)"
            className="w-28 rounded-lg bg-black/40 px-3 py-1.5 text-sm text-white outline-none ring-1 ring-white/15 focus:ring-sky-400"
          />
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-sky-400"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
