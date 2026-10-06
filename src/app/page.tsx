import { cookies } from "next/headers";
import { Suspense } from "react";
import { BottomBar } from "@/components/cart/BottomBar";
import { Cart } from "@/components/cart/Cart";
import { FlyLayer } from "@/components/cart/FlyLayer";
import { CalculatorSkeleton } from "@/components/layout/CalculatorSkeleton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StoreProvider } from "@/components/layout/StoreProvider";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { Planner } from "@/components/planner/Planner";
import { Summary } from "@/components/summary/Summary";
import { sizeOptions } from "@/lib/filter";
import { getMenus } from "@/lib/menu";
import { PREFS_COOKIE, decodePrefs, linesFromSaved, rigaToday } from "@/lib/prefs";
import type { MenuData } from "@/lib/types";

/**
 * Partial prerendering: the header, footer and menu data are cached and
 * served as a static shell; the calculator depends on the visitor's prefs
 * cookie, so it renders per request inside a Suspense boundary and streams
 * into the same response.
 */
export default async function Page() {
  const menu = await getMenus();

  return (
    <>
      <SiteHeader fetchedAt={menu.fetchedAt} stale={menu.stale} />
      <Suspense fallback={<CalculatorSkeleton />}>
        <PersonalCalculator menu={menu} />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function PersonalCalculator({ menu }: { menu: MenuData }) {
  const prefs = decodePrefs((await cookies()).get(PREFS_COOKIE)?.value);
  const initial = { ...prefs, cart: linesFromSaved(prefs.cart, menu.pizzas), today: rigaToday() };

  return (
    <StoreProvider initial={initial}>
      <main className="reveal mx-auto flex max-w-[1400px] flex-col gap-12 px-4 pb-32 md:px-8 lg:gap-16 lg:pb-16">
        <Planner sizes={sizeOptions(menu.pizzas)} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-4">
            <Cart pizzas={menu.pizzas} />
          </div>
          <MenuBrowser pizzas={menu.pizzas} />
        </div>

        <Summary />
      </main>
      <BottomBar />
      <FlyLayer />
    </StoreProvider>
  );
}
