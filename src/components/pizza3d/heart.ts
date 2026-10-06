import { ExtrudeGeometry, Shape as ThreeShape, type Vector2 } from "three";

/**
 * A heart about as wide as the round pizza (diameter 2), tip towards +y.
 * Few curve segments on purpose: the facets read as PS1-era geometry.
 */
function heartShape(): ThreeShape {
  const s = new ThreeShape();
  s.moveTo(0, 0.5);
  s.bezierCurveTo(0.35, 1.05, 1.15, 0.85, 1.0, 0.15);
  s.bezierCurveTo(0.9, -0.3, 0.35, -0.6, 0, -1.0);
  s.bezierCurveTo(-0.35, -0.6, -0.9, -0.3, -1.0, 0.15);
  s.bezierCurveTo(-1.15, 0.85, -0.35, 1.05, 0, 0.5);
  return s;
}

const SHAPE = heartShape();
const OUTLINE: Vector2[] = SHAPE.getPoints(8);

/**
 * A flat heart slab lying in the XZ plane, centred on y = 0 like the round
 * pizza's cylinders, so the same y offsets work for both shapes. The tip
 * points towards +z (the camera side).
 */
export function heartSlab(scale: number, depth: number): ExtrudeGeometry {
  const geo = new ExtrudeGeometry(SHAPE, { depth, bevelEnabled: false, curveSegments: 5 });
  // Extrusion now points up (+y) and shape (x, y) lands on world (x, -y): lobes
  // at the back, tip towards the camera, so the heart reads upright on screen.
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -depth / 2, 0);
  geo.scale(scale, 1, scale);
  return geo;
}

/** Is world point (x, z) inside the heart scaled by `scale`? Ray casting on the outline. */
export function insideHeart(x: number, z: number, scale: number): boolean {
  // Undo the slab's rotation: world (x, z) is shape (x, -z).
  const px = x / scale;
  const py = -z / scale;
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const a = OUTLINE[i];
    const b = OUTLINE[j];
    if (a.y > py !== b.y > py && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
