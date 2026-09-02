import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Db } from "mongodb";
import type { Migration, MigrationRecord } from "./types";

const MIGRATIONS_COLLECTION = "migrations";

export interface RunOptions {
  db: Db;
  migrationsDir?: string;
  dryRun?: boolean;
}

export interface RunResult {
  applied: string[];
  skipped: string[];
  pendingBefore: string[];
}

function isMigrationId(value: string): boolean {
  return /^\d+-[a-z0-9-]+$/.test(value);
}

export async function loadMigrations(migrationsDir: string): Promise<Migration[]> {
  let entries: string[];
  try {
    entries = await readdir(migrationsDir);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }

  const files = entries
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .filter((f) => !f.startsWith("_"))
    .sort();

  const migrations: Migration[] = [];
  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const mod = await import(fullPath);
    const migration: Migration | undefined = mod.default ?? mod.migration ?? mod;
    if (!migration || typeof migration.id !== "string" || typeof migration.up !== "function") {
      throw new Error(`Invalid migration module ${file}: must export { id, description, up }`);
    }
    if (!isMigrationId(migration.id)) {
      throw new Error(`Invalid migration id "${migration.id}" in ${file} (expected <num>-<kebab-case>)`);
    }
    migrations.push(migration);
  }

  // Ensure sorted by id (lexical order == numeric prefix order)
  migrations.sort((a, b) => a.id.localeCompare(b.id));

  // Duplicate ids
  const seen = new Set<string>();
  for (const m of migrations) {
    if (seen.has(m.id)) throw new Error(`Duplicate migration id "${m.id}"`);
    seen.add(m.id);
  }

  return migrations;
}

export async function getAppliedIds(db: Db): Promise<Set<string>> {
  const col = db.collection<MigrationRecord>(MIGRATIONS_COLLECTION);
  const docs = await col.find({}, { projection: { _id: 1 } }).toArray();
  return new Set(docs.map((d) => d._id));
}

export async function runMigrations(options: RunOptions): Promise<RunResult> {
  const { db, dryRun = false } = options;
  const migrationsDir =
    options.migrationsDir ?? path.join(process.cwd(), "migrations");

  const all = await loadMigrations(migrationsDir);
  const applied = await getAppliedIds(db);
  const pending = all.filter((m) => !applied.has(m.id));

  const pendingBefore = pending.map((m) => m.id);
  const skipped = all.filter((m) => applied.has(m.id)).map((m) => m.id);

  if (dryRun) {
    return { applied: [], skipped, pendingBefore };
  }

  const newlyApplied: string[] = [];

  for (const migration of pending) {
    const started = Date.now();
    console.log(`[migrate] Applying ${migration.id}: ${migration.description}`);
    await migration.up(db);
    const durationMs = Date.now() - started;

    // Record after successful up(). Unique index on _id prevents double-apply on concurrent builds.
    await db.collection<MigrationRecord>(MIGRATIONS_COLLECTION).insertOne({
      _id: migration.id,
      description: migration.description,
      appliedAt: new Date(),
      durationMs,
    });
    newlyApplied.push(migration.id);
    console.log(`[migrate] Applied ${migration.id} in ${durationMs}ms`);
  }

  return { applied: newlyApplied, skipped, pendingBefore };
}
