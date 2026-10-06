import { Color, LinearSRGBColorSpace, ShaderMaterial, Vector2, Vector3, type Texture } from "three";

// PS1 look in three ingredients:
//  1. vertices snap to a coarse screen grid (the famous wobble),
//  2. texture coordinates are interpolated affinely (no perspective correction),
//  3. colour is quantised to 15-bit with a 4x4 Bayer dither.
// Colours are kept as raw sRGB end to end (no colour management), like the hardware did.

const vertexShader = /* glsl */ `
  uniform vec2 uSnap;
  uniform vec3 uLightDir;
  varying vec3 vAffine;
  varying vec3 vTint;
  varying float vLight;

  void main() {
    vec4 local = vec4(position, 1.0);
    vec3 n = normal;
    #ifdef USE_INSTANCING
      local = instanceMatrix * local;
      n = mat3(instanceMatrix) * n;
    #endif

    vec4 clip = projectionMatrix * modelViewMatrix * local;
    vec2 ndc = clip.xy / clip.w;
    ndc = floor(ndc * uSnap + 0.5) / uSnap;
    clip.xy = ndc * clip.w;
    gl_Position = clip;

    vec3 worldNormal = normalize(mat3(modelMatrix) * n);
    vLight = 0.5 + 0.6 * max(dot(worldNormal, normalize(uLightDir)), 0.0);

    // uv * w, interpolated perspective-correct, then divided by w in the
    // fragment shader gives plain screen-space (affine) interpolation.
    vAffine = vec3(uv * clip.w, clip.w);

    vTint = vec3(1.0);
    #ifdef USE_INSTANCING_COLOR
      vTint = instanceColor;
    #endif
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uUseMap;
  uniform vec3 uColor;
  uniform float uLevels;
  varying vec3 vAffine;
  varying vec3 vTint;
  varying float vLight;

  const float bayer[16] = float[16](
    0.0, 8.0, 2.0, 10.0,
    12.0, 4.0, 14.0, 6.0,
    3.0, 11.0, 1.0, 9.0,
    15.0, 7.0, 13.0, 5.0
  );

  void main() {
    vec3 base = uColor * vTint;
    if (uUseMap > 0.5) {
      vec2 uv = vAffine.xy / vAffine.z;
      base *= texture2D(uMap, uv).rgb;
    }
    vec3 c = base * vLight;

    ivec2 p = ivec2(mod(gl_FragCoord.xy, 4.0));
    float threshold = bayer[p.x + p.y * 4] / 16.0 - 0.5;
    c = floor(c * uLevels + threshold + 0.5) / uLevels;

    gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }
`;

/** Raw sRGB colour, bypassing three's linear working space on purpose. */
export function raw(hex: string): Color {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return new Color().setRGB(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, LinearSRGBColorSpace);
}

export const SNAP = new Vector2(96, 72);

export function ps1Material(opts: { color?: string; map?: Texture | null }): ShaderMaterial {
  const c = raw(opts.color ?? "#ffffff");
  return new ShaderMaterial({
    uniforms: {
      uMap: { value: opts.map ?? null },
      uUseMap: { value: opts.map ? 1 : 0 },
      uColor: { value: new Vector3(c.r, c.g, c.b) },
      uSnap: { value: SNAP },
      uLightDir: { value: new Vector3(0.35, 1, 0.55) },
      uLevels: { value: 31 },
    },
    vertexShader,
    fragmentShader,
  });
}
