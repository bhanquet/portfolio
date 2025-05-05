import { MongoClient } from "mongodb";
const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function seedBlog() {
  const client = new MongoClient(uri);
  try {
    const database = client.db("bhanquet");
    const blogs = database.collection("blogs");

    const blogsToInsert = [
      {
        title: "A long story",
        tags: ["self"],
        summary: "Summary of my life",
        content: "This is how I do it ladies and gentlemen",
      },
    ];

    await blogs.deleteMany();
    const result = await blogs.insertMany(blogsToInsert);

    console.log(result);
  } finally {
    await client.close();
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      { message: "Seeding disabled in production" },
      { status: 403 },
    );
  }

  await seedBlog();

  return Response.json({ message: "Database seeded successfully" });
}
