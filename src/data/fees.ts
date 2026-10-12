import type { PizzeriaId } from "@/lib/types";

/**
 * Box charge per pizza, added at checkout and not covered by deals.
 * LuLū: 0,39 € for every size (Pus-Pus is one box). Not published on lulu.lv.
 */
export const BOX_FEES: Partial<Record<PizzeriaId, number>> = { lulu: 0.39 };
