import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const db = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");

const client = new MongoClient(uri);

export async function getDB() {
  return client.db(db);
}
