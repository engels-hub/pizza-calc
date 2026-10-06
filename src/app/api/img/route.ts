import type { NextRequest } from "next/server";
import sharp from "sharp";

const ALLOWED_HOSTS = new Set(["www.picudarbnica.lv", "picudarbnica.lv", "www.lulu.lv", "lulu.lv"]);

// Same-origin, tiny, square copies of the pizzeria photos. WebGL needs
// same-origin textures, and 128 px is exactly the PS1 look we want anyway.
export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");
  const size = Math.min(512, Math.max(32, Number(req.nextUrl.searchParams.get("s")) || 128));

  let url: URL;
  try {
    url = new URL(src ?? "");
  } catch {
    return new Response("Bad src", { status: 400 });
  }
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const upstream = await fetch(url, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
  if (!upstream?.ok) return new Response("Upstream failed", { status: 502 });

  const out = await sharp(Buffer.from(await upstream.arrayBuffer()))
    .resize(size, size, { fit: "cover", position: "centre" })
    .png({ palette: true, colours: 64 })
    .toBuffer();

  return new Response(new Uint8Array(out), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=604800, stale-while-revalidate=86400",
    },
  });
}
