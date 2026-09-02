/**
 * Template for a new migration. Copy to `NNN-kebab-case.ts`.
 * id must be `<number>-<kebab-case>` (e.g. 002-add-foo-index) and unique.
 */
import type { Db } from "mongodb";
import type { Migration } from "@/lib/migrations/types";

const migration: Migration = {
  id: "000-template",
  description: "Describe what this migration does",
  async up(_db: Db): Promise<void> {
    // Example:
    // const col = _db.collection("blogs");
    // await col.updateMany({ foo: { $exists: false } }, { $set: { foo: "bar" } });
    // await col.createIndex({ foo: 1 });
  },
};

export default migration;
