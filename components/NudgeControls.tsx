"use client";

const STEPS = [-1, -0.1, 0.1, 1] as const;

interface NudgeControlsProps {
  label: string;
  onNudge: (deltaSeconds: number) => void;
}

function formatStep(delta: number): string {
  const sign = delta > 0 ? "+" : "−";
  return `${sign}${Math.abs(delta)}s`;
}

export function NudgeControls({ label, onNudge }: NudgeControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <span className="text-xs text-white/40">{label} 미세조정</span>
      {STEPS.map((delta) => (
        <button
          key={delta}
          type="button"
          onClick={() => onNudge(delta)}
          className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
        >
          {delta < 0 ? "◀ " : ""}
          {formatStep(delta)}
          {delta > 0 ? " ▶" : ""}
        </button>
      ))}
    </div>
  );
}
