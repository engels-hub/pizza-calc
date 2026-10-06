import { PizzaIcon } from "@phosphor-icons/react/ssr";
import { lv } from "@/content/lv";
import { shortDate } from "@/lib/format";

export function SiteHeader({ fetchedAt, stale }: { fetchedAt: string; stale: boolean }) {
  const date = shortDate(fetchedAt);
  return (
    <header className="mx-auto flex h-16 max-w-[1400px] items-center gap-2.5 px-4 md:px-8">
      <PizzaIcon size={24} weight="duotone" className="text-accent" />
      <span className="font-semibold tracking-tight">{lv.header.brand}</span>
      <span className="ml-auto text-xs text-muted">{stale ? lv.header.pricesFrom(date) : lv.header.pricesUpdated(date)}</span>
    </header>
  );
}
