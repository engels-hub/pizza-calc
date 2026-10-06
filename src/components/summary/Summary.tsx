import { ReceiptIcon } from "@phosphor-icons/react/ssr";
import { lv } from "@/content/lv";
import { DiscountPanel } from "./DiscountPanel";
import { PizzeriaSubtotals } from "./PizzeriaSubtotals";
import { TotalsBlock } from "./TotalsBlock";

export function Summary() {
  return (
    <section id="summary" aria-labelledby="summary-title" className="scroll-mt-6 rounded-3xl bg-surface p-5 shadow-soft md:p-7">
      <div className="mb-5 flex items-center gap-3">
        <ReceiptIcon size={22} className="text-muted" />
        <h2 id="summary-title" className="text-xl font-semibold tracking-tight md:text-2xl">
          {lv.summary.title}
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-12">
        <DiscountPanel />
        <div className="md:self-end">
          <PizzeriaSubtotals />
          <TotalsBlock />
        </div>
      </div>
    </section>
  );
}
