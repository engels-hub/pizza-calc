"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { lv } from "@/content/lv";
import { PROMOS } from "@/data/promos";
import { useToday } from "@/hooks/useToday";
import { isPromoActive, togglePromo, type CustomDiscount, type Promo } from "@/lib/discounts";
import { shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Segmented } from "../ui/Segmented";

function validity(p: Promo, today: string): string | null {
  if (!p.validTo) return null;
  if (today > p.validTo) return lv.summary.endedOn(shortDate(p.validTo));
  if (p.validFrom && today < p.validFrom) return lv.summary.startsOn(shortDate(p.validFrom));
  return lv.summary.until(shortDate(p.validTo));
}

/** Every deal as a switch, plus the user's own discount. */
export function DealsList() {
  const today = useToday();
  const active = useStore((s) => s.activePromos);
  const setActive = useStore((s) => s.setActivePromos);

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-1.5 md:grid-cols-2">
        {PROMOS.map((p) => {
          const live = isPromoActive(p, today);
          return (
            <PromoRow
              key={p.id}
              promo={p}
              live={live}
              on={live && active.includes(p.id)}
              when={validity(p, today)}
              onToggle={() => setActive(togglePromo(active, p, PROMOS))}
            />
          );
        })}
      </ul>
      <CustomDiscountField />
    </div>
  );
}

function PromoRow({
  promo,
  live,
  on,
  when,
  onToggle,
}: {
  promo: Promo;
  live: boolean;
  on: boolean;
  when: string | null;
  onToggle: () => void;
}) {
  const text = lv.promos[promo.id];
  return (
    <li>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-3 py-2 transition-colors ${
          on ? "border-accent bg-accent-soft" : "border-line"
        } ${live ? "" : "opacity-45"}`}
      >
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-describedby={text?.note ? `${promo.id}-note` : undefined}
          disabled={!live}
          onClick={onToggle}
          className="flex min-h-10 min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
        >
          <span
            className={`grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${
              on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface"
            }`}
          >
            {on && <CheckIcon size={12} weight="bold" />}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{text?.title ?? promo.id}</span>
            <span className="block text-xs text-muted">
              {lv.pizzerias[promo.pizzeriaId]}
              {when && `, ${when}`}
            </span>
            {text?.note && (
              <span id={`${promo.id}-note`} className="mt-0.5 block text-xs text-muted">
                {text.note}
              </span>
            )}
          </span>
        </button>
        {promo.code && <CopyCode code={promo.code} disabled={!live} />}
      </div>
    </li>
  );
}

function CopyCode({ code, disabled }: { code: string; disabled: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard blocked; the code is visible anyway.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-sunken px-2.5 text-xs font-medium transition-transform active:scale-[0.96] disabled:cursor-not-allowed"
      aria-label={lv.summary.copyCode(code)}
    >
      {code}
      {copied ? <CheckIcon size={12} weight="bold" /> : <CopyIcon size={12} />}
    </button>
  );
}

function CustomDiscountField() {
  const custom = useStore((s) => s.custom);
  const setCustom = useStore((s) => s.setCustom);
  const kind = custom?.kind ?? "percent";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="custom-discount" className="text-sm text-muted">
        {lv.summary.custom}
      </label>
      <div className="ml-auto flex items-center gap-2">
        <input
          id="custom-discount"
          inputMode="decimal"
          placeholder="0"
          value={custom?.value ? String(custom.value).replace(".", ",") : ""}
          onChange={(e) => {
            const v = Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, ""));
            setCustom(v > 0 ? ({ kind, value: v } as CustomDiscount) : null);
          }}
          className="tabular h-10 w-20 rounded-full border border-line bg-surface px-3 text-right text-sm outline-none focus:border-accent"
        />
        <Segmented
          id="custom-kind"
          label={lv.summary.customKind}
          value={kind}
          onChange={(k) => setCustom(custom ? ({ kind: k, value: custom.value } as CustomDiscount) : null)}
          options={[
            { value: "percent", label: "%" },
            { value: "fixed", label: "€" },
          ]}
        />
      </div>
    </div>
  );
}
