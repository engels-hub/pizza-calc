# Picu kalkulators

How much pizza to order for a group, and what it costs at **Picu darbnīca** and **LuLū** in Riga.

- **Amount:** the rule of thumb is *n − 1 pizzas of 30 cm for n people*. Other sizes (20, 23 and 45 cm) are converted by area. The rule is adjustable: offset, pizzas per person, appetite and base size.
- **Menus:** scraped live from picudarbnica.lv and lulu.lv, cached for 6 hours. If a scrape fails, a bundled snapshot is used instead.
- **Filters:** by pizzeria, by vegetarian / vegan / spicy, and by ingredient, with include and exclude.
- **Prices:** the total before and after the real promos (takeaway −15%, every 3rd pizza free, flash codes, birthday −15%) and an optional custom % or € discount.
- **3D pizza:** a spinning pizza in PS1 style, built from the pizzeria photo or from its ingredients.

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

## Stack

Next.js 16 (Cache Components), React 19, Tailwind CSS 4, Motion, React Three Fiber, zustand, vaul, cheerio, sharp, vitest.
