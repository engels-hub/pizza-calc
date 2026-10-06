"use client";

import { lv } from "@/content/lv";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-start justify-center gap-4 px-4">
      <h1 className="text-3xl font-semibold tracking-tighter">{lv.error.title}</h1>
      <p className="text-muted">{lv.error.body}</p>
      <button
        type="button"
        onClick={reset}
        className="bevel bevel-accent min-h-11 px-5 text-sm font-medium"
      >
        {lv.error.retry}
      </button>
    </main>
  );
}
