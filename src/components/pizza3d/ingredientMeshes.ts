import {
  BoxGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  TorusGeometry,
  type BufferGeometry,
} from "three";

export interface Recipe {
  geometry: () => BufferGeometry;
  colors: string[];
  count: number;
  /** Lie flat (rings, arcs) instead of standing up. */
  flat?: boolean;
}

// Low-poly on purpose: 5 to 8 sided discs read as PS1 era immediately.
const disc = (r: number, h = 0.022, seg = 7) => () => new CylinderGeometry(r, r, h, seg);
const box = (x: number, y: number, z: number) => () => new BoxGeometry(x, y, z);
const ring = (r: number, t: number, arc = Math.PI * 2) => () => new TorusGeometry(r, t, 3, 7, arc);
const nugget = (r: number) => () => new IcosahedronGeometry(r, 0);
const chunk = (r: number) => () => new DodecahedronGeometry(r, 0);

export const RECIPES: Record<string, Recipe> = {
  salami: { geometry: disc(0.13), colors: ["#a3262f", "#b0303a"], count: 8 },
  pepperoni: { geometry: disc(0.095), colors: ["#b9381f", "#a32f1a"], count: 12 },
  ham: { geometry: box(0.17, 0.016, 0.13), colors: ["#e8a0a0", "#dc8d90"], count: 7 },
  bacon: { geometry: box(0.24, 0.016, 0.07), colors: ["#b8564a", "#e3b5a4"], count: 7 },
  chicken: { geometry: box(0.1, 0.05, 0.08), colors: ["#e9d1a8", "#d9b886"], count: 9 },
  minced: { geometry: nugget(0.045), colors: ["#6b3a26", "#57301f"], count: 16 },
  beef: { geometry: box(0.14, 0.03, 0.05), colors: ["#6e3524", "#5a2a1c"], count: 10 },
  prosciutto: { geometry: box(0.22, 0.01, 0.12), colors: ["#d4767c", "#e19a9a"], count: 6 },
  salmon: { geometry: box(0.17, 0.016, 0.08), colors: ["#f0895c", "#f6a27c"], count: 7 },
  tuna: { geometry: chunk(0.055), colors: ["#c9a27e", "#b38b66"], count: 10 },
  shrimp: { geometry: ring(0.06, 0.026, Math.PI * 1.3), colors: ["#f2976f", "#f7b08f"], count: 7, flat: true },
  seafood: { geometry: ring(0.045, 0.02), colors: ["#e8b79a", "#d8d0c4"], count: 9, flat: true },

  mushroom: { geometry: () => new CylinderGeometry(0.09, 0.06, 0.03, 6), colors: ["#d9c4a6", "#c4ab88"], count: 9 },
  tomato: { geometry: disc(0.1), colors: ["#d93b2b", "#c8321f"], count: 6 },
  "cherry-tomato": { geometry: nugget(0.05), colors: ["#e0302a"], count: 8 },
  "bell-pepper": { geometry: ring(0.07, 0.016, Math.PI), colors: ["#3f8f3a", "#d7402c", "#e8b631"], count: 9, flat: true },
  "pickled-pepper": { geometry: ring(0.06, 0.016, Math.PI), colors: ["#c9a13a", "#b9862c"], count: 8, flat: true },
  jalapeno: { geometry: ring(0.04, 0.016), colors: ["#4a8c2a"], count: 10, flat: true },
  onion: { geometry: ring(0.07, 0.01), colors: ["#ecdcea", "#d8b6d4"], count: 9, flat: true },
  "spring-onion": { geometry: disc(0.022, 0.02, 5), colors: ["#6fae3e", "#8ac25a"], count: 22 },
  pineapple: { geometry: box(0.08, 0.03, 0.08), colors: ["#f2d14b", "#ecc232"], count: 10 },
  pickles: { geometry: disc(0.07, 0.016), colors: ["#7a9a3a", "#8fae4a"], count: 8 },
  olives: { geometry: ring(0.034, 0.018), colors: ["#2b2a24", "#5b6b2c"], count: 10, flat: true },
  corn: { geometry: nugget(0.028), colors: ["#f4cd33"], count: 22 },
  beans: { geometry: nugget(0.035), colors: ["#7a2f22", "#8b3a28"], count: 14 },
  arugula: { geometry: box(0.15, 0.006, 0.06), colors: ["#4f8f3a", "#3d7a2c"], count: 10 },
  spinach: { geometry: box(0.13, 0.006, 0.09), colors: ["#2f6b2a", "#3b7d33"], count: 8 },
  lettuce: { geometry: box(0.14, 0.006, 0.09), colors: ["#9fd06a", "#8e3a6b"], count: 9 },
  soy: { geometry: nugget(0.04), colors: ["#a1784f", "#8d6640"], count: 14 },

  mozzarella: { geometry: disc(0.11, 0.024, 8), colors: ["#fbf4e4"], count: 6 },
  parmesan: { geometry: box(0.06, 0.01, 0.03), colors: ["#f1e2b0"], count: 14 },
  "blue-cheese": { geometry: chunk(0.05), colors: ["#dfe3e8", "#c8d0dc"], count: 8 },
  "cream-cheese": { geometry: nugget(0.06), colors: ["#fbf6ee"], count: 7 },
  feta: { geometry: box(0.06, 0.05, 0.06), colors: ["#f5f2ea"], count: 10 },

  herbs: { geometry: box(0.025, 0.006, 0.02), colors: ["#3f6b2a", "#5b8f3c"], count: 34 },
  dill: { geometry: box(0.04, 0.004, 0.012), colors: ["#5f9a3a"], count: 26 },
  "black-pepper": { geometry: box(0.014, 0.014, 0.014), colors: ["#2a2522"], count: 30 },
  garlic: { geometry: box(0.03, 0.01, 0.02), colors: ["#f0ead8"], count: 16 },
  chili: { geometry: box(0.02, 0.008, 0.02), colors: ["#c2261b"], count: 24 },
};

/** Sauces that are not the base: thin drizzle strokes. */
export const SAUCE_COLORS: Record<string, string> = {
  "garlic-sauce": "#f2ecdc",
  "bbq-sauce": "#5a2a17",
  "curry-sauce": "#e2a531",
  "lemon-sauce": "#f4e8a8",
  pesto: "#4c7a2c",
  harissa: "#c9452a",
  mayo: "#f6efd9",
  "cucumber-sauce": "#e7efd8",
  "sweet-chili": "#e2542e",
  "korean-sauce": "#8e2a1c",
  "cheeseburger-sauce": "#e8a14a",
  "steak-sauce": "#4a2418",
  "kebab-sauce": "#f3ead4",
};

export const FALLBACK: Recipe = { geometry: nugget(0.04), colors: ["#9b7b5b"], count: 10 };

/** Small deterministic PRNG so the same pizza always gets the same layout. */
export function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
