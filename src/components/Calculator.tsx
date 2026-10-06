"use client";

import { PizzaIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { Promo } from "@/lib/discounts";
import { sizeOptions } from "@/lib/filter";
import { shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { MenuData } from "@/lib/types";
import { FlyLayer } from "./FlyLayer";
import { MenuBrowser } from "./MenuBrowser";
import { BottomBar } from "./BottomBar";
import { Cart } from "./Cart";
import { Planner } from "./Planner";
import { Summary } from "./Summary";

const noop = () => () => {};

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Calculator({ menu, promos }: { menu: MenuData; promos: Promo[] }) {
  // The page is prerendered, so "today" is only known in the browser.
  const today = useSyncExternalStore(noop, localToday, () => null);
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  const sizes = useMemo(() => sizeOptions(menu.pizzas), [menu.pizzas]);

  return (
    <>
      <header className="mx-auto flex h-16 max-w-[1400px] items-center gap-2.5 px-4 md:px-8">
        <PizzaIcon size={24} weight="duotone" className="text-accent" />
        <span className="font-semibold tracking-tight">Picu kalkulators</span>
        <span className="ml-auto text-xs text-muted">
          {menu.stale ? `Cenas no ${shortDate(menu.fetchedAt)}` : `Cenas atjaunotas ${shortDate(menu.fetchedAt)}`}
        </span>
      </header>

      <main className="mx-auto flex max-w-[1400px] flex-col gap-12 px-4 pb-32 md:px-8 lg:gap-16 lg:pb-16">
        <Planner sizes={sizes} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-4">
            <Cart pizzas={menu.pizzas} />
          </div>
          <MenuBrowser pizzas={menu.pizzas} />
        </div>

        <Summary promos={promos} today={today} />
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-36 text-xs leading-relaxed text-muted md:px-8 lg:pb-10">
        Cenas no{" "}
        <a className="underline decoration-line underline-offset-2 hover:text-ink" href="https://www.picudarbnica.lv/picas/" target="_blank" rel="noreferrer">
          picudarbnica.lv
        </a>{" "}
        un{" "}
        <a className="underline decoration-line underline-offset-2 hover:text-ink" href="https://www.lulu.lv/picas" target="_blank" rel="noreferrer">
          lulu.lv
        </a>
        . Pasūtījumu veic pašā picērijā, šeit tikai aprēķins.
      </footer>

      <BottomBar promos={promos} today={today} />
      <FlyLayer />
    </>
  );
}
