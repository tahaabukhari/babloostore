# HomeBEZ backend architecture

Recommended architecture: a modular commerce application with a Next.js storefront and seller portal, a Medusa commerce foundation with custom marketplace modules, PostgreSQL, object storage and background workers. Keep money, stock and order correctness in the authoritative backend. This recommendation requires a proof of concept before dependency versions and production deployment are fixed.

## System boundaries

| Layer | Responsibility |
| --- | --- |
| Storefront | Public catalog, search, cart, checkout and customer order access |
| Seller portal | Invitation activation, own listings, inventory, fulfillment and statements |
| Admin | Vendor/email management, moderation, configuration, support and finance |
| Commerce foundation | Product and variant primitives, cart, pricing, promotions, inventory and base order flows |
| Custom marketplace modules | Vendor membership, scoped authorization, moderation, order groups, commissions, settlement ledger and local integration orchestration |
| PostgreSQL | Authoritative transactional records, uniqueness constraints, locks and audit references |
| Object storage and CDN | Public optimized listing media; separately protected verification and support evidence |
| Worker and queue | Notifications, media processing, payment reconciliation, shipment updates and retryable jobs |
| Search index | Derived, rebuildable index of approved and serviceable catalog data |

Start as a modular monolith plus worker, not independent microservices. Use Redis where the selected queue and cache need it. A dedicated search service is optional until catalog size and relevance requirements justify it; choose between the platform's search support and an external index after the catalog spike. Shared TypeScript contracts and validated inputs should serve all clients.

## Core data model

| Domain | Entities and relationships |
| --- | --- |
| Identity | User, auth identity, session, role, permission, vendor membership, activation invitation |
| Vendor | Vendor, profile, verification, allowed category, pickup/return address, protected payout destination |
| Catalog | Category, attribute schema, product, product version, variant/SKU, image, moderation decision |
| Inventory | Stock location, balance, reservation, adjustment, movement |
| Shopping | Cart, cart line, address, shipping quote, promotion allocation |
| Orders | Customer order group, vendor order, order line snapshot, fulfillment, shipment and tracking event |
| Payments | Payment attempt, provider transaction, provider event, refund and reconciliation exception |
| Finance | Commission policy version, ledger account, journal, journal entry, settlement batch, payout and payout allocation |
| Support | Return request, return line, inspection, dispute, evidence and review eligibility |
| Content | Campaign, collection, navigation entry and scheduled merchandising slot |
| Operations | Audit event, notification, transactional outbox and idempotency record |

Vendor-specific records carry a server-enforced vendor relationship. Product versions preserve approvals; order lines preserve the purchased title, seller, SKU, unit price, tax classification, discounts, commission rule and return-policy version. A later catalog edit cannot rewrite a past purchase.

## Public and privileged API boundaries

Expose public reads only for approved catalog and seller data. Cart and order access use scoped, unguessable session credentials; guest order lookup requires a signed link or verified contact. Seller routes derive the vendor membership from the authenticated identity, never from a client-supplied vendor ID alone. Admin commands require explicit permissions and audit context.

Representative command contracts: createVendor, assignVendorEmail, approveVendor, issueVendorInvitation, activateInvitation, submitProductVersion, approveProductVersion, reserveCartInventory, createOrderGroup, recordPaymentEvent, requestReturn, approveRefund, reconcileReceipt and approvePayoutBatch. Each mutation validates actor, state transition and idempotency as applicable. REST versus GraphQL follows the selected commerce extension conventions; these names define behavior, not speculative final endpoints.

## Checkout and inventory

1. Reprice the cart on the server and validate each seller, listing version, SKU and delivery destination.
2. Return per-seller shipping quotes, discount allocation and final total with a quote expiry.
3. On confirmation, lock or atomically reserve available stock with a bounded expiry. Use a checkout idempotency key.
4. Create a customer order group and its vendor orders. Persist an outbox event in the same database transaction as the committed change.
5. For prepaid checkout, initiate a provider payment attempt and retain the same order on retries. For COD, record payment as uncollected while the order enters fulfillment according to risk policy.
6. Validate a provider notification or query the provider before confirming payment. A successful return URL alone does not confirm receipt.
7. Commit stock consumption and transition the order once; release expired reservations where payment is conclusively unsuccessful.

Avoid a long database transaction while waiting on an external provider. External effects use idempotent jobs and compensating workflows. A late payment after reservation expiry enters an exception flow: recover stock if possible, otherwise refund through an approved process. Never silently oversell.

## State models

