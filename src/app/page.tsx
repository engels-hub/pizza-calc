import { BottomBar } from "@/components/cart/BottomBar";
import { Cart } from "@/components/cart/Cart";
import { FlyLayer } from "@/components/cart/FlyLayer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { Planner } from "@/components/planner/Planner";
import { Summary } from "@/components/summary/Summary";
import { sizeOptions } from "@/lib/filter";
import { getMenus } from "@/lib/menu";

export default async function Page() {
  const menu = await getMenus();

  return (
    <>
      <StoreHydrator />
      <SiteHeader fetchedAt={menu.fetchedAt} stale={menu.stale} />

      <main className="mx-auto flex max-w-[1400px] flex-col gap-12 px-4 pb-32 md:px-8 lg:gap-16 lg:pb-16">
        <Planner sizes={sizeOptions(menu.pizzas)} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-4">
            <Cart pizzas={menu.pizzas} />
          </div>
          <MenuBrowser pizzas={menu.pizzas} />
        </div>

        <Summary />
      </main>

      <SiteFooter />
      <BottomBar />
      <FlyLayer />
    </>
  );
}
