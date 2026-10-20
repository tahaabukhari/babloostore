# HomeBEZ design system

Version 1 baseline, 20 October 2026. Lock this system for the initial screens and implementation. The direction is a warm, engaging marketplace with dense enough product discovery to feel useful and enough spacing to make prices, seller information and choices clear. Screen compositions remain subject to rendered review.

## Brand and visual direction

Use HomeBEZ and the supplied gold/white house-cart identity. Pair a charcoal shopping header with ivory page backgrounds and white product cards. Gold marks important actions and brand moments. A deep green communicates verified status and success. Use photography, curated collections and seller storytelling to create variety while keeping controls consistent.

Daraz is the primary interaction reference for category discovery and product-led merchandising. Alibaba informs seller transparency; Temu informs approachable deal discovery. These are functional references; HomeBEZ uses its own palette, composition, voice and assets.

Prepare compact horizontal and symbol-only assets from the provided logo, retaining recognizable proportions. Keep the source poster for reference. Do not stretch it into the header, invent a replacement mark, or render the tagline so small that it becomes noise. Use a dark backing for the supplied white-and-gold identity. Metallic gradients belong in the logo or limited campaign artwork; functional surfaces use solid colors.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| canvas | #F7F5EF | Main shopping background |
| surface | #FFFFFF | Cards, forms and popovers |
| surface-muted | #F0EDE5 | Image mats and quiet sections |
| ink | #191A18 | Text and charcoal header |
| ink-secondary | #55584F | Secondary text |
| gold | #F4C451 | Primary action background with ink text |
| gold-hover | #E7B33B | Hover action background |
| gold-soft | #FFF2C7 | Campaign and selected surfaces |
| gold-ink | #735008 | Gold-toned text on light surfaces |
| green | #216448 | Success and explained verification |
| green-soft | #E8F2EC | Success surface |
| danger | #B42318 | Errors and destructive actions |
| danger-soft | #FFF0ED | Error surface |
| info | #2857A4 | Information and help |
| border | #DEDFD8 | Decorative dividers and card separation |
| control-border | #7A7D73 | Input and control boundaries |
| focus | #2857A4 | Focus indicator on light surfaces |

Use ink text on gold buttons. White text on gold is disallowed. Muted decorative borders are not sufficient for identifying interactive controls. Evaluate all state/color combinations for contrast; token selection alone does not certify accessibility. A second, light focus color is needed on the charcoal header.

## Font system

| Role | Family | Weights | Rules |
| --- | --- | --- | --- |
| Display and section headings | Manrope | 600, 700, 800 | Tight but readable; no all-caps paragraphs |
| Body, controls, product titles, prices and dashboards | Inter | 400, 500, 600, 700 | Tabular numerals for money and tables |
| Urdu interface | Noto Sans Arabic | 400, 500, 600, 700 | 1.8 line height, no letter spacing |

Self-host WOFF2 with the appropriate licenses and font-display swap. Load only necessary Latin fonts initially; load Arabic font resources with Urdu content. System fallbacks remain usable while fonts load. Font identity is locked; exact files and subsets are selected during implementation. Test Urdu strings, shaping, mixed Latin prices and diacritics on actual devices before shipping Urdu.

| Style | Desktop size / line height | Mobile size / line height |
| --- | --- | --- |
| Campaign heading | 48 / 56 px | 30 / 36 px |
| Page heading | 32 / 40 px | 26 / 34 px |
| Section heading | 24 / 32 px | 20 / 28 px |
| Product title | 14 / 20 px | 14 / 20 px |
| Product price | 20 / 28 px | 18 / 24 px |
| Body | 16 / 24 px | 16 / 24 px |
| UI label | 14 / 20 px | 14 / 20 px |
| Supporting metadata | 12 / 18 px | 12 / 18 px |

Use Rs. 2,490 in storefront examples, and PKR in receipts and reports where currency ambiguity matters. Backend money values remain integer minor units. Store time in UTC; localize customer-facing timestamps to Asia/Karachi. Use semantic headings, never size alone to establish document hierarchy.

## Layout and spacing

Use a 4 px spacing base with 4, 8, 12, 16, 20, 24, 32, 40, 48 and 64 px steps. Maximum content width is 1320 px. Gutters are 16 px on phones, 24 px on tablets and 32 px on desktop. Product-grid gaps are 12 px on mobile and 20 px on desktop.

| Width | Product columns | Navigation |
| --- | --- | --- |
| 320–639 px | 2 | Compact header, full-width search, bottom navigation |
| 640–1023 px | 3 | Condensed header and accessible category drawer |
| 1024–1279 px | 4 | Full header and categories; filters beside grid |
| 1280 px and above | 6 on home; 4–5 with filters | Full discovery layout |

