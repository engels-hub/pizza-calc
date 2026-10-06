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
import { sizeOptions } from "@/lib/filter";
import { getMenus } from "@/lib/menu";
import {
  PREFS_COOKIE,
  decodePrefs,
  hasUrlState,
  linesFromSaved,
  pizzeriaFromSearch,
  prefsFromSearch,
  rigaToday,
  type SearchParams,
} from "@/lib/prefs";
import type { MenuData } from "@/lib/types";

/**
 * Partial prerendering: the header, footer and menu data are cached and
 * served as a static shell; the calculator depends on the address and the
 * prefs cookie, so it renders per request inside a Suspense boundary and
 * streams into the same response.
 */
export default async function Page({ searchParams }: PageProps<"/">) {
  const menu = await getMenus();

  return (
    <>
      <SiteHeader fetchedAt={menu.fetchedAt} stale={menu.stale} />
      <Suspense fallback={<CalculatorSkeleton />}>
        <PersonalCalculator menu={menu} searchParams={searchParams} />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function PersonalCalculator({ menu, searchParams }: { menu: MenuData; searchParams: Promise<SearchParams> }) {
  // The address wins: it holds this tab's order (or a shared link). A bare
  // address starts from the cookie, i.e. the visitor's last order.
  const sp = await searchParams;
  const prefs = hasUrlState(sp) ? prefsFromSearch(sp) : decodePrefs((await cookies()).get(PREFS_COOKIE)?.value);
  const initial = {
    ...prefs,
    cart: linesFromSaved(prefs.cart, menu.pizzas),
    pizzeria: pizzeriaFromSearch(sp),
    today: rigaToday(),
  };

  return (
    <StoreProvider initial={initial}>
      <main className="reveal mx-auto flex max-w-[1400px] flex-col gap-12 px-4 pb-24 md:px-8 lg:gap-16 lg:pb-16">
        <Planner sizes={sizeOptions(menu.pizzas)} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-4">
            <Cart pizzas={menu.pizzas} />
          </div>
          <MenuBrowser pizzas={menu.pizzas} />
        </div>
      </main>
      <BottomBar />
      <FlyLayer />
    </StoreProvider>
  );
}
