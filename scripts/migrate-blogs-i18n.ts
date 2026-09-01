/**
 * One-shot migration: adds `locale` and `translationGroupId` to legacy blog docs.
 * Run with: npm run migrate:i18n  (or npx tsx scripts/migrate-blogs-i18n.ts from src/)
 * Requires MONGODB_URI env. Run BEFORE deploying the i18n code or legacy posts
 * will be filtered out by locale.
 */
import { MongoClient } from "mongodb";
import { randomUUID } from "crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");

async function main() {
  const client = new MongoClient(uri as string);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("blogs");

  // Ensure old unique index doesn't block migration
  try {
    await col.dropIndex("slug_1");
    console.log("Dropped legacy index slug_1");
  } catch {
    console.log("No legacy slug_1 index to drop");
  }

  const cursor = col.find({
    $or: [{ locale: { $exists: false } }, { translationGroupId: { $exists: false } }],
  });

  let migrated = 0;
  for await (const doc of cursor) {
    const update: Record<string, unknown> = {};
    if (!doc.locale) update.locale = "en";
    if (!doc.translationGroupId) update.translationGroupId = randomUUID();
    if (Object.keys(update).length) {
      await col.updateOne({ _id: doc._id }, { $set: update });
      migrated++;
      console.log(`Migrated ${doc.slug} ->`, update);
    }
  }

  try {
    await col.dropIndex("translationGroupId_1");
    console.log("Dropped legacy index translationGroupId_1");
  } catch {
    console.log("No legacy translationGroupId_1 index to drop");
  }
  // Create new indexes
  await col.createIndex({ slug: 1, locale: 1 }, { unique: true });
  await col.createIndex({ translationGroupId: 1, locale: 1 }, { unique: true });
  await col.createIndex({ locale: 1, public: 1, createdDate: -1 });
  await col.createIndex({ locale: 1, tags: 1 });
  console.log(`Migration done, ${migrated} docs updated, indexes ensured`);

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
