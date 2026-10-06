"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import type { Pizza } from "@/lib/types";
import { FauxPizza } from "./FauxPizza";

// Internal render height in real pixels. ~1/4 of a PS1 frame per axis on a
// phone, so the canvas is pixelated on purpose and cheap to draw.
const INTERNAL_HEIGHT = 168;
const FPS = 30;

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

export default function PizzaStage({ pizza }: { pizza: Pizza }) {
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
    let dprSettled = false;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (!h) return;
      const next = Math.round(Math.min(1, Math.max(0.2, INTERNAL_HEIGHT / h)) * 20) / 20;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setDpr(next), dprSettled ? 200 : 0);
      dprSettled = true;
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

  const onDown = (e: React.PointerEvent) => {
    spin.grab(e.clientX, e.timeStamp);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => spin.drag(e.clientX, e.timeStamp);
  const onUp = () => spin.release();

  return (
    <div
      ref={wrap}
      className="size-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-label={`${pizza.name}, griežama 3D pica`}
      role="img"
    >
      {dpr !== null && (
        <Canvas
          key={dpr}
          dpr={dpr}
          frameloop="demand"
          flat
          linear
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          camera={{ position: [0, 2.9, 3.3], fov: 34 }}
          style={{ imageRendering: "pixelated" }}
          onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
        >
          <Ticker active={visible} />
          <Spinner spin={spin} reduce={reduce}>
            <FauxPizza key={pizza.id} pizza={pizza} reduce={reduce} />
          </Spinner>
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

function Spinner({ spin, reduce, children }: { spin: Spin; reduce: boolean; children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    spin.tick(Math.min(delta, 0.1), reduce ? 0.12 : 0.65);
    if (group.current) {
      group.current.rotation.y = spin.angle;
      group.current.position.y = reduce ? 0 : Math.sin(state.clock.elapsedTime * 1.4) * 0.03;
    }
  });
  return <group ref={group}>{children}</group>;
}