Keep payment, fulfillment and settlement independent. An order can be delivered without COD funds having reached HomeBEZ.

- Vendor: invited → activated → active; suspended and closed are controlled transitions with existing-order handling.
- Listing: draft → pending review → approved/published or rejected; later edits create a new reviewable version; archived and suspended remove public visibility.
- Payment attempt: initiated → pending → succeeded, failed or expired. Refunds have their own pending/succeeded/failed records; partially refunded is derived.
- Fulfillment: unfulfilled → preparing → ready → shipped → delivered; cancellation and failed-delivery/return-to-origin are explicit branches.
- Return: requested → assessed → approved or rejected → received if physical return required → inspected → refund authorized → completed.
- Settlement: accrued → held → available → approved → processing → paid; reversals use journal entries, not overwritten history.

Map provider and courier statuses into these states and reject invalid transitions. Support duplicate, delayed and out-of-order events.

## Payments and settlement

Use hosted payment flows or approved tokenization so HomeBEZ does not store raw card data. Build provider adapters around payment creation, signature verification, status inquiry, refund and reconciliation. Select one prepaid provider for the first integration; add another only when operations can support it. COD is a separate courier receivable and remittance workflow.

The platform collecting buyer money and owing vendors money is a proposed funds flow, subject to provider and legal approval. It is not an assumption that HomeBEZ can operate escrow or that a gateway supports split settlement. If vendors must contract directly with a provider, revisit checkout and settlement architecture before implementation.

Maintain an append-only, balanced journal. Amounts are integer paisa with currency PKR; use explicit rounding and a defined residual-allocation rule. Keep payment-provider receipts separate from seller liabilities. Finance exports must be reproducible from journal entries.

For a documented example, goods subtotal Rs. 3,000 minus Rs. 300 seller-funded discount gives a Rs. 2,700 commission basis. At an illustrative 10% commission, commission is Rs. 270 and the seller accrual is Rs. 2,430 before other adjustments. These are test inputs, not chosen commercial rates. Platform-funded coupons must not reduce seller proceeds unless the contract says so. Shipping income, courier costs, taxes, withholding, gateway fees and return charges are separate postings.

Make category/vendor commission policies effective-dated and snapshot the applied rule at purchase. Hold settlement until payment is reconciled and the configured delivery/return conditions are met. Payout batches require approval, unique bank/provider references and reconciliation. Refunds after payout create a recoverable balance or a funded reserve adjustment; they cannot disappear from accounting.

## Integration requirements

| Integration | Must verify before launch |
| --- | --- |
| Gateway | Approved business/funds flow, sandbox, signature validation, refund support, transaction inquiries, fees and settlement reports |
| Courier | Pickup cities, destination serviceability, booking/cancellation, labels, tracking, return-to-origin, COD collection and remittance data |
| Email | Assigned vendor inbox reachability, invitations, password recovery, receipts and delivery monitoring |
| SMS | OTP delivery, rate limits, costs and fallback; marketing consent separate from transactional communication |
| Storage | Private documents, signed access, file type/content limits, safe image transformation and retention |
| Tax reporting | Required supplier identifiers, invoice fields, configurable policy versions and export formats validated for the operating entity |

Start with one courier integration. Provide controlled manual booking and reconciliation tools for outages; every manual adjustment must carry a reason and actor.

## Security and privacy

Enforce object-level authorization on product, variant, order, shipment, return, export and finance access. Test a second vendor's IDs against every seller route. Use MFA for admins and sensitive seller operations; verification and session revocation for assigned-email or bank-detail changes. Invitations expire, are single-use and store hashed tokens. Default passwords are prohibited.

Use secure cookies, CSRF protection as appropriate, login/OTP throttling, validated uploads, least-privilege storage access, managed secrets and structured logs with sensitive fields removed. Protect operational exports and minimize customer PII shown to sellers. Define retention and deletion rules with exceptions for records the business must retain. Audit roles, bank changes, approvals, refunds and payouts with before/after context.

## Reliability and proposed performance targets

Target 99.5% monthly availability for the pilot, with explicit exclusions defined before using it as an SLA. Target mobile field p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1. These are goals, not measured results. Establish API latency and load limits from the first production-like test rather than inventing traffic capacity.

Use separate development, staging and production data and secrets; repeatable migrations; database backups with a tested restore path; worker retries with dead-letter queues; and alerts for payment mismatches, inventory failures, stalled shipments and payout anomalies. Proposed pilot recovery goals are RPO ≤1 hour and RTO ≤4 hours, subject to hosting capability and cost verification. A documented restore test is required before live orders.
