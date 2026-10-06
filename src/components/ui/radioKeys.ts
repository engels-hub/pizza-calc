import type { KeyboardEvent } from "react";

const NEXT = new Set(["ArrowRight", "ArrowDown"]);
const PREV = new Set(["ArrowLeft", "ArrowUp"]);

/**
 * WAI-ARIA radio group keyboard support: arrows move and select, Home/End jump.
 * Pair with a roving tabindex (0 on the checked radio, -1 on the rest).
 */
export function onRadioKeyDown<T>(e: KeyboardEvent<HTMLElement>, values: readonly T[], current: T, select: (v: T) => void) {
  const i = values.indexOf(current);
  let next: number | null = null;
  if (NEXT.has(e.key)) next = (i + 1) % values.length;
  else if (PREV.has(e.key)) next = (i - 1 + values.length) % values.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = values.length - 1;
  if (next === null) return;

  e.preventDefault();
  select(values[next]);
  const radios = e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
  radios[next]?.focus();
}
