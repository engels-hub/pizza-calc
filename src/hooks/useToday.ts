"use client";

import { useStore } from "@/lib/store";

/** Today's date in Riga as YYYY-MM-DD, decided by the server for this request. */
export function useToday(): string {
  return useStore((s) => s.today);
}
