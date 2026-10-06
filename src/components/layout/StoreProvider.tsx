"use client";

import { useEffect, useState } from "react";
import { PREFS_COOKIE, PREFS_MAX_AGE, encodePrefs, savedFromLines } from "@/lib/prefs";
import { StoreContext, createAppStore, type InitialState, type Persisted, type State } from "@/lib/store";

const LEGACY_KEY = "picu-kalkulators";

function persisted(s: State): Persisted {
  return {
    people: s.people,
    rules: s.rules,
    size: s.size,
    cart: s.cart,
    activePromos: s.activePromos,
    custom: s.custom,
  };
}

function writeCookie(s: State) {
  const value = encodePrefs({ ...persisted(s), cart: savedFromLines(s.cart) });
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${PREFS_COOKIE}=${value}; Path=/; Max-Age=${PREFS_MAX_AGE}; SameSite=Lax${secure}`;
}

/**
 * Creates this page's store from what the server read out of the prefs cookie,
 * and keeps the cookie in sync so the next request renders the same state.
 */
export function StoreProvider({ initial, children }: { initial: InitialState; children: React.ReactNode }) {
  const [store] = useState(() => createAppStore(initial));

  useEffect(() => {
    let timer = 0;
    const unsubscribe = store.subscribe((next, prev) => {
      const changed = (Object.keys(persisted(next)) as (keyof Persisted)[]).some((k) => next[k] !== prev[k]);
      if (!changed) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => writeCookie(store.getState()), 250);
    });

    // One-time move from the old localStorage save. The cookie is written
    // before the old entry is removed, so a reload in between loses nothing.
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const old = JSON.parse(legacy)?.state as Partial<Persisted> | undefined;
        if (old && Array.isArray(old.cart) && store.getState().cart.length === 0) {
          store.setState(old);
          writeCookie(store.getState());
        }
        localStorage.removeItem(LEGACY_KEY);
      }
    } catch {
      // Storage blocked or corrupt; nothing to migrate.
    }

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [store]);

  return <StoreContext value={store}>{children}</StoreContext>;
}
