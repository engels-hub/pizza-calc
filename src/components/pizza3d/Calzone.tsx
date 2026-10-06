"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  InstancedMesh,
  Matrix4,
  Object3D,
  Shape as ThreeShape,
  type Group,
} from "three";
import type { Pizza } from "@/lib/types";
import { rng } from "./ingredientMeshes";
import { ps1Material } from "./ps1Material";

const RADIUS = 1;
const DEPTH = 0.14;
const BEVEL = 0.13;
/** Half-moon centroid sits 4r/3π behind the straight fold; shift it to the origin. */
const CENTROID = (4 * RADIUS) / (3 * Math.PI);
const CRIMPS = 15;

/** A folded half-moon, puffed up by the bevel. Fold faces the camera, seam at the back. */
function calzoneGeometry(): ExtrudeGeometry {
  const s = new ThreeShape();
  s.moveTo(-RADIUS, 0);
  s.absarc(0, 0, RADIUS, Math.PI, 0, true);
  s.lineTo(-RADIUS, 0);
  const geo = new ExtrudeGeometry(s, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL * 0.9,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2); // lie flat; the arc ends up at the back (-z)
  geo.translate(0, BEVEL - 0.06, CENTROID);
  return geo;
}

/** Seam crimps along the curved edge and a few dark bake spots on top. */
function details(pizza: Pizza) {
  const rand = rng(pizza.id);
  const top = DEPTH + BEVEL * 2 - 0.06;
  const o = new Object3D();
  const crimps: Matrix4[] = [];
  for (let i = 0; i < CRIMPS; i++) {
    const a = Math.PI * (0.04 + (0.92 * i) / (CRIMPS - 1));
    // Long axis points outward from the curved edge (world radial is (cos a, 0, -sin a)).
    o.position.set(Math.cos(a) * (RADIUS + 0.1), 0.12, CENTROID - Math.sin(a) * (RADIUS + 0.1));
    o.rotation.set(0, a, 0.35);
    o.updateMatrix();
    crimps.push(o.matrix.clone());
  }
  const spots: Matrix4[] = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.15 + rand() * 0.7);
    const r = Math.sqrt(rand()) * 0.55;
    o.position.set(Math.cos(a) * r, top + 0.002, CENTROID - Math.sin(a) * r - 0.05);
    o.rotation.set(0, rand() * Math.PI, 0);
    o.scale.setScalar(0.6 + rand() * 0.8);
    o.updateMatrix();
    spots.push(o.matrix.clone());
  }
  return { crimps, spots };
}

export function Calzone({ pizza, reduce }: { pizza: Pizza; reduce: boolean }) {
  const group = useRef<Group>(null);
  const crimpMesh = useRef<InstancedMesh>(null);
  const spotMesh = useRef<InstancedMesh>(null);
  const born = useRef<number | null>(null);

  const res = useMemo(
    () => ({
      body: calzoneGeometry(),
      bodyMat: ps1Material({ color: "#d9a066" }),
      crimp: new BoxGeometry(0.16, 0.07, 0.1),
      crimpMat: ps1Material({ color: "#b8763a" }),
      spot: new CylinderGeometry(0.06, 0.06, 0.006, 5),
      spotMat: ps1Material({ color: "#8a4f22" }),
    }),
    [],
  );
  const { crimps, spots } = useMemo(() => details(pizza), [pizza]);

  useLayoutEffect(() => {
    crimps.forEach((m, i) => crimpMesh.current?.setMatrixAt(i, m));
    spots.forEach((m, i) => spotMesh.current?.setMatrixAt(i, m));
    if (crimpMesh.current) crimpMesh.current.instanceMatrix.needsUpdate = true;
    if (spotMesh.current) spotMesh.current.instanceMatrix.needsUpdate = true;
  }, [crimps, spots]);

  useLayoutEffect(
    () => () => {
      Object.values(res).forEach((r) => r.dispose());
    },
    [res],
  );

  // Drops in and squashes on landing, like the pizzas' toppings.
  useFrame((state) => {
    if (!group.current) return;
    born.current ??= state.clock.elapsedTime;
    const t = reduce ? 1 : Math.min(1, (state.clock.elapsedTime - born.current) / 0.5);
    const squash = reduce ? 0 : Math.sin(Math.min(1, t * 1.25) * Math.PI) * 0.18 * (1 - t);
    group.current.position.y = (1 - t) * (1 - t) * 1.2;
    group.current.scale.set(1 + squash, 1 - squash, 1 + squash);
  });

  return (
    <group ref={group}>
      <mesh geometry={res.body} material={res.bodyMat} />
      <instancedMesh ref={crimpMesh} args={[res.crimp, res.crimpMat, crimps.length]} frustumCulled={false} />
      <instancedMesh ref={spotMesh} args={[res.spot, res.spotMat, spots.length]} frustumCulled={false} />
    </group>
  );
}
