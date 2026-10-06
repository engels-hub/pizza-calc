"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * The page is prerendered with default state; the saved cart and rules are
 * restored from localStorage after mount so server and client HTML match.
 */
export function StoreHydrator() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);
  return null;
}
