import { Suspense } from "react";
import type { Metadata } from "next";
import { SyncApp } from "@/components/SyncApp";
import { isValidVideoId } from "@/lib/youtube";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const a = typeof sp.a === "string" ? sp.a : "";
  const b = typeof sp.b === "string" ? sp.b : "";

  if (!isValidVideoId(a) || !isValidVideoId(b)) return {};

  const ogUrl = `/og?a=${a}&b=${b}`;
  return {
    openGraph: {
      title: "SyncTube",
      description: "두 영상이 싱크에 맞춰 동시에 재생됩니다.",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogUrl],
    },
  };
}

export default function Home() {
  return (
    <main className="min-h-dvh w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <Suspense fallback={<div className="p-8 text-white/50">불러오는 중…</div>}>
        <SyncApp />
      </Suspense>
    </main>
  );
}
