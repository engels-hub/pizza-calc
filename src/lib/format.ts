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

type Labelled = Pick<Variant, "shape" | "diameterCm"> & ({ id: string } | { key: string });

/**
 * "30 cm", "Sirds 30 cm" or "Viens izmērs". Takes a variant or a cart line
 * (whose key ends in the variant id). Only truly one-size items (variant id
 * "one", e.g. LuLū calzones) say so; Picu darbnīca's calzone has real sizes.
 */
export function variantLabel(v: Labelled): string {
  const id = "id" in v ? v.id : v.key.slice(v.key.lastIndexOf(":") + 1);
  if (v.shape === "heart") return lv.variants.heart;
  if (id === "one") return lv.variants.oneSize;
  return lv.variants.cm(v.diameterCm);
}

const whole = new Intl.NumberFormat("lv-LV", { maximumFractionDigits: 0 });
export const wholeNumber = (n: number) => whole.format(n);
