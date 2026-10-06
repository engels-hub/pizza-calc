"use client";

import { CaretDownIcon, SealPercentIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { lv } from "@/content/lv";
import { PROMOS } from "@/data/promos";
import { useToday } from "@/hooks/useToday";
import { useTotals } from "@/hooks/useTotals";
import { isPromoActive } from "@/lib/discounts";
import { euro } from "@/lib/format";
import { spring } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { Collapse } from "../ui/Collapse";
import { DealsList } from "./DealsList";

/** Deals and the user's own discount, folded away until needed. */
export function DealsPanel() {
  const [open, setOpen] = useState(false);
  const today = useToday();
  const active = useStore((s) => s.activePromos);
  const custom = useStore((s) => s.custom);
  const { saved } = useTotals();
  const count = PROMOS.filter((p) => active.includes(p.id) && isPromoActive(p, today)).length + (custom ? 1 : 0);

  return (
    <div className="rounded-2xl bg-sunken/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="deals-panel"
        className="flex min-h-12 w-full items-center gap-3 px-4 text-left"
      >
        <SealPercentIcon size={18} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 py-2">
          <span className="block text-sm font-medium">{lv.summary.discounts}</span>
          <span className={`block text-xs ${count ? "text-accent" : "text-muted"}`}>
            {count ? lv.summary.dealsActive(count, saved > 0 ? euro(saved) : null) : lv.summary.dealsNone}
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="text-muted">
          <CaretDownIcon size={16} />
        </motion.span>
      </button>

      <Collapse open={open} id="deals-panel">
        <div className="px-4 pb-4">
          <DealsList />
        </div>
      </Collapse>
    </div>
  );
}
