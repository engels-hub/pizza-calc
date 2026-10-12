"use client";

import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { lv } from "@/content/lv";
import {
  APPETITES,
  BASE_DIAMETERS,
  CALC_METHODS,
  DEFAULT_RULES,
  SLICES_MAX,
  SLICES_MIN,
  appetiteFactor,
  basePizzas,
  slicesFor,
  slicesPerPerson,
  type CalcRules,
} from "@/lib/calc";
import { oneDecimal, twoDecimals } from "@/lib/format";
import { spring } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { Collapse } from "../ui/Collapse";
import { Segmented } from "../ui/Segmented";
import { Stepper } from "../ui/Stepper";

/** n − 1 with appetite folded into n: "n − 1", "n × 1,25 − 1". */
function minusOneFormula(rules: CalcRules, n: string): string {
  const f = appetiteFactor(rules.appetite);
  return f === 1 ? `${n} − 1` : `${n} × ${twoDecimals(f)} − 1`;
}

function summaryOf(rules: CalcRules): string {
  const appetite =
    rules.appetite === DEFAULT_RULES.appetite
      ? null
      : lv.rules.appetites[rules.appetite];
  if (rules.method === "minusOne")
    return lv.rules.summaryMinusOne(
      minusOneFormula(rules, "n"),
      rules.baseDiameter,
      appetite,
    );
  const each = slicesPerPerson(rules);
  return lv.rules.summary(each, oneDecimal(each), rules.baseDiameter, appetite);
}

export function RulesPanel() {
  const [open, setOpen] = useState(false);
  const rules = useStore((s) => s.rules);

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
          <span className="block text-xs text-muted">{summaryOf(rules)}</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring}
          className="text-muted"
        >
          <CaretDownIcon size={16} />
        </motion.span>
      </button>

      <Collapse open={open} id="rules-panel">
        <RulesForm />
      </Collapse>
    </div>
  );
}

function RulesForm() {
  const people = useStore((s) => s.people);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const resetRules = useStore((s) => s.resetRules);
  const base = basePizzas(people, rules);
  const each = slicesPerPerson(rules);
  const perPizza = slicesFor(rules.baseDiameter, "round");
  const minusOne = rules.method === "minusOne";
  const isDefault =
    rules.method === DEFAULT_RULES.method &&
    rules.slices === DEFAULT_RULES.slices &&
    rules.appetite === DEFAULT_RULES.appetite &&
    rules.baseDiameter === DEFAULT_RULES.baseDiameter;

  return (
    <div className="flex flex-col gap-5 px-4 pb-4">
      <Field label={lv.rules.method}>
        <Segmented
          id="method"
          label={lv.rules.method}
          value={rules.method}
          onChange={(method) => setRules({ method })}
          options={CALC_METHODS.map((m) => ({
            value: m,
            label: lv.rules.methods[m],
          }))}
        />
      </Field>

      <p className="max-w-[60ch] text-sm leading-relaxed text-muted">
        {minusOne ? lv.rules.explainerMinusOne : lv.rules.explainer}
      </p>

      <p className="text-sm">
        {minusOne
          ? lv.rules.workedMinusOne(
              lv.plural.people(people),
              minusOneFormula(rules, String(people)),
            )
          : lv.rules.worked(
              lv.plural.people(people),
              each,
              oneDecimal(each),
              perPizza,
            )}{" "}
        <strong className="font-semibold text-accent">
          {oneDecimal(base)} {lv.plural.pizzaWord(Math.ceil(base))}
        </strong>{" "}
        {lv.rules.perSize(rules.baseDiameter)}
      </p>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={lv.rules.appetite}>
          <Segmented
            id="appetite"
            label={lv.rules.appetite}
            value={rules.appetite}
            onChange={(appetite) => setRules({ appetite })}
            options={APPETITES.map((a) => ({
              value: a.id,
              label: lv.rules.appetites[a.id],
            }))}
          />
        </Field>

        {!minusOne && (
          <Field label={lv.rules.slices}>
            <Stepper
              size="sm"
              label={lv.rules.slices}
              value={rules.slices}
              min={SLICES_MIN}
              max={SLICES_MAX}
              onChange={(slices) => setRules({ slices })}
            >
              <span className="tabular w-10 text-center text-lg">
                {rules.slices}
              </span>
            </Stepper>
          </Field>
        )}

        <Field label={lv.rules.baseSize}>
          <Segmented
            id="base"
            label={lv.rules.baseSize}
            value={rules.baseDiameter}
            onChange={(baseDiameter) => setRules({ baseDiameter })}
            options={BASE_DIAMETERS.map((d) => ({
              value: d,
              label: String(d),
            }))}
          />
          <p className="mt-1.5 text-xs text-muted">
            {lv.rules.slicesInBase(perPizza)}
          </p>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}
