# HomeBEZ marketplace research and build blueprint

Research baseline: 20 October 2026. This is a separate side project from the games in the parent workspace. No application has been implemented in this research round.

HomeBEZ will launch as a Pakistan-first, curated retail marketplace with public browsing and checkout. Vendors are approved by admins and receive access through assigned email addresses. There is no public seller registration. The attached HomeBEZ logo is the brand reference.

## Decisions

| Area | Baseline |
| --- | --- |
| Launch model | Curated multi-category B2C marketplace |
| Initial categories | Fashion, beauty and fragrances, jewellery and accessories, home and living, selected electronic accessories |
| Geography and currency | Pakistan, PKR; coverage depends on courier serviceability |
| Seller access | Admin creation, approval, assigned email, expiring activation invitation |
| Buyer access | Public catalog and checkout; guest checkout is the proposed default |
| Visual direction | Warm ivory, charcoal, gold; product-led discovery with curated collections |
| Fonts | Manrope headings; Inter interface and prices; Noto Sans Arabic for Urdu |
| Architecture recommendation | Next.js storefront and seller portal, Medusa commerce foundation, custom marketplace modules, PostgreSQL |
| Financial operations | Separate seller orders, shipment records, refunds, commissions and settlement ledger |
| Current stage | Research and design specification; backend choice needs a focused proof of concept |

The user confirmed public buyer access and invite-only vendors. Category details, guest checkout, moderation rules and operational defaults below are planning decisions, not previously agreed business policies.

## Documents

1. [Research and references](docs/01-research.md) explains the evidence, competitor patterns and implications.
2. [Product requirements](docs/02-product-requirements.md) defines shoppers, invited vendors, admins and acceptance criteria.
3. [Design system](docs/03-design-system.md) locks visual and font rules for the first implementation.
4. [Backend architecture](docs/04-backend-architecture.md) defines modules, data, security, money movement and integrations.
5. [Delivery plan](docs/05-delivery-plan.md) defines milestones, operational decisions and release gates.
6. [Design tokens](design/tokens.css) contains framework-independent values for implementation.

The visual system is the chosen v1 baseline. Rendered screens still need review before the application build. Superdesign canvas generation requires a signed-in session.

## Storefront prototype

[storefront/](storefront/README.md) is the HomeBEZ Next.js marketplace: Postgres (Neon) via Drizzle, invite-only store sign-up, store owner dashboard (products with photo uploads, orders), and cash-on-delivery checkout that splits orders per store.

## Saved references and verification

[Readable blueprint](https://chatgpt.com/space/page_d1b6026b5a348191a1d9494b9e1f9d79) contains the research, requirements, design system, architecture and delivery plan. Its saved title and five main sections were read back successfully. The Page layout has not been visually inspected.

The original supplied image is preserved at [HomeBEZ brand reference](design/assets/homebez-brand-reference.png). It remains a reference poster; a compact production logo is still needed.

Calculated contrast checks: ink on gold 10.70:1, secondary text on canvas 6.65:1, green on white 7.04:1, gold-ink on white 7.29:1, control boundary on white 4.19:1, and blue focus on canvas 6.44:1. These checks cover those color pairs only. Rendered screens, all interaction states, font files and application behavior remain unverified.
