import { lv } from "@/content/lv";
import { DealsPanel } from "../deals/DealsPanel";
import type { SizeOption } from "@/lib/filter";
import type { Pizza } from "@/lib/types";
import { LuckyButton } from "./LuckyButton";
import { PeopleControl } from "./PeopleControl";
import { Recommendation } from "./Recommendation";
import { RulesPanel } from "./RulesPanel";
import { SizePicker } from "./SizePicker";

/** Server shell for the calculator; the interactive parts are client leaves. */
export function Planner({ sizes, luckyPool }: { sizes: SizeOption[]; luckyPool: Pizza[] }) {
  return (
    <section aria-label={lv.planner.sectionLabel} className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-5xl">{lv.planner.title}</h1>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted">{lv.planner.lead}</p>
      </div>

      {/* One control row: every block has its label on the same line and the same height below it. */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-6 lg:grid-cols-[auto_minmax(0,0.85fr)_minmax(0,2.4fr)]">
        <PeopleControl />
        <Recommendation />
        <div className="col-span-2 lg:col-span-1">
          <SizePicker sizes={sizes} />
        </div>
      </div>

      <LuckyButton pool={luckyPool} />

      <div className="flex flex-col gap-3">
        <RulesPanel />
        <DealsPanel />
      </div>
    </section>
  );
}
