"use client";

import { PizzaIcon } from "@phosphor-icons/react";
import { lv } from "@/content/lv";
import { shareOf } from "@/lib/calc";
import { wholeNumber } from "@/lib/format";
import { useStore } from "@/lib/store";

/** How the cart splits between the people: slices each and area each. */
export function SliceShare({ withHint = false, className = "" }: { withHint?: boolean; className?: string }) {
  const cart = useStore((s) => s.cart);
  const people = useStore((s) => s.people);
  if (cart.length === 0) return null;

  const share = shareOf(cart, people);
  const slices =
    share.extraCount === 0 ? lv.share.even(share.base) : lv.share.uneven(share.baseCount, share.base, share.extraCount);

  return (
    <div className={`flex items-start gap-2.5 text-sm ${className}`}>
      <PizzaIcon size={18} className="mt-px shrink-0 text-muted" aria-hidden />
      <p>
        <span className="font-medium">{slices}</span>
        <span className="text-muted">, {lv.share.area(wholeNumber(share.areaEach), share.extraCount === 0)}</span>
        {withHint && <span className="mt-1 block text-xs text-muted">{lv.share.hint}</span>}
      </p>
    </div>
  );
}
