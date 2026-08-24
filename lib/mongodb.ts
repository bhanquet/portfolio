import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");
const mongoUri: string = uri;

// Reuse a single client across the whole process (dev HMR and production
// alike) so we never leak connections by creating a new pool per request.
const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoDidSetup?: boolean;
};

export async function getDB() {
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(mongoUri);
  }
  const client = globalWithMongo._mongoClient;

  await client.connect();
  const db = client.db(dbName);
  if (!globalWithMongo._mongoDidSetup) {
    await setup(db);
    globalWithMongo._mongoDidSetup = true;
  }

  return db;
}

async function setup(db: Db) {
  await db.collection("blogs").createIndex({ slug: 1 }, { unique: true });
  globalWithMongo._mongoDidSetup = true;

  console.log("Index created successfully");
}
