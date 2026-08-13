import { Db, MongoClient } from "mongodb";

let didSetup = false;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");
const mongoUri: string = uri;

let client: MongoClient | undefined;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(mongoUri);
  }
  client = globalWithMongo._mongoClient;
}

export async function getDB() {
  const currentClient = client ?? new MongoClient(mongoUri);
  await currentClient.connect();
  const db = currentClient.db(dbName);
  if (!didSetup) await setup(db);

  return db;
}

async function setup(db: Db) {
  await db.collection("blogs").createIndex({ slug: 1 }, { unique: true });
  didSetup = true;

  console.log("Index created successfully");
}
