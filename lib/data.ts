import { getDB } from "@/lib/mongodb";
import { Filter, ObjectId } from "mongodb";
import { Blog } from "./definitions";

interface BlogDoc {
  _id: ObjectId;
  title: string;
  slug: string;
  createdDate: string | Date;
  editedDate?: string | Date | null;
  tags?: string[];
  imagePath?: string;
  summary?: string;
  content?: string;
  public?: boolean;
}

function toBlog(doc: BlogDoc): Blog {
  return {
    title: doc.title || "",
    slug: doc.slug || "",
    createdDate: new Date(doc.createdDate),
    editedDate: doc.editedDate ? new Date(doc.editedDate) : null,
    tags: doc.tags || [],
    imagePath: doc.imagePath || "",
    summary: doc.summary || "",
    content: doc.content || "",
    public: doc.public || false,
  };
}

export async function fetchBlogs({
  searchQuery = "",
  page = 1,
  maxItem = 10,
  publicOnly = true,
}: {
  searchQuery?: string | undefined;
  page?: number;
  maxItem?: number;
  publicOnly?: boolean;
}): Promise<Blog[]> {
  const db = await getDB();

  const filter = buildSearchFilter(searchQuery, publicOnly);

  const blogsDoc = await db
    .collection<BlogDoc>("blogs")
    .find(filter)
    .skip((page - 1) * maxItem)
    .limit(maxItem)
    .toArray();

  return blogsDoc.map(toBlog);
}

export async function fetchBlogsCount(
  searchQuery: string = "",
  publicOnly: boolean = true,
): Promise<number> {
  const db = await getDB();
  const filter = buildSearchFilter(searchQuery, publicOnly);

  return await db.collection<BlogDoc>("blogs").countDocuments(filter);
}

export async function fetchAllBlogs(
  publicOnly: boolean = true,
): Promise<Blog[]> {
  const db = await getDB();
  const filter = publicOnly ? { public: true } : {};
  const blogDoc = await db.collection<BlogDoc>("blogs").find(filter).toArray();

  const blogs: Blog[] = blogDoc.map(toBlog);

  return blogs;
}

export async function fetchBlog(
  slug: string,
  publicOnly: boolean = true,
): Promise<Blog | null> {
  const db = await getDB();
  const filter: Filter<BlogDoc> = publicOnly
    ? { slug, public: true }
    : { slug };
  const blogDoc = await db.collection<BlogDoc>("blogs").findOne(filter);

  if (!blogDoc) return null;

  return toBlog(blogDoc);
}

export async function fetchAllTags(
  publicOnly: boolean = true,
): Promise<string[]> {
  const db = await getDB();
  const filter: Filter<BlogDoc> = publicOnly ? { public: true } : {};
  const blogsDoc = await db.collection<BlogDoc>("blogs").find(filter).toArray();

  const tagsSet = new Set<string>();
  blogsDoc.forEach((blog) => {
    blog.tags?.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });

  return Array.from(tagsSet);
}

export async function fetchBlogsByTag(
  tag: string,
  publicOnly: boolean = true,
): Promise<Blog[]> {
  const db = await getDB();
  const filter: Filter<BlogDoc> = publicOnly
    ? { public: true, tags: { $in: [tag] } }
    : { tags: { $in: [tag] } };
  const blogsDoc = await db
    .collection<BlogDoc>("blogs")
    .find(filter)
    .sort({ createdDate: -1 })
    .toArray();

  return blogsDoc.map(toBlog);
}

// -- Helper functions

/**
 * Escapes characters that have a special meaning in regular expressions.
 * Prevents ReDoS / regex injection when passing user input to MongoDB $regex.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeSearchQuery(query?: string): string {
  if (!query) return "";
  return escapeRegex(query.trim().slice(0, 100));
}

function buildSearchFilter(
  query?: string,
  publicOnly?: boolean,
): Filter<BlogDoc> {
  const sanitized = sanitizeSearchQuery(query);

  const search: Filter<BlogDoc> = !sanitized
    ? {}
    : {
        $or: [
          { title: { $regex: sanitized, $options: "i" } },
          { summary: { $regex: sanitized, $options: "i" } },
          { content: { $regex: sanitized, $options: "i" } },
          { tags: { $elemMatch: { $regex: sanitized, $options: "i" } } },
        ],
      };

  const visibility: Filter<BlogDoc> = publicOnly ? { public: true } : {};

  // Combine both; if one of them is empty, MongoDB treats {} in $and as no-op
  if (Object.keys(search).length && Object.keys(visibility).length) {
    return { $and: [search, visibility] };
  }
  // Return whichever is non-empty, or {} if both empty
  return Object.keys(search).length ? search : visibility;
}
