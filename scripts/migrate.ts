/**
 * Generic migration runner — executes pending migrations from `migrations/` and
 * records them in the `migrations` collection.
 *
 * Usage:
 *   tsx scripts/migrate.ts              # apply pending
 *   tsx scripts/migrate.ts --dry-run    # list without applying
 *   SKIP_MIGRATIONS=1 tsx scripts/migrate.ts  # skip (for local dev without DB)
 *
 * Build integration: `npm run build` chains this script before `next build`.
 * On Vercel the runner fails the build if MONGODB_URI is missing or a
 * migration throws — this is intentional for production safety. Set
 * SKIP_MIGRATIONS=1 to opt out explicitly.
 */
import { MongoClient } from "mongodb";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { runMigrations } from "@/lib/migrations/runner";

// Charge les .env exactement comme `next build` (".env", ".env.local",
// ".env.development", ".env.production", etc. + expansion ${VAR}).
// Sur Vercel les vars sont déjà injectées — loadEnvConfig est no-op côté surcharge.
loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP = process.env.SKIP_MIGRATIONS === "1";

async function main() {
  if (SKIP) {
    console.log("[migrate] SKIP_MIGRATIONS=1 — skipping migrations");
    return;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "portfolio";

  if (!uri) {
    // In production (Vercel) we want the build to fail if DB config is missing,
    // unless SKIP was explicitly set. The top-level caller decides; here we throw.
    throw new Error("Missing MONGODB_URI — cannot run migrations. Set SKIP_MIGRATIONS=1 to skip.");
  }

  const client = new MongoClient(uri as string, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const migrationsDir = path.join(process.cwd(), "migrations");

    const result = await runMigrations({ db, migrationsDir, dryRun: DRY_RUN });

    if (DRY_RUN) {
      if (result.pendingBefore.length === 0) {
        console.log("[migrate] (dry-run) No pending migrations");
      } else {
        console.log(`[migrate] (dry-run) Pending: ${result.pendingBefore.join(", ")}`);
      }
      if (result.skipped.length) {
        console.log(`[migrate] (dry-run) Already applied: ${result.skipped.join(", ")}`);
      }
      return;
    }

    if (result.applied.length === 0 && result.pendingBefore.length === 0) {
      console.log("[migrate] No pending migrations");
    } else if (result.applied.length > 0) {
      console.log(`[migrate] Done — applied ${result.applied.length}: ${result.applied.join(", ")}`);
    }

    if (result.skipped.length) {
      console.log(`[migrate] Already applied: ${result.skipped.join(", ")}`);
    }
  } finally {
    await client.close().catch(() => {});
  }
}

main().catch((e) => {
  console.error("[migrate] Failed:", e);
  process.exit(1);
});
