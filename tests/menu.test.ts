import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {} }));
vi.mock("@/lib/scrapers/picu", () => ({ scrapePicu: vi.fn(async () => Promise.reject(new Error("HTTP 503"))) }));
vi.mock("@/lib/scrapers/lulu", () => ({ scrapeLulu: vi.fn(async () => []) }));

describe("getMenus", () => {
  it("falls back to the bundled snapshot when scraping fails or returns too little", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getMenus } = await import("@/lib/menu");
    const menu = await getMenus();
    expect(menu.stale).toBe(true);
    expect(menu.sources.picu).toMatchObject({ live: false, count: 30 });
    expect(menu.sources.lulu).toMatchObject({ live: false, count: 47 });
    expect(menu.pizzas).toHaveLength(77);
  });
});
