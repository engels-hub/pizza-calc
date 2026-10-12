# Picu kalkulators

How much pizza to order for a group, and what it costs at **Picu darbnīca** and **LuLū** in Riga.

- **Amount:** an average person eats *n_b slices* of a base pizza (default 6 slices of a 30 cm, cut in 8). Appetite scales that (×0.75 / ×1 / ×1.25). Area per person = π(D_b/2)² · slices / slices in the base pizza; total area = that × people; pizzas = ⌈total ÷ π(D_p/2)²⌉ for the chosen size. Slices per pizza follow the usual cut for each size (20 cm 4, 23 cm 6, 30 cm 8, 45 cm 12), and the cart shows how the actual slices split between people. Picu darbnīca's rule of thumb, *n − 1 pizzas of 30 cm for n people* (appetite scales n), is kept as a second method.
- **Menus:** scraped live from picudarbnica.lv and lulu.lv, cached for 6 hours. If a scrape fails, a bundled snapshot is used instead.
- **Filters:** by pizzeria, by vegetarian / vegan / spicy, and by ingredient, with include and exclude.
- **Prices:** the total before and after the real promos (LuLū takeaway −15%, every 3rd pizza free, flash codes; Picu darbnīca drauga card −10%, birthday −15%) and an optional custom % or € discount. LuLū's €0.39 box charge per pizza is added after discounts.
- **Pus-pus:** LuLū's half-and-half 45 cm pizza. Pick "Pus-pus 45 cm" as a size, then the second half. Each half costs that pizza's price on lulu.lv/pus-pus-pica (today its 30 cm price + €0.50); the pizza costs both halves added up.
- **Cart:** a spinning PS1-style 3D stack of every chosen pizza, built from its ingredients and drawn to scale by size.

The UI is in Latvian.

## Develop

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm test` | unit tests (calculation, discounts, scrapers against saved HTML, snapshot fallback) |
| `npm run snapshot` | re-scrape both menus into `src/data/snapshot/` |
| `npm run build` | production build (scrapes during prerender) |

Promo codes and their dates live in `src/data/promos.ts` and are updated by hand.

## Where things live

| Path | What it holds |
| --- | --- |
| `src/content/lv.ts` | every user-facing string: UI copy, promo titles, ingredient and pizzeria names |
| `src/lib/` | pure logic (calculation, discounts, filters, ingredient matching), scrapers, the store |
| `src/hooks/` | shared client hooks (`useTotals`, `useRecommendation`, `useToday`) |
| `src/components/` | grouped by feature: `planner`, `deals`, `cart`, `menu`, `pizza3d`, `layout`, `ui` |
| `src/app/page.tsx` | a Server Component: cached static shell plus the personal calculator in a `<Suspense>` boundary |
| `src/lib/prefs.ts` | the visitor's saved choices, encoded into one small cookie the server reads |

## Rendering

`/` uses Partial Prerendering (Cache Components). The header, footer and menu data are prerendered and cached for 6 hours. The calculator reads the `picu` cookie (people, rules, size, cart ids, active discounts), so it renders on the server per request and streams into the same response. Saved carts arrive already in the HTML, with prices from the current menu, and promo dates are judged in Riga time on the server. The zustand store is created per request through a context provider, never as a module singleton.

## Stack

Next.js 16 (Cache Components, Partial Prerendering, React Compiler), React 19, Tailwind CSS 4, Motion, React Three Fiber, zustand, vaul, cheerio, sharp, vitest.

## Deploy (TrueNAS + Cloudflare Tunnel)

Every push to `main` (and a daily rebuild) runs the tests and publishes `ghcr.io/engels-hub/pizza-calc:latest` via GitHub Actions. The image is the Next.js standalone server on port 3000.

1. **TrueNAS SCALE:** Apps > Discover Apps > Custom App > Install via YAML. Paste `deploy/compose.yaml`. The site is published on host port 3000.
2. **Cloudflare:** Zero Trust > Networks > Tunnels > your tunnel > Published application routes. Add `pizza.apapss.id.lv` with service `HTTP` and `<truenas-ip>:3000`.
3. **Update:** after a new image is built, redeploy the app in TrueNAS (the compose file pulls `latest` on start).

To try the image locally: `docker build -t pizza-calc . && docker run -p 3000:3000 pizza-calc`.