At narrow widths, price, title and availability take priority over secondary metadata. All layouts must reflow without page-level horizontal scrolling at 320 px. Full-width bottom sheets handle mobile filters; focus returns to the trigger when dismissed. Tables in operations tools can use a clearly labeled scroll region or switch to cards.

Use 12 px card radii, 10 px controls, 20 px campaign panels, and full-radius chips. Cards use a quiet border, with a small elevation on hover. Reserve a stronger shadow for floating surfaces. Keep operational forms and tables denser than marketing sections.

## Home composition

1. A slim utility row for support, tracking and seller sign-in.
2. Charcoal header with the supplied logo, delivery location, dominant search, account and cart.
3. Accessible category navigation with Fashion, Beauty, Jewellery, Electronics accessories, Home and More.
4. One campaign composition: a broad editorial panel with product imagery and a smaller curated collection tile on desktop. Stack on mobile; avoid an autoplay carousel.
5. A concise service strip with only verified promises, such as available payment options and explained return rules.
6. Deals with a purpose: a product row and real campaign end time where applicable.
7. Browse by category and budget.
8. Everyday upgrades: an editorial collection plus product cards.
9. Meet the stores: approved seller profiles and their actual products.
10. More to discover, using a Load more action with restorable navigation state.
11. Policy, contact and payment information in a structured footer.

At least one product section should enter the first desktop viewport at approximately 1440 × 900. On mobile, keep the campaign compact enough that category or product discovery follows quickly. Seller acquisition banners are secondary to shopping.

## Component contracts

| Component | Required behavior |
| --- | --- |
| Product card | Square contained image, accessible title link, two-line title, current price, supported comparison price, review count if real, seller/delivery metadata where useful |
| Primary button | Gold with ink text, 44 px minimum touch target, loading state and protection against duplicate submission |
| Secondary button | White surface, ink text, visible boundary, same sizing and focus rules |
| Search | Search icon, persistent label, keyboard-operable suggestions, clear query, recent searches with appropriate privacy handling |
| Filter | Real result count, selected chips, reset action, URL-preserved state; mobile applies changes explicitly |
| Variant selector | Text label plus color/size, unavailable state with reason, selection required before add to cart |
| Quantity control | Accessible increment/decrement names and inventory limit feedback |
| Trust badge | Name and explanation of actual checks; no unexplained universal protection promise |
| Status label | Text plus icon/color for pending, paid, shipped, delivered, refunded and rejected |
| Form field | Persistent label, helper text, inline error and error summary; no placeholder-only labels |
| Toast | Accessible announcement for reversible feedback; critical failures also remain beside the action |
| Product gallery | Contained product views, zoom, keyboard navigation and useful alternative text |

Cards should not nest interactive links and buttons inside one another. Wishlist is an independent control. Cart grouping and delivery fees must remain visible enough to explain multi-vendor shipping.

## Image direction and copy

Use clean seller-owned product photography on white or light neutral mats, with consistent square catalog framing and preserved product colors. Editorial collection photography may have warmer backgrounds. Require sufficient resolution and several useful angles; avoid text-heavy listing images. Compress and serve responsive AVIF/WebP when supported, preserve an appropriate fallback, and reserve dimensions to prevent layout shift.

Voice is direct and helpful: Add to cart, Choose your size, Delivery to Lahore, and View store. Avoid inflated promises, endless urgency and misleading scarcity. Local relevance comes from useful PKR budgets, serviceability and real stores.

## Motion and accessibility

Use 120–180 ms transitions for hover and small state changes, 200–240 ms for drawers, and no continuous animation. Respect reduced motion. Use WCAG 2.2 AA as the implementation target: normal text contrast at least 4.5:1, large text and relevant non-text boundaries at least 3:1, clear focus, keyboard flows, accessible dialogs and meaningful labels. HomeBEZ uses a 44 px minimum touch target as its design rule.

Reserve space for sticky navigation and mobile purchase controls so content and focus are not hidden. Support 200% text resizing, screen readers, RTL layouts and bidirectional isolation for Latin SKUs and prices in Urdu. Checkout must remain usable if a font or image fails.

## Design review checklist

Review home at 1440, 1024, 768, 390 and 320 px; search with long names and empty results; a sold-out variant; a two-seller cart; delayed payment confirmation; an expired seller invite; a rejected listing; and seller finance with negative adjustments. Validate actual contrast, keyboard navigation and font rendering in browser. A design document is not a rendered accessibility or usability test.
