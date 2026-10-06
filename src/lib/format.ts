import { lv } from "@/content/lv";
import type { Variant } from "./types";

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

export function variantLabel(v: Pick<Variant, "shape" | "diameterCm">): string {
  if (v.shape === "heart") return lv.variants.heart;
  if (v.shape === "calzone") return lv.variants.oneSize;
  return lv.variants.cm(v.diameterCm);
}
