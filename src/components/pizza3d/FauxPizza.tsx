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
  type Group,
  type Material,
} from "three";
import { ingredientDef } from "@/lib/ingredients";
import type { Pizza, Shape } from "@/lib/types";
import { heartSlab, insideHeart } from "./heart";
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

/** Which part of the pizza toppings go on: all of it, or one half of a Pus-Pus pizza. */
type Side = 0 | -1 | 1;

/** Builds the topping layout for a pizza: deterministic, seeded by its id. */
function buildParts(pizza: Pizza, shape: Shape, side: Side = 0): Part[] {
  const rand = rng(pizza.id);
  // A spot for one topping: uniform in the disc, or rejection-sampled inside the heart.
  const spot = (): [number, number] => {
    if (side !== 0) {
      // Half disc, kept off the cut so the two halves read apart.
      const r = Math.sqrt(rand()) * 0.7;
      const a = (rand() - 0.5) * Math.PI;
      return [side * (0.05 + Math.abs(Math.cos(a) * r)), Math.sin(a) * r];
    }
    if (shape === "heart") {
      for (let tries = 0; tries < 40; tries++) {
        const x = (rand() * 2 - 1) * 0.85;
        const z = (rand() * 2 - 1) * 0.85;
        if (insideHeart(x, z, 0.72)) return [x, z];
      }
      return [0, 0];
    }
    const r = Math.sqrt(rand()) * 0.7;
    const a = rand() * Math.PI * 2;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  const parts: Part[] = [];
  const maxItems = side === 0 ? MAX_ITEMS : MAX_ITEMS / 2;
  let delay = 0.38;
  let layer = 0;
  let total = 0;

  const scatter = (
    key: string,
    geometry: BufferGeometry,
    count: number,
    colors: string[],
    flat: boolean,
    lift: number,
  ) => {
    const items: Item[] = [];
    for (let j = 0; j < Math.ceil(count / (side === 0 ? 1 : 2)) && total < maxItems; j++, total++) {
      const [x, z] = spot();
      items.push({
        x,
        z,
        y: 0.11 + layer * 0.006 + lift,
        rot: flat ? new Euler(Math.PI / 2, 0, rand() * Math.PI * 2) : new Euler(0, rand() * Math.PI * 2, 0),
        delay: delay + j * 0.022,
        color: colors[j % colors.length],
      });
    }
    parts.push({ key: side === 0 ? key : `${key}@${side}`, geometry, items });
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

interface Layer {
  geo: BufferGeometry;
  mat: Material;
}

/** A flat disc, or one half of it (side −1 is x < 0, side 1 is x > 0). */
function disc(r: number, h: number, segments: number, side: Side): BufferGeometry {
  if (side === 0) return new CylinderGeometry(r, r, h, segments);
  return new CylinderGeometry(r, r, h, Math.ceil(segments / 2), 1, false, side < 0 ? Math.PI : 0, Math.PI);
}

/**
 * No photo, or the photo mode is off: build the pizza from its ingredient list.
 * With `half`, it is a Pus-Pus pizza: `pizza` on the left, `half` on the right.
 */
export function FauxPizza({
  pizza,
  half,
  shape = "round",
  reduce,
}: {
  pizza: Pizza;
  half?: Pizza;
  shape?: Shape;
  reduce: boolean;
}) {
  const heart = shape === "heart";
  const parts = useMemo(
    () => (half ? [...buildParts(pizza, shape, -1), ...buildParts(half, shape, 1)] : buildParts(pizza, shape)),
    [pizza, half, shape],
  );
  const material = useMemo(() => ps1Material({ color: "#ffffff" }), []);
  const base = useMemo(() => {
    // Sauce and cheese per half: one layer for a whole pizza, two for Pus-Pus.
    const halves: [Pizza, Side][] = half ? [[pizza, -1], [half, 1]] : [[pizza, 0]];
    const sauce: Layer[] = [];
    const cheese: Layer[] = [];
    for (const [p, side] of halves) {
      const keys = p.ingredients;
      const cheeseTint = cheeseColor(keys);
      if (heart) {
        // Heart: the dough slab doubles as the crust; sauce and cheese are smaller hearts on top.
        sauce.push({ geo: heartSlab(0.88, 0.02), mat: ps1Material({ color: sauceColor(keys) }) });
        if (cheeseTint) cheese.push({ geo: heartSlab(0.8, 0.02), mat: ps1Material({ color: cheeseTint }) });
      } else {
        sauce.push({ geo: disc(0.87, 0.02, 14, side), mat: ps1Material({ color: sauceColor(keys) }) });
        if (cheeseTint) cheese.push({ geo: disc(0.8, 0.02, 12, side), mat: ps1Material({ color: cheeseTint }) });
      }
    }
    return {
      dough: heart
        ? { geo: heartSlab(1, 0.14), mat: ps1Material({ color: "#c98a4b" }) }
        : { geo: new CylinderGeometry(1, 0.97, 0.12, 16), mat: ps1Material({ color: "#d9a066" }) },
      crust: heart ? null : { geo: new TorusGeometry(0.93, 0.075, 4, 18), mat: ps1Material({ color: "#c4823f" }) },
      sauce,
      cheese,
    };
  }, [pizza, half, heart]);

  useLayoutEffect(
    () => () => {
      material.dispose();
      parts.forEach((part) => part.geometry.dispose());
      [base.dough, base.crust, ...base.sauce, ...base.cheese].forEach((b) => {
        b?.geo.dispose();
        b?.mat.dispose();
      });
    },
    [material, parts, base],
  );

  const sauceRef = useRef<Group>(null);
  const cheeseRef = useRef<Group>(null);
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
      {base.crust && (
        <mesh geometry={base.crust.geo} material={base.crust.mat} rotation-x={Math.PI / 2} position-y={0.06} />
      )}
      <group ref={sauceRef} visible={false}>
        {base.sauce.map((l, i) => (
          <mesh key={i} geometry={l.geo} material={l.mat} />
        ))}
      </group>
      <group ref={cheeseRef} visible={false}>
        {base.cheese.map((l, i) => (
          <mesh key={i} geometry={l.geo} material={l.mat} />
        ))}
      </group>
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
