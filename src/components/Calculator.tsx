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
import { MobileTicket } from "./MobileTicket";
import { OrderTicket } from "./OrderTicket";
import { Planner } from "./Planner";
import { PizzaShowcase } from "./PizzaShowcase";

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

      <main className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-32 md:px-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)] xl:gap-14 xl:pb-16">
        <div className="flex min-w-0 flex-col gap-12">
          <section className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:items-start" aria-label="Aprēķins">
            <PizzaShowcase pizzas={menu.pizzas} />
            <Planner sizes={sizes} />
          </section>
          <MenuBrowser pizzas={menu.pizzas} />
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl bg-surface p-5 shadow-soft" data-fly-target>
            <OrderTicket promos={promos} today={today} />
          </div>
        </aside>
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-36 text-xs leading-relaxed text-muted md:px-8 xl:pb-10">
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

      <MobileTicket promos={promos} today={today} />
      <FlyLayer />
    </>
  );
}
