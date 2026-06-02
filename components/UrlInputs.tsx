"use client";

interface UrlInputsProps {
  urlA: string;
  urlB: string;
  error: string | null;
  onChangeA: (value: string) => void;
  onChangeB: (value: string) => void;
  onLoad: () => void;
}

export function UrlInputs({
  urlA,
  urlB,
  error,
  onChangeA,
  onChangeB,
  onLoad,
}: UrlInputsProps) {
  return (
    <form
      className="flex flex-col gap-3 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
      onSubmit={(e) => {
        e.preventDefault();
        onLoad();
      }}
    >
      <label className="flex flex-col gap-1 text-sm text-white/70">
        위 영상 링크
        <input
          value={urlA}
          onChange={(e) => onChangeA(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="rounded-lg bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus:ring-emerald-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-white/70">
        아래 영상 링크
        <input
          value={urlB}
          onChange={(e) => onChangeB(e.target.value)}
          placeholder="https://youtu.be/..."
          className="rounded-lg bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus:ring-emerald-400"
        />
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        className="mt-1 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black transition hover:bg-emerald-400"
      >
        영상 불러오기
      </button>
    </form>
  );
}
