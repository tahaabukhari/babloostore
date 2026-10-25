import "./env";
import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { stores, users } from "../src/db/schema";
import { hashPassword } from "../src/lib/password";
import { slugify } from "../src/lib/slug";

const usage = `
Create or update a store owner account.

  npm run owner -- --email araza@homebez.com --name "Ali Raza" [--password <pw>] [--store "Araza Fabrics"] [--city Lahore]

  --email     required; the sign-in email (no verification while testing)
  --name      display name (required when creating)
  --password  sets / resets the password; a random one is generated and printed if omitted on create
  --store     also create the owner's store with this name (they can edit it later in the dashboard)
  --city      store city (default Lahore)
  --list      list all owner accounts and their stores

An existing customer account with the same email is promoted to owner.
`;

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      password: { type: "string" },
      store: { type: "string" },
      city: { type: "string" },
      list: { type: "boolean" },
      help: { type: "boolean" },
    },
  });

  if (values.list) {
    const rows = await db
      .select({ email: users.email, name: users.name, role: users.role, store: stores.name, slug: stores.slug })
      .from(users)
      .leftJoin(stores, eq(stores.ownerId, users.id))
      .where(eq(users.role, "owner"));
    console.table(rows);
    return;
  }

  if (values.help || !values.email) {
    console.log(usage);
    return;
  }

  const email = values.email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  let password = values.password;
  let userId: string;

  if (existing) {
    await db
      .update(users)
      .set({
        role: existing.role === "admin" ? "admin" : "owner",
        ...(values.name ? { name: values.name } : {}),
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      })
      .where(eq(users.id, existing.id));
    userId = existing.id;
    console.log(`Updated ${email} → owner${password ? " (password reset)" : ""}.`);
  } else {
    if (!values.name) throw new Error("--name is required when creating a new account.");
    password ??= randomBytes(9).toString("base64url");
    const [created] = await db
      .insert(users)
      .values({ email, name: values.name, role: "owner", passwordHash: await hashPassword(password) })
      .returning({ id: users.id });
    userId = created.id;
    console.log(`Created owner ${email}.`);
  }

  if (values.store) {
    const [has] = await db.select({ id: stores.id }).from(stores).where(eq(stores.ownerId, userId)).limit(1);
    if (has) console.log("Owner already has a store; skipped --store.");
    else {
      let slug = slugify(values.store);
      const [taken] = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1);
      if (taken) slug = `${slug}-${randomBytes(2).toString("hex")}`;
      await db.insert(stores).values({ ownerId: userId, name: values.store, slug, city: values.city ?? "Lahore" });
      console.log(`Created store "${values.store}" at /search?store=${slug}`);
    }
  }

  if (password) console.log(`\n  Sign-in: ${email}\n  Password: ${password}\n  (shown once — share it privately)\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
