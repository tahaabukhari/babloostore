# HomeBEZ storefront — Pass 1 (design)

Next.js 15 (App Router) + Tailwind v4 prototype of the shopper storefront, built on the locked v1 tokens in [`../design/tokens.css`](../design/tokens.css) and the rules in [`../docs/03-design-system.md`](../docs/03-design-system.md).

**This is a design pass.** Catalog, prices, stock, stores and reviews are illustrative fixtures in `src/lib/data.ts`. There is no backend, checkout, auth or payment yet.

## Screens

| Route | What to review |
| --- | --- |
| `/` | Home composition (campaign, service strip, deals with real end time, budgets, editorial, stores, Load more with URL state) |
| `/search?q=&category=&store=&min=&max=&instock=&sort=` | Catalog/search: URL-preserved filters, chips, sort, result count, empty state, mobile bottom-sheet filters |
| `/product/[slug]` | Gallery (thumbnails, arrow keys, zoom), variant selector with sold-out reasons, quantity limit, delivery/fees/returns/warranty, seller card, reviews, sticky mobile buy bar |
| `/cart` | Multi-seller grouping, per-store delivery and free-delivery threshold, stock conflict, remove with undo |
| `/design` | Component kit and interaction states, plus the design review checklist |

Cart state is client-side (`localStorage`) and seeded with a three-store cart on first visit.

## Run

```bash
npm install
npm run dev
```

## Notes

- Fonts: Manrope + Inter self-hosted via `next/font` (WOFF2, `display: swap`). Urdu/Noto Sans Arabic is deferred until the Urdu scope is approved.
- Logo: `public/brand/*` are interim crops of the brand poster; a production vector logo is still needed.
- Product imagery is placeholder art (`ProductArt`) until real seller photography exists.
