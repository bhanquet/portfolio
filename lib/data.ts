import { getDB } from "@/lib/mongodb";
import { Blog } from "./definitions";

function toBlog(doc: any): Blog {
  return {
    title: doc.title,
    slug: doc.slug,
    createdDate: new Date(doc.createdDate),
    editedDate: doc.editedDate ? new Date(doc.editedDate) : null,
    tags: doc.tags,
    imagePath: doc.imagePath,
    summary: doc.summary,
    content: doc.content,
  };
}

export async function fetchBlogs({
  searchQuery = "",
  page = 1,
  maxItem = 10,
}: {
  searchQuery?: string | undefined;
  page?: number;
  maxItem?: number;
}): Promise<Blog[]> {
  const db = await getDB();

  const filter = buildSearchFilter(searchQuery);

  const blogsDoc = await db
    .collection("blogs")
    .find(filter)
    .skip((page - 1) * maxItem)
    .limit(maxItem)
    .toArray();

  return blogsDoc.map(toBlog);
}

export async function fetchBlogsCount(
  searchQuery: string = "",
): Promise<number> {
  const db = await getDB();
  const filter = buildSearchFilter(searchQuery);

  return await db.collection("blogs").countDocuments(filter);
}

export async function fetchBlog(slug: string): Promise<Blog | null> {
  const db = await getDB();
  const blogDoc = await db.collection("blogs").findOne({ slug });

  if (!blogDoc) return null;

  return toBlog(blogDoc);
}

export async function fetchAllTags(): Promise<string[]> {
  const db = await getDB();
  const blogsDoc = await db.collection("blogs").find().toArray();

  const tagsSet = new Set<string>();
  blogsDoc.forEach((blog) => {
    blog.tags?.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });

  return Array.from(tagsSet);
}

// -- Helper functions
function buildSearchFilter(query: string | undefined): Record<string, any> {
  return query
    ? {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { summary: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      }
    : {};
}
