/**
 * Migration 001: Adds `locale` and `translationGroupId` to legacy blog docs
 * and ensures per-locale indexes. Idempotent — safe to re-run if not yet
 * recorded in `migrations`.
 *
 */
import type { Db } from "mongodb";
import { randomUUID } from "crypto";
import type { Migration } from "@/lib/migrations/types";

const migration: Migration = {
  id: "001-blogs-i18n",
  description: "Add locale/translationGroupId to legacy blogs and ensure per-locale indexes",

  async up(db: Db): Promise<void> {
    const col = db.collection("blogs");

    // Drop legacy unique index that would block backfill (orphaned unique on slug alone)
    try {
      await col.dropIndex("slug_1");
      console.log("[001] Dropped legacy index slug_1");
    } catch {
      // ignore if not exists
    }

    const cursor = col.find({
      $or: [{ locale: { $exists: false } }, { translationGroupId: { $exists: false } }],
    });

    let migrated = 0;
    for await (const doc of cursor) {
      const update: Record<string, unknown> = {};
      const d = doc as Record<string, unknown>;
      if (!d.locale) update.locale = "en";
      if (!d.translationGroupId) update.translationGroupId = randomUUID();
      if (Object.keys(update).length) {
        await col.updateOne({ _id: doc._id }, { $set: update });
        migrated++;
        console.log(`[001] Migrated ${String(d.slug)} ->`, update);
      }
    }
    console.log(`[001] Backfill done, ${migrated} docs updated`);

    try {
      await col.dropIndex("translationGroupId_1");
      console.log("[001] Dropped legacy index translationGroupId_1");
    } catch {
      // ignore if not exists
    }

    await col.createIndex({ slug: 1, locale: 1 }, { unique: true });
    await col.createIndex({ translationGroupId: 1, locale: 1 }, { unique: true });
    await col.createIndex({ locale: 1, public: 1, createdDate: -1 });
    await col.createIndex({ locale: 1, tags: 1 });
    console.log("[001] Indexes ensured");
  },
};

export default migration;
