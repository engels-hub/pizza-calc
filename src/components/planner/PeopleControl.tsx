"use client";

import { lv } from "@/content/lv";
import { useStore } from "@/lib/store";
import { Stepper } from "../ui/Stepper";

export function PeopleControl() {
  const people = useStore((s) => s.people);
  const setPeople = useStore((s) => s.setPeople);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="people" className="text-sm font-medium text-muted">
        {lv.planner.people}
      </label>
      <div className="flex flex-1 items-center">
        <Stepper look="bevel" value={people} onChange={setPeople} min={1} max={60} label={lv.planner.people}>
          <input
            id="people"
            inputMode="numeric"
            value={people}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ""));
              if (n) setPeople(n);
            }}
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
