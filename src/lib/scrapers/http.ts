const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

export async function fetchHtml(url: string, timeoutMs = 12_000): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "lv,en;q=0.8" },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

/** Run `fn` over `items` with at most `limit` in flight. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parsePrice(s: string): number {
  const n = Number.parseFloat(s.replace(/[^\d.,]/g, "").replace(",", "."));
  if (!Number.isFinite(n)) throw new Error(`Bad price: ${s}`);
  return n;
}
