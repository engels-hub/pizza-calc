"use client";

import { ArrowCounterClockwiseIcon, CaretDownIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { lv } from "@/content/lv";
import { APPETITES, BASE_DIAMETERS, DEFAULT_RULES, basePizzas, type CalcRules } from "@/lib/calc";
import { oneDecimal, twoDecimals } from "@/lib/format";
import { spring } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { Collapse } from "../ui/Collapse";
import { Segmented } from "../ui/Segmented";
import { Stepper } from "../ui/Stepper";

/** "n − 1", "n × 1,25 − 1", "n + 2" */
function formulaOf(rules: CalcRules): string {
  const f = rules.factor === 1 ? "n" : `n × ${twoDecimals(rules.factor)}`;
  if (rules.offset === 0) return f;
  return rules.offset > 0 ? `${f} − ${rules.offset}` : `${f} + ${-rules.offset}`;
}

export function RulesPanel() {
  const [open, setOpen] = useState(false);
  const rules = useStore((s) => s.rules);
  const formula = formulaOf(rules);

  return (
    <div className="rounded-2xl bg-sunken/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="rules-panel"
        className="flex min-h-12 w-full items-center gap-3 px-4 text-left"
      >
        <SlidersHorizontalIcon size={18} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 py-2">
          <span className="block text-sm font-medium">{lv.rules.title}</span>
          <span className="block text-xs text-muted">{lv.rules.summary(formula, rules.baseDiameter)}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="text-muted">
          <CaretDownIcon size={16} />
        </motion.span>
      </button>

      <Collapse open={open} id="rules-panel">
        <RulesForm formula={formula} />
      </Collapse>
    </div>
  );
}

function RulesForm({ formula }: { formula: string }) {
  const people = useStore((s) => s.people);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const resetRules = useStore((s) => s.resetRules);
  const base = basePizzas(people, rules);
  const appetite = APPETITES.find((a) => a.factor === rules.factor)?.id ?? "custom";
  const isDefault =
    rules.factor === DEFAULT_RULES.factor &&
    rules.offset === DEFAULT_RULES.offset &&
    rules.baseDiameter === DEFAULT_RULES.baseDiameter;

  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      <p className="max-w-[60ch] text-sm leading-relaxed text-muted">{lv.rules.explainer}</p>

      <p className="text-sm">
        {lv.rules.worked(lv.plural.people(people), formula.replace("n", String(people)))}{" "}
        <strong className="font-semibold text-accent">
          {oneDecimal(base)} {lv.plural.pizzaWord(Math.ceil(base))}
        </strong>{" "}
        {lv.rules.perSize(rules.baseDiameter)}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field label={lv.rules.appetite}>
          <Segmented
            id="appetite"
            label={lv.rules.appetite}
            value={appetite}
            onChange={(id) => {
              const a = APPETITES.find((x) => x.id === id);
              if (a) setRules({ factor: a.factor });
            }}
            options={APPETITES.map((a) => ({ value: a.id, label: lv.rules.appetites[a.id] }))}
          />
        </Field>

        <Field label={lv.rules.offset}>
          <Stepper
            size="sm"
            label={lv.rules.offset}
            value={rules.offset}
            min={-2}
            max={3}
            onChange={(offset) => setRules({ offset })}
          >
            <span className="tabular w-10 text-center text-lg">{rules.offset}</span>
          </Stepper>
        </Field>

        <div>
          <label htmlFor="factor" className="mb-2 flex justify-between text-sm font-medium text-muted">
            {lv.rules.factor}
            <span className="tabular text-ink">{twoDecimals(rules.factor)}</span>
          </label>
          <input
            id="factor"
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={rules.factor}
            onChange={(e) => setRules({ factor: Number(e.target.value) })}
            className="h-11 w-full accent-[var(--accent)]"
          />
        </div>

        <Field label={lv.rules.baseSize}>
          <Segmented
            id="base"
            label={lv.rules.baseSize}
            value={rules.baseDiameter}
            onChange={(baseDiameter) => setRules({ baseDiameter })}
            options={BASE_DIAMETERS.map((d) => ({ value: d, label: String(d) }))}
          />
        </Field>
      </div>

      <button
        type="button"
        disabled={isDefault}
        onClick={resetRules}
        className="inline-flex min-h-10 items-center gap-2 self-start rounded-full px-1 text-sm font-medium text-accent transition-opacity disabled:opacity-40"
      >
        <ArrowCounterClockwiseIcon size={16} />
        {lv.rules.reset}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}
