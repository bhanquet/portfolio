import { Db, MongoClient } from "mongodb";

let didSetup = false;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
  }
  client = globalWithMongo._mongoClient;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
}

export async function getDB() {
  const db = client.db(dbName);
  if (!didSetup) setup(db);

  return db;
}

async function setup(db: Db) {
  await db.collection("blogs").createIndex({ slug: 1 }, { unique: true });
  didSetup = true;

  console.log("Index created successfully");
}
