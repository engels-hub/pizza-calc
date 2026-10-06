"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Today's local date as YYYY-MM-DD. Null during prerender, since the page is static. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, localToday, () => null);
}
