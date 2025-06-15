import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "portfolio";

if (!uri) throw new Error("Missing MONGODB_URI");

const client = new MongoClient(uri);

async function setup() {
  const db = client.db(dbName);
  const blog = db.collection("blog");

  await blog.createIndex({ slug: 1 }, { unique: true });

  console.log("Index created successfully");
  await client.close();
}

setup().catch(console.error);
