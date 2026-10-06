import type { Promo } from "@/lib/discounts";

// From lulu.lv/jaunumi and picudarbnica.lv/piegade, checked 2026-10-06.
// Expired codes stay listed (greyed out) so the pattern is visible.
export const PROMOS: Promo[] = [
  {
    id: "lulu-takeaway",
    pizzeriaId: "lulu",
    title: "Paņem pats −15%",
    note: "Pasūti tiešsaistē un izņem picērijā. Nesummējas ar citām atlaidēm.",
    rule: { kind: "percent", value: 15 },
    exclusiveGroup: "solo",
  },
  {
    id: "lulu-picrudens",
    pizzeriaId: "lulu",
    title: "Visas picas −50%",
    code: "PICRUDENS",
    note: "Rudens akcija visām picām.",
    rule: { kind: "percent", value: 50 },
    validFrom: "2026-10-05",
    validTo: "2026-10-07",
  },
  {
    id: "lulu-davana",
    pizzeriaId: "lulu",
    title: "Katra 3. pica bez maksas",
    code: "DAVANA",
    note: "Lētākā pica katrā trijniekā ir par brīvu.",
    rule: { kind: "everyNthFree", n: 3 },
    validFrom: "2026-09-01",
    validTo: "2026-10-31",
  },
  {
    id: "lulu-atgriesanas",
    pizzeriaId: "lulu",
    title: "Visas picas −50%",
    code: "ATGRIESANAS",
    note: "Septembra akcija.",
    rule: { kind: "percent", value: 50 },
    validFrom: "2026-09-07",
    validTo: "2026-09-09",
  },
  {
    id: "picu-birthday",
    pizzeriaId: "picu",
    title: "Dzimšanas vai vārda diena −15%",
    note: "Tikai pašā svētku dienā, jāpasaka pasūtot.",
    rule: { kind: "percent", value: 15 },
  },
];
