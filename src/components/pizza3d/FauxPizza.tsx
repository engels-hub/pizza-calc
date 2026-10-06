"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Mesh,
} from "three";
import { ingredientDef } from "@/lib/ingredients";
import type { Pizza } from "@/lib/types";
import { FALLBACK, RECIPES, SAUCE_COLORS, rng } from "./ingredientMeshes";
import { ps1Material, raw } from "./ps1Material";

interface Item {
  x: number;
  y: number;
  z: number;
  rot: Euler;
  delay: number;
  color: string;
}

interface Part {
  key: string;
  geometry: BufferGeometry;
  items: Item[];
}

// Scratch objects for per-frame matrix math; render loops run one at a time.
const tmpMatrix = new Matrix4();
const tmpQuat = new Quaternion();
const tmpPos = new Vector3();
const tmpScale = new Vector3(1, 1, 1);

const DROP_FROM = 1.5;
const DROP_TIME = 0.42;
const MAX_ITEMS = 220;

function sauceColor(keys: string[]): string {
  if (keys.includes("bbq-sauce") && !keys.includes("base-sauce")) return "#5a2a17";
  if (keys.includes("base-sauce")) return "#b8331f";
  if (keys.includes("pesto")) return "#4c7a2c";
  return "#efe3c4"; // white base: mayo, cucumber, steak sauce bases
}

function cheeseColor(keys: string[]): string | null {
  if (keys.includes("vegan-cheese")) return "#efe0a6";
  const dairy = keys.some((k) => ingredientDef(k).dairy);
  return dairy ? "#f3cf68" : null;
}

/** Builds the topping layout for a pizza: deterministic, seeded by its id. */
function buildParts(pizza: Pizza): Part[] {
  const rand = rng(pizza.id);
  const parts: Part[] = [];
  let delay = 0.38;
  let layer = 0;
  let total = 0;

  const scatter = (key: string, geometry: BufferGeometry, count: number, colors: string[], flat: boolean, lift: number) => {
    const items: Item[] = [];
    for (let j = 0; j < count && total < MAX_ITEMS; j++, total++) {
      const r = Math.sqrt(rand()) * 0.7;
      const a = rand() * Math.PI * 2;
      items.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        y: 0.11 + layer * 0.006 + lift,
        rot: flat ? new Euler(Math.PI / 2, 0, rand() * Math.PI * 2) : new Euler(0, rand() * Math.PI * 2, 0),
        delay: delay + j * 0.022,
        color: colors[j % colors.length],
      });
    }
    parts.push({ key, geometry, items });
    delay += 0.16;
    layer++;
  };

  for (const key of pizza.ingredients) {
    const def = ingredientDef(key);
    if (def.group === "base" || key === "extra-cheese" || key === "vegan-cheese") continue;
    if (SAUCE_COLORS[key]) {
      const geometry = new BoxGeometry(0.55, 0.008, 0.028);
      scatter(key, geometry, 4, [SAUCE_COLORS[key]], false, 0.03);
      continue;
    }
    const recipe = RECIPES[key] ?? FALLBACK;
    const geometry = recipe.geometry();
    geometry.computeBoundingBox();
    const half = recipe.flat ? 0.012 : (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y) / 2;
    scatter(key, geometry, recipe.count, recipe.colors, Boolean(recipe.flat), half);
  }
  return parts;
}

/** No photo, or the photo mode is off: build the pizza from its ingredient list. */
export function FauxPizza({ pizza, reduce }: { pizza: Pizza; reduce: boolean }) {
  const keys = pizza.ingredients;
  const parts = useMemo(() => buildParts(pizza), [pizza]);
  const material = useMemo(() => ps1Material({ color: "#ffffff" }), []);
  const base = useMemo(() => {
    const cheese = cheeseColor(keys);
    return {
      dough: { geo: new CylinderGeometry(1, 0.97, 0.12, 16), mat: ps1Material({ color: "#d9a066" }) },
      crust: { geo: new TorusGeometry(0.93, 0.075, 4, 18), mat: ps1Material({ color: "#c4823f" }) },
      sauce: { geo: new CylinderGeometry(0.87, 0.87, 0.02, 14), mat: ps1Material({ color: sauceColor(keys) }) },
      cheese: cheese ? { geo: new CylinderGeometry(0.8, 0.8, 0.02, 11), mat: ps1Material({ color: cheese }) } : null,
    };
  }, [keys]);

  useLayoutEffect(
    () => () => {
      material.dispose();
      parts.forEach((part) => part.geometry.dispose());
      Object.values(base).forEach((b) => {
        b?.geo.dispose();
        b?.mat.dispose();
      });
    },
    [material, parts, base],
  );

  const sauceRef = useRef<Mesh>(null);
  const cheeseRef = useRef<Mesh>(null);
  const meshes = useRef<(InstancedMesh | null)[]>([]);
  const start = useRef<number | null>(null);
  const settled = useRef(false);

  // Instance colours have to exist before the first render so the shader
  // compiles with USE_INSTANCING_COLOR.
  useLayoutEffect(() => {
    parts.forEach((part, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      part.items.forEach((it, j) => mesh.setColorAt(j, raw(it.color)));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
    settled.current = false;
    start.current = null;
  }, [parts]);


  useFrame((state) => {
    if (settled.current) return;
    start.current ??= state.clock.elapsedTime;
    const t = reduce ? 99 : state.clock.elapsedTime - start.current;
    const drop = (delay: number, target: number) => {
      const k = Math.min(1, Math.max(0, (t - delay) / DROP_TIME));
      return { y: target + (1 - bounce(k)) * DROP_FROM, visible: k > 0 };
    };

    if (sauceRef.current) {
      const d = drop(0, 0.07);
      sauceRef.current.position.y = d.y;
      sauceRef.current.visible = d.visible;
    }
    if (cheeseRef.current) {
      const d = drop(0.16, 0.088);
      cheeseRef.current.position.y = d.y;
      cheeseRef.current.visible = d.visible;
    }

    let last = 0.6;
    parts.forEach((part, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      part.items.forEach((it, j) => {
        const d = drop(it.delay, it.y);
        tmpPos.set(it.x, d.y, it.z);
        tmpQuat.setFromEuler(it.rot);
        tmpScale.setScalar(d.visible ? 1 : 0);
        mesh.setMatrixAt(j, tmpMatrix.compose(tmpPos, tmpQuat, tmpScale));
        last = Math.max(last, it.delay + DROP_TIME);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
    if (t > last + 0.1) settled.current = true;
  });

  return (
    <group>
      <mesh geometry={base.dough.geo} material={base.dough.mat} />
      <mesh geometry={base.crust.geo} material={base.crust.mat} rotation-x={Math.PI / 2} position-y={0.06} />
      <mesh ref={sauceRef} geometry={base.sauce.geo} material={base.sauce.mat} visible={false} />
      {base.cheese && <mesh ref={cheeseRef} geometry={base.cheese.geo} material={base.cheese.mat} visible={false} />}
      {parts.map((part, i) => (
        <instancedMesh
          key={part.key}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          args={[part.geometry, material, part.items.length]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

/** Lands, squashes a little, settles. */
function bounce(k: number): number {
  if (k >= 1) return 1;
  const c = 1.2;
  return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
}
