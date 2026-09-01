/**
 * Ensure MongoDB indexes for the `blogs` collection.
 * Run offline: npx tsx scripts/ensure-indexes.ts
 * Requires MONGODB_URI env. Idempotent — safe to re-run.
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");

async function main() {
  const client = new MongoClient(uri as string);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("blogs");

  // Legacy indexes that must not coexist with the per-locale unique indexes
  for (const name of ["slug_1", "translationGroupId_1"]) {
    try {
      await col.dropIndex(name);
      console.log(`Dropped legacy index ${name}`);
    } catch {
      // ignore if not exists
    }
  }

  await col.createIndex({ slug: 1, locale: 1 }, { unique: true });
  await col.createIndex({ translationGroupId: 1, locale: 1 }, { unique: true });
  await col.createIndex({ locale: 1, public: 1, createdDate: -1 });
  await col.createIndex({ locale: 1, tags: 1 });
  console.log("Indexes ensured");

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
