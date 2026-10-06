import type { Promo } from "@/lib/discounts";

// From lulu.lv/jaunumi and picudarbnica.lv, checked 2026-10-06. Titles and
// notes live in src/content/lv.ts under `promos`, keyed by id.
// Expired codes stay listed (greyed out) so the pattern is visible.
export const PROMOS: Promo[] = [
  { id: "lulu-takeaway", pizzeriaId: "lulu", rule: { kind: "percent", value: 15 }, exclusiveGroup: "solo" },
  {
    id: "lulu-picrudens",
    pizzeriaId: "lulu",
    code: "PICRUDENS",
    rule: { kind: "percent", value: 50 },
    validFrom: "2026-10-05",
    validTo: "2026-10-07",
  },
  {
    id: "lulu-davana",
    pizzeriaId: "lulu",
    code: "DAVANA",
    rule: { kind: "everyNthFree", n: 3 },
    validFrom: "2026-09-01",
    validTo: "2026-10-31",
  },
  {
    id: "lulu-atgriesanas",
    pizzeriaId: "lulu",
    code: "ATGRIESANAS",
    rule: { kind: "percent", value: 50 },
    validFrom: "2026-09-07",
    validTo: "2026-09-09",
  },
  { id: "darbnica-drauga", pizzeriaId: "darbnīca", rule: { kind: "percent", value: 10 }, exclusiveGroup: "darbnica-card" },
  { id: "darbnica-birthday", pizzeriaId: "darbnīca", rule: { kind: "percent", value: 15 }, exclusiveGroup: "darbnica-card" },
];
