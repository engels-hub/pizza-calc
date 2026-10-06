const eur = new Intl.NumberFormat("lv-LV", { style: "currency", currency: "EUR" });
const dec1 = new Intl.NumberFormat("lv-LV", { maximumFractionDigits: 1 });
const dec2 = new Intl.NumberFormat("lv-LV", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const euro = (n: number) => eur.format(n);
export const oneDecimal = (n: number) => dec1.format(n);
export const twoDecimals = (n: number) => dec2.format(n);

/** "2026-10-07" -> "07.10." */
export function shortDate(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.`;
}

/** Latvian plural for "pica": 1 pica, 2 picas, 21 pica, 11 picu is not used here. */
export function picas(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? "pica" : "picas";
}

export function cilveki(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? "cilvēks" : "cilvēki";
}
