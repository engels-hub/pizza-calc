"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { lv } from "@/content/lv";
import type { Pizza, Shape } from "@/lib/types";
import { Calzone } from "./Calzone";
import { FauxPizza } from "./FauxPizza";

// Internal render height in real pixels: pixelated on purpose and cheap to draw.
const INTERNAL_HEIGHT = 200;
const FPS = 30;
const GAP = 0.6;
/** Sideways zigzag so each pizza peeks out from under the next one. */
const SWAY = 0.32;
/** A 30 cm pizza is drawn at this radius; other sizes scale with diameter. */
const BASE_SCALE = 0.82;

export interface StackUnit {
  key: string;
  lineKey: string;
  pizza: Pizza;
  diameter: number;
  shape: Shape;
}

/** Mutable spin state shared by the DOM pointer handlers and the render loop. */
class Spin {
  angle = 0.6;
  velocity = 0;
  dragging = false;
  private lastX = 0;
  private lastT = 0;

  grab(x: number, t: number) {
    this.dragging = true;
    this.lastX = x;
    this.lastT = t;
  }

  drag(x: number, t: number) {
    if (!this.dragging) return;
    const dx = x - this.lastX;
    const dt = Math.max(1, t - this.lastT) / 1000;
    this.angle += dx * 0.012;
    this.velocity = Math.max(-12, Math.min(12, (dx * 0.012) / dt));
    this.lastX = x;
    this.lastT = t;
  }

  release() {
    this.dragging = false;
  }

  /** Eases back to a slow cruise after a flick. */
  tick(dt: number, cruise: number) {
    if (this.dragging) return;
    this.velocity += (cruise - this.velocity) * Math.min(1, dt * 1.6);
    this.angle += this.velocity * dt;
  }
}

export default function StackStage({
  units,
  hovered,
  onHover,
}: {
  units: StackUnit[];
  hovered: string | null;
  onHover: (lineKey: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  // Measured before the Canvas mounts; a dpr change remounts it, because
  // changing it live leaves the GL viewport out of sync with the buffer.
  const [dpr, setDpr] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);
  const [reduce, setReduce] = useState(false);
  const [spin] = useState(() => new Spin());

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let timer = 0;
    let settled = false;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (!h) return;
      const next = Math.round(Math.min(1, Math.max(0.2, INTERNAL_HEIGHT / h)) * 20) / 20;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setDpr(next), settled ? 200 : 0);
      settled = true;
    });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduce(mq.matches);
    onMq();
    ro.observe(el);
    io.observe(el);
    mq.addEventListener("change", onMq);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className={`size-full touch-pan-y select-none ${hovered ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"}`}
      onPointerDown={(e) => {
        spin.grab(e.clientX, e.timeStamp);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => spin.drag(e.clientX, e.timeStamp)}
      onPointerUp={() => spin.release()}
      onPointerCancel={() => spin.release()}
      onPointerLeave={() => onHover(null)}
      role="img"
      aria-label={units.length ? lv.cart.stackLabel(units.length) : lv.cart.stackEmpty}
    >
      {dpr !== null && (
        <Canvas
          key={dpr}
          dpr={dpr}
          frameloop="demand"
          flat
          linear
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          camera={{ position: [0, 3.1, 3.4], fov: 34 }}
          style={{ imageRendering: "pixelated" }}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <Ticker active={visible} />
          <Stack units={units} spin={spin} reduce={reduce} hovered={hovered} onHover={onHover} />
        </Canvas>
      )}
    </div>
  );
}

/** Renders at a fixed low frame rate while on screen, nothing while off screen. */
function Ticker({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => invalidate(), 1000 / FPS);
    return () => window.clearInterval(id);
  }, [active, invalidate]);
  return null;
}

const PLAIN: Pizza = {
  id: "empty",
  pizzeriaId: "darbnīca",
  name: "",
  url: "",
  rawIngredients: [],
  ingredients: ["base-sauce", "base-cheese"],
  tags: [],
  variants: [],
};

function Stack({
  units,
  spin,
  reduce,
  hovered,
  onHover,
}: {
  units: StackUnit[];
  spin: Spin;
  reduce: boolean;
  hovered: string | null;
  onHover: (lineKey: string | null) => void;
}) {
  const root = useRef<Group>(null);
  const shown = units.length
    ? units
    : [{ key: "empty", lineKey: "", pizza: PLAIN, diameter: 30, shape: "round" as const }];
  const height = (shown.length - 1) * GAP;
  const widest = Math.max(...shown.map((u) => u.diameter)) / 30;
  // Zoom out as the stack grows so the whole tower stays in frame.
  const fit = Math.min(1, 2.5 / (height + 1.6 * widest));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    spin.tick(dt, reduce ? 0.12 : 0.5);
    if (!root.current) return;
    const k = 1 - Math.exp(-dt * 6);
    const s = root.current.scale.x + (fit - root.current.scale.x) * k;
    root.current.scale.setScalar(s);
    const y = -(height * fit) / 2 - 0.15;
    root.current.position.y += (y - root.current.position.y) * k;
  });

  return (
    <group ref={root}>
      {shown.map((u, i) => (
        <Unit
          key={u.key}
          unit={u}
          index={i}
          spin={spin}
          reduce={reduce}
          sway={shown.length > 1 ? SWAY : 0}
          lifted={!!u.lineKey && hovered === u.lineKey}
          onHover={u.lineKey ? onHover : undefined}
        />
      ))}
    </group>
  );
}

function Unit({
  unit,
  index,
  spin,
  reduce,
  sway,
  lifted,
  onHover,
}: {
  unit: StackUnit;
  index: number;
  spin: Spin;
  reduce: boolean;
  sway: number;
  lifted: boolean;
  onHover?: (lineKey: string | null) => void;
}) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const born = useRef<number | null>(null);
  const lift = useRef(0);
  const scale = BASE_SCALE * (unit.diameter / 30);

  useFrame((state, delta) => {
    if (!outer.current || !inner.current) return;
    born.current ??= state.clock.elapsedTime;
    const age = state.clock.elapsedTime - born.current;
    const fall = reduce ? 0 : Math.max(0, 1 - age / 0.45);
    lift.current += ((lifted ? 1 : 0) - lift.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 10));

    const side = index % 2 === 0 ? -1 : 1;
    outer.current.position.y = index * GAP + fall * fall * 3 + lift.current * 0.3;
    outer.current.position.x = side * sway + lift.current * (side || 1) * 0.3;
    outer.current.position.z = -side * sway * 0.4;
    outer.current.scale.setScalar(scale * (1 + lift.current * 0.08));
    // Each pizza is turned a bit differently so the stack does not look cloned.
    inner.current.rotation.y = spin.angle + index * 1.3;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover?.(unit.lineKey);
  };

  return (
    <group
      ref={outer}
      onPointerOver={onHover ? over : undefined}
      onPointerOut={onHover ? () => onHover(null) : undefined}
    >
      <group ref={inner}>
        {unit.shape === "calzone" ? (
          <Calzone pizza={unit.pizza} reduce={reduce} />
        ) : (
          <FauxPizza pizza={unit.pizza} shape={unit.shape} reduce={reduce} />
        )}
      </group>
    </group>
  );
}
