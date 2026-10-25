# BablooStore storefront

Rebranded from HomeBEZ (the brand used in the blueprint docs). Logo images in `public/brand` still show HomeBEZ until new ones are supplied.

Next.js 15 (App Router) + Tailwind v4 marketplace on the v1 tokens in [`../design/tokens.css`](../design/tokens.css). Data lives in Postgres (Neon in production) through Drizzle ORM.

**Testing build:** email + password accounts with no email verification, cash on delivery only, product photos added as image links.

## How it works

| Who | What they can do |
| --- | --- |
| Shopper (no account) | Browse, search, add to cart, check out with name / phone / address (cash on delivery) |
| Shopper (account) | Same, plus orders listed under **Account**. Sign up at `/signup` |
| Store owner | Created by us with `npm run owner`. Signs in at `/login` → `/dashboard`: store profile, products (create / edit / publish / archive / delete), orders with the customer's contact details and status updates |

- A checkout with items from several stores creates **one order per store**. Each owner only sees their own orders.
- Prices and stock are always read from the database at checkout. Stock is reserved inside a transaction with a guarded update, so two shoppers can't both buy the last unit. Cancelling an order puts the stock back.
- The dashboard refreshes every 15 seconds while the tab is open (Neon has no push channel; polling is enough for order volumes like these).
- Only **active** products from **open** stores are public. Drafts and archived products are visible to their owner only.

## Routes

| Route | |
| --- | --- |
| `/`, `/search`, `/product/[slug]`, `/search?store=<slug>` | Shop |
| `/cart`, `/checkout`, `/order/[checkoutId]` | Cart, guest checkout, confirmation |
| `/login`, `/signup`, `/account` | Accounts |
| `/dashboard`, `/dashboard/orders`, `/dashboard/products`, `/dashboard/store` | Store owner dashboard |
| `/design` | Component review kit |

## Setup

```bash
npm install
```

### Option A — Neon (shared, used for deployment)

1. Put the **pooled** connection string in `.env.local`:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
2. Create the tables: `npm run db:migrate`
3. Add store owners (see below), then `npm run dev`.

### Option B — local only, no account needed

Leave `DATABASE_URL` unset. The app uses an embedded Postgres (PGlite) stored in `./.data/pglite`.

```bash
npm run db:migrate
npm run owner -- --email araza@homebez.com --name "Ali Raza" --store "Araza Fabrics"
npm run dev
```

PGlite allows one process at a time: **stop `npm run dev` before running `db:migrate` or `owner`**.

## Store owner accounts

```bash
# create (prints a generated password once) and give them a store
npm run owner -- --email araza@homebez.com --name "Ali Raza" --store "Araza Fabrics" --city Lahore

# set a known password / reset a password
npm run owner -- --email araza@homebez.com --password "new-password"

# promote an existing shopper account to owner
npm run owner -- --email someone@example.com

# list owners
npm run owner -- --list
```

Owners without a store are asked to set one up on first sign-in. To mark a store as verified, set `stores.verified = true` in the Neon SQL editor.

## Changing the schema

Edit `src/db/schema.ts`, then:

```bash
npm run db:generate   # writes a new SQL migration into ./drizzle
npm run db:migrate    # applies it
```

## Not built yet

Image uploads (links only for now), email verification and password reset emails, login rate limiting, online payments, per-variant stock, returns, an admin panel.
