"use client";

import { CameraIcon, CubeIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ingredientDef } from "@/lib/ingredients";
import { useStore } from "@/lib/store";
import { PIZZERIAS, type Pizza } from "@/lib/types";
import { Segmented } from "./ui/Segmented";

// Three.js lives in its own client-only chunk, away from the Motion tree.
const PizzaStage = dynamic(() => import("./pizza3d/PizzaStage"), {
  ssr: false,
  loading: () => <div className="pizza-dot mx-auto aspect-square w-1/2 animate-pulse rounded-full opacity-40" />,
});

export function PizzaShowcase({ pizzas }: { pizzas: Pizza[] }) {
  const showcaseId = useStore((s) => s.showcaseId);
  const mode = useStore((s) => s.showcaseMode);
  const setMode = useStore((s) => s.setShowcaseMode);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const pizza = useMemo(
    () => pizzas.find((p) => p.id === showcaseId) ?? pizzas.find((p) => /margarita/i.test(p.name)) ?? pizzas[0],
    [pizzas, showcaseId],
  );
  const onPhotoError = useCallback(() => setFailed((f) => ({ ...f, [pizza.id]: true })), [pizza.id]);
  const effective = mode === "photo" && pizza.imageUrl && !failed[pizza.id] ? "photo" : "faux";

  const toppings = pizza.ingredients
    .map(ingredientDef)
    .filter((d) => d.group !== "base")
    .map((d) => d.label);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-sunken">
      <div className="ps1-backdrop relative h-[34dvh] min-h-56 w-full md:aspect-square md:h-auto">
        {effective === "photo" ? (
          <AnimatePresence initial={false}>
            <motion.div
              key={pizza.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={pizza.imageUrl!}
                alt={pizza.name}
                fill
                sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
                className="object-cover"
                priority
                onError={onPhotoError}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <PizzaStage pizza={pizza} />
        )}
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-3 md:gap-3 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pizza.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0"
            >
              <p className="truncate text-lg font-semibold tracking-tight">{pizza.name}</p>
              <p className="text-sm text-muted">{PIZZERIAS[pizza.pizzeriaId].name}</p>
            </motion.div>
          </AnimatePresence>
          <Segmented
            id="showcase-mode"
            label="Skats"
            value={mode}
            onChange={setMode}
            options={[
              { value: "photo", label: <CameraIcon size={16} aria-label="Foto" /> },
              { value: "faux", label: <CubeIcon size={16} aria-label="No sastāvdaļām" /> },
            ]}
          />
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{toppings.join(", ") || "Siers un mērce"}</p>
      </div>
    </div>
  );
}
