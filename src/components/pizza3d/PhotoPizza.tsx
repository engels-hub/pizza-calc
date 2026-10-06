"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CylinderGeometry, NearestFilter, NoColorSpace, TextureLoader, type Mesh, type Texture } from "three";
import { ps1Material } from "./ps1Material";

const TEXTURE_SIZE = 128;

/** The pizzeria's own photo, shrunk to 128 px and wrapped onto a low-poly disc. */
export function PhotoPizza({ url, onError, reduce }: { url: string; onError: () => void; reduce: boolean }) {
  const [tex, setTex] = useState<Texture | null>(null);
  const mesh = useRef<Mesh>(null);
  const born = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    const src = `/api/img?s=${TEXTURE_SIZE}&src=${encodeURIComponent(url)}`;
    new TextureLoader().load(
      src,
      (t) => {
        t.magFilter = NearestFilter;
        t.minFilter = NearestFilter;
        t.generateMipmaps = false;
        t.colorSpace = NoColorSpace;
        if (alive) setTex(t);
        else t.dispose();
      },
      undefined,
      () => alive && onError(),
    );
    return () => {
      alive = false;
    };
  }, [url, onError]);

  useEffect(() => () => tex?.dispose(), [tex]);

  const geometry = useMemo(() => new CylinderGeometry(1, 0.96, 0.11, 18, 1), []);
  const materials = useMemo(
    () => [ps1Material({ color: "#c98d52" }), tex ? ps1Material({ map: tex }) : ps1Material({ color: "#e0b27a" }), ps1Material({ color: "#a8713f" })],
    [tex],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Drop in with a little overshoot once the photo is ready.
  useFrame((state) => {
    if (!mesh.current || !tex) return;
    born.current ??= state.clock.elapsedTime;
    const t = Math.min(1, (state.clock.elapsedTime - born.current) / 0.55);
    const k = reduce ? 1 : easeOutBack(t);
    mesh.current.scale.setScalar(0.55 + 0.45 * k);
    mesh.current.position.y = reduce ? 0 : (1 - t) * 0.9;
  });

  return <mesh ref={mesh} geometry={geometry} material={materials} />;
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
