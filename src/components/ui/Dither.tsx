import { useId } from "react";

// 4x4 Bayer matrix: a cell turns on once the band density passes its value.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * A gradient drawn the way 32-bit consoles faked one: hard bands of an
 * ordered dither pattern between two colours, with chunky square pixels.
 */
export function Dither({
  from,
  to,
  shape = "radial",
  bands = 8,
  cell = 3,
  className,
}: {
  from: string;
  to: string;
  shape?: "radial" | "linear";
  bands?: number;
  cell?: number;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const levels = Array.from({ length: bands + 1 }, (_, i) => Math.round((i * 16) / bands));
  const tile = cell * 4;

  return (
    <svg className={className} width="100%" height="100%" shapeRendering="crispEdges" aria-hidden preserveAspectRatio="none">
      <defs>
        {levels.map((k) => (
          <pattern key={k} id={`${id}-${k}`} width={tile} height={tile} patternUnits="userSpaceOnUse">
            <rect width={tile} height={tile} style={{ fill: from }} />
            {BAYER.map((v, i) =>
              v < k ? <rect key={i} x={(i % 4) * cell} y={Math.floor(i / 4) * cell} width={cell} height={cell} style={{ fill: to }} /> : null,
            )}
          </pattern>
        ))}
      </defs>
      <rect width="100%" height="100%" style={{ fill: from }} />
      {shape === "radial"
        ? levels.map((k, i) => (
            <circle key={k} cx="50%" cy="46%" r={`${(1 - i / (bands + 1)) * 62}%`} fill={`url(#${id}-${k})`} />
          ))
        : levels.map((k, i) => (
            <rect key={k} x="0" y={`${(i / levels.length) * 100}%`} width="100%" height={`${100 / levels.length + 0.5}%`} fill={`url(#${id}-${k})`} />
          ))}
    </svg>
  );
}
