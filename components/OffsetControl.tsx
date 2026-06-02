"use client";

import { useState } from "react";

interface OffsetControlProps {
  offset: number | null;
  onApply: (value: number) => void;
}

function formatOffset(offset: number): string {
  const sign = offset >= 0 ? "+" : "−";
  return `${sign}${Math.abs(offset).toFixed(2)}s`;
}

export function OffsetControl({ offset, onApply }: OffsetControlProps) {
  const [input, setInput] = useState("");

  const handleApply = () => {
    const value = Number.parseFloat(input);
    if (Number.isFinite(value)) onApply(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
      <div className="flex flex-col">
        <span className="text-xs text-white/40">현재 오프셋 (아래 − 위)</span>
        <span className="font-mono text-lg font-bold text-sky-300">
          {offset === null ? "—" : formatOffset(offset)}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleApply();
          }}
          placeholder="예: 1.5"
          aria-label="오프셋 직접 입력 (초)"
          className="w-24 rounded-lg bg-black/40 px-3 py-1.5 text-sm text-white outline-none ring-1 ring-white/15 focus:ring-sky-400"
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
  );
}
