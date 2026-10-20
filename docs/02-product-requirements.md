# HomeBEZ product requirements

Build a curated Pakistan retail marketplace where shoppers discover products and place orders publicly, while only admin-approved vendors manage listings. The user confirmed this access model. Vendor email assignment happens in the admin panel; public seller signup is excluded.

## Scope and operating defaults

Start with fashion, beauty and fragrances, jewellery and accessories, home and living, and selected electronic accessories. Require category-specific listing attributes. Phones, large appliances, perishable goods, regulated products and international wholesale are deferred until warranty, authenticity, fulfillment and policy requirements are defined.

Proposed defaults: guest checkout plus optional shopper accounts; vendors fulfill from their own locations; one operating currency, PKR; admin review before a listing's first publication; manual finance approval of payout batches. These can change without changing the confirmed access model.

## Roles and permissions

| Role | Allowed work | Restrictions |
| --- | --- | --- |
| Guest | Browse, search, cart, checkout, secure order lookup | Must prove access before seeing an order or opening a return |
| Buyer | Guest abilities plus saved addresses, wishlist and own order history | Access only own records |
| Vendor owner | Activate invitation, manage own products, inventory, orders and statements | No access to another vendor's products, sales or private customer data |
| Vendor staff | Assigned operational permissions for one vendor | No finance or membership permissions by default |
| Catalog operator | Review listings, taxonomy and merchandising | No bank changes or payout approval |
| Support operator | Handle authorized customer cases and return review | Refund authority limited by policy and role |
| Finance operator | Reconcile receipts, review adjustments and execute approved payout process | Material actions logged; bank changes require additional verification |
| Superadmin | Manage vendors, roles and configuration | MFA and audit records required |

## Vendor invitation and activation

1. Admin creates the vendor business record and assigns a unique login email. Record the vendor contact email separately if needed.
2. Admin records verification status, allowed categories, return address, pickup details and commission policy. Keep sensitive identity documents in private storage.
3. Approval enables an expiring, single-use activation invitation bound to that vendor and assigned email. An assigned address must be a usable inbox; mailbox creation is a separate service, not automatic account creation.
4. Vendor verifies inbox access, sets credentials, accepts vendor terms and completes required security setup. Never email shared or default passwords.
5. Admin can resend or revoke invitations, suspend access and revoke active sessions. Suspended vendors cannot publish or accept new business, but existing orders remain available to authorized operations staff for resolution.

Invited, pending activation, active and suspended are separate states. An approved business does not imply that every product is approved. A suspended seller's affected listings leave search and merchandising promptly.

## Shopper journeys and screens

| Screen | Required content and behavior |
| --- | --- |
| Home | Prominent search, categories, one campaign area, product rows, editorial collections, seller discovery and delivery context |
| Category and search | Filterable grid, sorting, result count, query persistence, budget and variant attributes, clear empty state |
| Product detail | Gallery, title, price, variants, stock, seller identity, delivery estimate, fees, applicable return policy, warranty, reviews and add to cart |
| Seller storefront | Approved store identity, location at an appropriate level, policies, product collection and real performance data where available |
| Cart | Items grouped by vendor, editable quantities, stock/price warnings, delivery estimates and clear total |
| Checkout | Contact, address, serviceability, shipping per seller, payment method, final total and explicit confirmation |
| Confirmation and tracking | Parent order plus seller shipments, individual status, support access and payment state |
| Returns | Eligible order lines, reason, evidence, pickup/drop-off instructions, decision and refund progress |
| Account and help | Secure login, own orders and addresses, policies, contact and escalation path |

Browsing must not require login. Confirm guest contact details without silently creating a public account. A payment redirect is never sufficient evidence of payment success. Show pending when confirmation is delayed and let the shopper resume the same order safely.

## Vendor workspace

Provide an action-oriented dashboard with pending orders, stock alerts and listing issues. Product management includes drafts, category-specific attributes, variant SKU, price, stock, images, descriptions and review feedback. Orders include pack-ready information, shipping labels or booking status, dispatch deadlines and returns. Finance includes gross sales, discounts, commission, tax/withholding entries, refunds, holds, available balance and payout history.

All figures require date ranges and explanations. Estimated revenue must be visibly distinguished from settled money. A vendor sees only the customer details needed to fulfill its own order; access expires or is minimized according to the data-retention policy.

## Admin workspace

Vendor approval and assigned emails; role management; listing review with reasons; prohibited-product reporting; category schemas; campaign scheduling; commission policy versions; order and shipment exception queues; refunds and disputes; receipt reconciliation; payout approvals; immutable audit history; and controlled reporting exports.

Published product edits that change identity, claims, images or category return to review. Stock and allowed price changes can publish immediately under configurable limits. Reviewed edits should create a new product version so the previous approved version remains available until replacement is accepted.

## Catalog and discovery rules

Each listing belongs to one vendor in v1; duplicate offers from multiple vendors are separate listings. A later shared-product catalog can consolidate them. Category schemas define required fields such as fabric/size, material, volume, ingredients, warranty and compatibility. Variant SKUs carry their own stock and price.

Search should support title, brand, category, common spelling mistakes and curated Roman Urdu synonyms. Filters must be driven by valid category attributes. Start with curated recommendations; behavioral personalization follows sufficient consented usage. Sponsored placements, if introduced later, must be labeled.

## Promotions and customer trust

Specify who funds each discount and allocate it to order lines at purchase time. Preserve that allocation through partial refunds and seller settlement. Only display timers for campaigns with real start and end times. Show reference prices only when supported by pricing history. Publish seller verification meanings and review eligibility; do not fill production pages with fabricated reviews or counters.

## First release acceptance criteria

- An unauthenticated visitor can browse and complete an eligible guest order.
- A visitor cannot self-register as a vendor or call a hidden seller-creation endpoint.
- A revoked, expired or reused invitation fails; activation grants access only to the assigned vendor.
- A two-vendor cart produces one customer confirmation and separately managed vendor orders and shipments.
- Concurrent attempts to buy the final unit cannot both succeed.
- A price or stock change is explained before purchase confirmation.
- Payment retries or duplicate provider notifications cannot duplicate orders, charges or stock changes.
- A partial cancellation or refund affects the correct lines, discounts, ledger entries and vendor statement.
- Pending/rejected listings never appear in public search or direct product reads.
- Every operational screen has loading, empty, error, offline/retry and forbidden states as appropriate.

## Later releases

Wholesale RFQs, bulk price tiers, international shipping, native mobile apps, loyalty points, customer wallet balances, affiliate programs, paid seller ads, live shopping and algorithmic personalization are outside the first release. Public vendor signup remains excluded unless the business model is explicitly changed.
