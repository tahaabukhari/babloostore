# HomeBEZ marketplace research

Research date: 20 October 2026. HomeBEZ should combine familiar marketplace navigation with its own brand and clearer vendor trust information. Findings below distinguish observed capabilities from our proposed product choices.

## Reference stores and implications

| Reference | Evidence | HomeBEZ decision |
| --- | --- | --- |
| Daraz | Its public storefront includes Flash Sale, category browsing and Just For You sections. | Prioritize search, useful categories, compact product cards and repeatable merchandising sections. |
| Daraz Seller Center | The seller page describes product uploads, order handling and category-dependent commission. | Provide a separate seller workspace and versioned commission rules; do not hard-code one platform-wide rate. |
| Daraz returns | Its policy describes a return window and category-specific change-of-mind eligibility. | Store eligibility by category and show the applicable rule before purchase. HomeBEZ must set its own window. |
| Alibaba.com | Alibaba Group positions it as a B2B platform with sourcing, transactions and fulfillment services. | Learn from seller identity and supplier information. Defer RFQs, negotiated wholesale pricing and international procurement. |
| Temu | Its support material describes refunds for missing, damaged or misdescribed products. The cited page is for Finland. | Make order support and return status easy to find; do not import another market's refund terms into Pakistan. |

Sources: [Daraz storefront](https://www.daraz.pk/), [seller information](https://www.daraz.pk/sell-on-daraz/), [returns policy](https://www.daraz.pk/return-policy/), [Alibaba Group business overview](https://home.alibabagroup.com/en-US/about-alibaba-businesses-1747711844698554368), [Temu support](https://www.temu.com/fi-en/support/c3/-i-received-an-item-damaged--as-described-f-50-s-199.html).

These are public product and policy references. They are not access to the companies' private design specifications or backend implementations. Layout and brand recommendations in this project are original design decisions. No claim about measured conversion or usability is made without testing.

## What makes HomeBEZ distinct

The supplied logo uses black, white and metallic gold, with a house and shopping-cart symbol. Extend that identity into a practical marketplace: a charcoal header, warm white catalog surfaces and restrained gold calls to action. Use the supplied logo as the identity asset; the complete poster is unsuitable for a small navigation bar. Prepare a compact, legible logo asset before visual production.

HomeBEZ's own merchandising language will use curated collections, budget-based browsing and visible local seller stories. Examples include Everyday upgrades, Finds under Rs. 2,000 and Meet the stores. These are editorial modules, not invented endorsements. Verified seller badges must describe checks actually completed. Ratings, purchase counts, scarcity and sale deadlines must come from real records.

## Backend platform evaluation

| Option | Fit for HomeBEZ | Main qualification |
| --- | --- | --- |
| Next.js plus Medusa with custom marketplace modules | Recommended starting point: TypeScript across storefront and commerce, with domain-specific seller operations. | Vendor authorization, Pakistan payments, settlement accounting and moderation still require implementation. |
| Mercur on Medusa | Candidate to evaluate if its existing seller and admin flows materially shorten delivery. | Review current licenses, edition boundaries and local payment fit; do not assume advertised split payouts work with Pakistan providers. |
| Vendure | Credible alternative with a documented multi-vendor guide. | Evaluate seller isolation, customization effort and license suitability in a focused comparison if Medusa fails the proof of concept. |
| Entirely custom commerce backend | Maximum control. | Reimplements checkout, promotions, stock handling and order primitives; higher initial verification burden. |

Medusa explicitly offers a marketplace recipe and links to Mercur. Its marketplace page describes Stripe Connect for Mercur payouts, which does not establish compatibility with HomeBEZ's local settlement model. The recommendation above is our engineering judgment, not a claim that a finished Pakistan marketplace ships with either product. Sources: [Medusa marketplace overview](https://medusajs.com/marketplace), [marketplace recipe](https://docs.medusajs.com/resources/recipes/marketplace), [vendor example](https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors), [Vendure guide](https://docs.vendure.io/current/core/how-to/multi-vendor-marketplaces).

## Pakistan integration findings

JazzCash publishes merchant onboarding and sandbox integration material. Easypaisa publishes gateway merchant registration and integration guides. Treat both as candidates until the chosen provider approves the legal entity, permitted marketplace funds flow, refunds and settlement arrangements. Consumer wallet support does not itself establish support for splitting payments among vendors. Sources: [JazzCash merchant onboarding](https://corporateonboarding.jazzcash.com.pk/online-payment), [JazzCash sandbox](https://sandbox.jazzcash.com.pk/SandboxDocumentation/index.html), [Easypaisa merchant registration](https://registerbusiness.easypaisa.com.pk/), [Easypaisa integration guides](https://easypay.easypaisa.com.pk/easypay-merchant/faces/pg/site/IntegrationGuides.jsf).

FBR has published guidance and workflows relating to digitally ordered goods and marketplace reporting. Design configurable tax records, supplier identifiers and exportable transaction data. Before live sales, a Pakistan tax professional must determine the applicable rules, rates, registration and filing responsibilities for the actual business and funds flow. Sources: [FBR SRO 1429 dated 4 August 2025](https://download1.fbr.gov.pk/SROs/2025858833282SRO1429DATED04-08-2025.pdf), [FBR 2026 digitally ordered goods workflow](https://download1.fbr.gov.pk/Docs/202621112287954WHTPAYMENT%26CLAIMONDIGITALLYORDEREDGOODS.pdf). No tax rate is assumed here.

## Reference documentation for implementation

- [Next.js App Router](https://nextjs.org/docs/app/getting-started) for the storefront foundation.
- [OWASP object authorization guidance](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) for testing access to each vendor-owned object.
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) for accessibility acceptance criteria.
- [Manrope](https://fonts.google.com/specimen/Manrope), [Inter](https://fonts.google.com/specimen/Inter) and [Noto Sans Arabic](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic) for the chosen font families. Preserve the licenses distributed with the exact downloaded files.

## Research still needed before procurement

Obtain written gateway fees, refund capabilities, settlement timing and marketplace approval; courier coverage, COD remittance, returns and API terms; hosting and notification quotes against expected traffic; and licensing review of the exact commerce packages. Research does not establish contracted pricing. Compare these using HomeBEZ's expected basket value, margin and return rate before selecting providers.
