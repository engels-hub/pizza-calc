"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { easeOutExpo } from "@/lib/motion";

interface Flyer {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  img?: string;
}

const EVENT = "pizza:fly";

/** Sends a small pizza from the add button to whichever ticket target is visible. */
export function flyToTicket(rect: DOMRect, img?: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, img } }));
}

function visibleTarget(): DOMRect | null {
  for (const el of document.querySelectorAll<HTMLElement>("[data-fly-target]")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) return r;
  }
  return null;
}

export function FlyLayer() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    let n = 0;
    const onFly = (e: Event) => {
      if (reduce) return;
      const { x, y, img } = (e as CustomEvent).detail;
      const t = visibleTarget();
      if (!t) return;
      const flyer = { id: ++n, from: { x, y }, to: { x: t.left + t.width / 2, y: t.top + t.height / 2 }, img };
      setFlyers((f) => [...f, flyer]);
    };
    window.addEventListener(EVENT, onFly);
    return () => window.removeEventListener(EVENT, onFly);
  }, [reduce]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      <AnimatePresence>
        {flyers.map((f) => (
          <motion.span
            key={f.id}
            className="pizza-dot absolute left-0 top-0 block size-10 overflow-hidden rounded-full"
            initial={{ x: f.from.x - 20, y: f.from.y - 20, scale: 1, opacity: 1 }}
            animate={{
              x: [f.from.x - 20, (f.from.x + f.to.x) / 2 - 20, f.to.x - 20],
              y: [f.from.y - 20, Math.min(f.from.y, f.to.y) - 80, f.to.y - 20],
              scale: [1, 1.15, 0.35],
              opacity: [1, 1, 0.6],
            }}
            transition={{ duration: 0.6, ease: easeOutExpo, times: [0, 0.4, 1] }}
            onAnimationComplete={() => setFlyers((all) => all.filter((x) => x.id !== f.id))}
          >
            {f.img && <Image src={f.img} alt="" fill sizes="40px" className="object-cover" />}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
