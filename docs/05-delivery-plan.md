# HomeBEZ delivery plan

The first development slice must demonstrate a real invited vendor publishing an approved product and a public shopper placing an order. Build outward from this flow while preserving the selected design system.

## Milestones and evidence

| Milestone | Deliverables | Exit evidence |
| --- | --- | --- |
| 0 Foundation | Confirm funds flow and policy owners; prepare compact logo; validate Medusa marketplace approach and package licenses | Two isolated test vendors, split order prototype, invitation activation and a traceable accounting example |
| 1 Design review | Desktop/mobile home, search, product detail, two-vendor cart, checkout, seller activation and admin vendor creation | Rendered screens follow the locked tokens; keyboard and mobile review complete |
| 2 Catalog and access | Assigned-email invites, vendor membership, product/variant management, review workflow, images and public search | An approved product is public; a pending product is private; vendor isolation checks pass |
| 3 Checkout and payment | Inventory reservation, split orders, COD, one sandbox prepaid provider and confirmation/tracking | Last-unit concurrency, duplicate callbacks, timeout and delayed-payment cases behave correctly |
| 4 Operations | Courier workflow, returns, refunds, commission ledger, reconciliation and controlled payouts | Two-vendor order with partial return produces correct customer and seller records |
| 5 Pilot | Real approved sellers, verified product content, provider approval, support runbooks and monitoring | Restore rehearsal, end-to-end test order, refund and payout rehearsal, operational sign-off |

Do not commit to a delivery date until the foundation proof of concept and external provider onboarding are understood. UI-only prototypes can precede integrations, but must label illustrative prices, inventory, testimonials and payment behavior clearly.

## First technical proof of concept

Demonstrate two vendor identities and one admin. Admin assigns each vendor a usable email, issues an expiring invitation and approves one listing per vendor. One guest cart buys both listings. The system creates one parent order, two vendor orders and separately scoped seller views. Simulate a duplicate payment callback, one cancelled line and one refund; prove stock and journal entries remain consistent. This establishes the chosen backend's fit before building many screens.

## Business decisions before live transactions

| Decision | Proposed starting point | Responsible function |
| --- | --- | --- |
| Approved categories and catalog quality | Curated categories with review and explicit exclusions | Business and catalog operations |
| Commission and funding | Effective-dated category/vendor rules with separate coupon funding | Business and finance |
| Returns and warranties | Explicit category rules visible before checkout | Business, support and legal |
| Fulfillment and shipping fees | Vendor dispatch with platform-integrated courier and per-seller quotes | Operations |
| Payout release and reserves | Reconciled receipts, delivery/return hold and manually approved batches | Finance |
| Seller identity and email ownership | Admin-approved business, reachable assigned inbox and verified payout destination | Operations and security |
| Legal entity and collection model | Confirm with gateway and Pakistan advisors | Business, finance and legal |
| Support response expectations | Named owner, escalation path and published contact | Support |
| Urdu launch scope | English first with translation-ready layouts; Urdu after font and RTL review | Product |

These are decision owners by function, not assigned people. Numeric rates, windows and thresholds remain configurable until agreed.

## Verification plan

Use unit tests for money allocation, commission snapshots, rounding, state transitions and inventory arithmetic. Use integration tests for vendor isolation, invitation lifecycle, database transactions, webhook replay and reconciliation. Use end-to-end tests for guest checkout, seller publication, admin moderation, a two-vendor shipment flow and partial refunds. Use provider sandbox contract tests and a small live verification transaction after approval.

Review public pages for keyboard and screen-reader use, mobile reflow, contrast, long titles, poor network conditions and delayed payment confirmation. Measure Core Web Vitals with representative catalog images. Exercise backup restore and worker failure recovery. These checks are planned; none have been executed against an application in this research round.

## Pilot metrics

Track search-to-product and product-to-cart rates, checkout completion by payment method, payment failure rate, stock conflicts, dispatch delays, delivered-versus-remitted COD, return reasons, support volume and payout reconciliation exceptions. Separate legitimate buyer behavior from staff/test traffic. Optimize against a measured baseline; avoid fabricated launch conversion targets.

## Continuing this project

Use the HomeBEZ directory as the project boundary and create its own repository before application development. The surrounding game repositories are unrelated. Begin with the foundation proof of concept and rendered visual review. Preserve the confirmed public-buyer/invite-only-vendor decision and use the design tokens consistently across shopping, seller and admin surfaces.
