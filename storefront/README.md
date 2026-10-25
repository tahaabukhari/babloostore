# BablooStore storefront

Rebranded from HomeBEZ (the brand used in the blueprint docs). Logo images in `public/brand` still show HomeBEZ until new ones are supplied.

Next.js 15 (App Router) + Tailwind v4 marketplace on the v1 tokens in [`../design/tokens.css`](../design/tokens.css). Data lives in Postgres (Neon in production) through Drizzle ORM.

**Testing build:** email + password only (no email verification), invite-only store sign-up, cash on delivery only.

## How it works

| Who | What they can do |
| --- | --- |
| Shopper | No account. Browse, search, add to cart, check out with name / phone / address (cash on delivery) |
| Store owner | Signs up at `/signup` with an **invite code**, which creates their account and store together. Then `/dashboard`: store settings, products (photos, options, publish / draft / archive / delete) and orders with the customer's contact details and status updates. Signs back in at `/login` |

- Invite codes live in the `INVITE_CODES` environment variable; each code works once. Add codes in Vercel and redeploy to let more stores in.
- A checkout with items from several stores creates **one order per store**. Each owner only sees their own orders.
- Prices and stock are read from the database at checkout. Stock is reserved in a transaction with a guarded update, so two shoppers can't both buy the last unit. Cancelling an order puts the stock back.
- The dashboard refreshes every 15 seconds while open (Neon has no push channel).
- Product photos are resized in the browser (max 1600 px, WebP) and stored in the Neon Object Storage bucket `stores`.

## Routes

| Route | |
| --- | --- |
| `/`, `/search`, `/product/[slug]`, `/search?store=<slug>` | Shop |
| `/cart`, `/checkout`, `/order/[checkoutId]` | Cart, guest checkout, confirmation |
| `/signup`, `/login` | Store owner sign-up (invite code) and sign-in |
| `/dashboard`, `/dashboard/orders`, `/dashboard/products`, `/dashboard/store` | Store owner dashboard |
| `/design` | Component review kit |

## Deploying on Vercel

1. **Root Directory:** `storefront` (Project → Settings → Build and Deployment).
2. **Environment variables** (Project → Settings → Environment Variables):

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** connection string (`postgresql://…-pooler…/neondb?sslmode=require`). Added automatically if you connected Neon through Vercel's integration |
   | `INVITE_CODES` | Comma-separated codes, e.g. `BS-7K2Q9M,BS-P4XW8N` |
   | `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | From Neon Console → Connect → **Storage** |
   | `S3_BUCKET` | `stores` |

3. In Neon's Object storage tab, set the `stores` bucket's access level to **public_read** so product photos can be displayed.
4. Deploy. The `vercel-build` script runs database migrations before `next build`, so tables are created and kept up to date automatically.

The Neon **Data API** is not used by this app. Leave it off unless you need it.

## Local development

```bash
npm install
cp .env.example .env.local   # optional: fill in DATABASE_URL to use Neon instead of the local DB
npm run db:migrate
npm run dev
```

With `DATABASE_URL` empty the app uses an embedded Postgres (PGlite) in `./.data/pglite`. It allows one process at a time: **stop `npm run dev` before running `db:migrate` or `owner`**. Set `INVITE_CODES` in `.env.local` to test sign-up. Without the storage variables, photos can still be added as links.

## Admin script

```bash
npm run owner -- --list                                              # list store owners
npm run owner -- --email araza@homebez.com --password "new-password" # reset a password
npm run owner -- --email x@y.com --name "Name" --store "Store"       # create an owner without an invite
```

To mark a store as verified, set `stores.verified = true` in the Neon SQL editor.

## Changing the schema

Edit `src/db/schema.ts`, then:

```bash
npm run db:generate   # writes a new SQL migration into ./drizzle
npm run db:migrate    # applies it
```

## Not built yet

Email verification and password reset emails, login rate limiting, online payments, per-variant stock, returns, an admin panel.
