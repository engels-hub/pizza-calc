"use client";

import { useState } from "react";
import { lv } from "@/content/lv";
import { useStore } from "@/lib/store";
import { Stepper } from "../ui/Stepper";

export function PeopleControl() {
  const people = useStore((s) => s.people);
  const setPeople = useStore((s) => s.setPeople);
  // What the user is typing; null means "show the stored value". Lets the
  // field be cleared mid-edit without snapping back.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="people" className="text-sm font-medium text-muted">
        {lv.planner.people}
      </label>
      <div className="flex flex-1 items-center">
        <Stepper
          look="bevel"
          value={people}
          onChange={(n) => {
            setDraft(null);
            setPeople(n);
          }}
          min={1}
          max={60}
          label={lv.planner.people}
        >
          <input
            id="people"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={draft ?? String(people)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
              setDraft(digits);
              if (Number(digits) > 0) setPeople(Number(digits));
            }}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={() => setDraft(null)}
            className="tabular w-16 bg-transparent text-center font-pixel text-5xl leading-none outline-none"
            aria-describedby="people-unit"
          />
        </Stepper>
        <span id="people-unit" className="sr-only">
          {lv.plural.people(people)}
        </span>
      </div>
    </div>
  );
}
