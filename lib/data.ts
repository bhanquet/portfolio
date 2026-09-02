import { getDB } from "@/lib/mongodb";
import { Filter, ObjectId } from "mongodb";
import { Blog } from "./definitions";

interface BlogDoc {
  _id: ObjectId;
  title: string;
  slug: string;
  locale: string;
  translationGroupId: string;
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
    locale: doc.locale,
    translationGroupId: doc.translationGroupId,
    createdDate: new Date(doc.createdDate),
    editedDate: doc.editedDate ? new Date(doc.editedDate) : null,
    tags: doc.tags || [],
    imagePath: doc.imagePath || "",
    summary: doc.summary || "",
    content: doc.content || "",
    public: doc.public || false,
  };
}

function localeFilter(locale?: string): Filter<BlogDoc> {
  if (!locale) return {};
  return { locale } as Filter<BlogDoc>;
}

export async function fetchBlogs({
  searchQuery = "",
  page = 1,
  maxItem = 10,
  publicOnly = true,
  locale,
}: {
  searchQuery?: string | undefined;
  page?: number;
  maxItem?: number;
  publicOnly?: boolean;
  locale?: string;
}): Promise<Blog[]> {
  const db = await getDB();

  const filter = combineFilters(
    buildSearchFilter(searchQuery, publicOnly),
    localeFilter(locale),
  );

  const blogsDoc = await db
    .collection<BlogDoc>("blogs")
    .find(filter)
    .skip((page - 1) * maxItem)
    .limit(maxItem)
    .sort({ createdDate: -1 })
    .toArray();

  return blogsDoc.map(toBlog);
}

export async function fetchBlogsCount(
  searchQuery: string = "",
  publicOnly: boolean = true,
  locale?: string,
): Promise<number> {
  const db = await getDB();
  const filter = combineFilters(
    buildSearchFilter(searchQuery, publicOnly),
    localeFilter(locale),
  );

  return await db.collection<BlogDoc>("blogs").countDocuments(filter);
}

export async function fetchAllBlogs(
  publicOnly: boolean = true,
  locale?: string,
): Promise<Blog[]> {
  const db = await getDB();
  const base: Filter<BlogDoc> = publicOnly ? { public: true } : {};
  const filter = combineFilters(base, localeFilter(locale));
  const blogDoc = await db.collection<BlogDoc>("blogs").find(filter).toArray();

  const blogs: Blog[] = blogDoc.map(toBlog);

  return blogs;
}

export async function fetchBlog(
  slug: string,
  publicOnly: boolean = true,
  locale?: string,
): Promise<Blog | null> {
  const db = await getDB();
  const base: Filter<BlogDoc> = publicOnly ? { slug, public: true } : { slug };
  const filter = combineFilters(base, localeFilter(locale));
  const blogDoc = await db.collection<BlogDoc>("blogs").findOne(filter);

  if (!blogDoc) return null;

  return toBlog(blogDoc);
}

export async function fetchBlogGroup(
  translationGroupId: string,
  publicOnly: boolean = false,
): Promise<Blog[]> {
  const db = await getDB();
  const base: Filter<BlogDoc> = { translationGroupId };
  const filter = publicOnly ? combineFilters(base, { public: true }) : base;
  const docs = await db.collection<BlogDoc>("blogs").find(filter).toArray();
  return docs.map(toBlog);
}

export async function fetchAllTags(
  publicOnly: boolean = true,
  locale?: string,
): Promise<string[]> {
  const db = await getDB();
  const base: Filter<BlogDoc> = publicOnly ? { public: true } : {};
  const filter = combineFilters(base, localeFilter(locale));
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
  tag: string | string[],
  publicOnly: boolean = true,
  locale?: string,
): Promise<Blog[]> {
  const tags = Array.isArray(tag) ? tag : [tag];
  const db = await getDB();
  const base: Filter<BlogDoc> = publicOnly
    ? { public: true, tags: { $in: tags } }
    : { tags: { $in: tags } };
  const filter = combineFilters(base, localeFilter(locale));
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

function combineFilters(
  a: Filter<BlogDoc>,
  b: Filter<BlogDoc>,
): Filter<BlogDoc> {
  const hasA = Object.keys(a).length > 0;
  const hasB = Object.keys(b).length > 0;
  if (hasA && hasB) return { $and: [a, b] } as Filter<BlogDoc>;
  if (hasA) return a;
  if (hasB) return b;
  return {};
}

export function serializeBlog(blog: Blog): Blog {
  // Convert Date objects to plain strings for Client Components (Next.js forbids passing Date with toJSON)
  const createdDate =
    blog.createdDate instanceof Date ? blog.createdDate.toISOString() : (blog.createdDate as string);
  const editedDate = !blog.editedDate
    ? null
    : blog.editedDate instanceof Date
      ? (blog.editedDate as Date).toISOString()
      : (blog.editedDate as string);
  // Explicitly pick fields to avoid leaking Mongo _id / buffer
  return {
    title: blog.title,
    slug: blog.slug,
    locale: blog.locale,
    translationGroupId: blog.translationGroupId,
    createdDate,
    editedDate,
    tags: [...(blog.tags || [])],
    imagePath: blog.imagePath ?? null,
    summary: blog.summary,
    content: blog.content,
    public: blog.public ?? false,
  };
}

export function serializeBlogs(blogs: Blog[]): Blog[] {
  return blogs.map(serializeBlog);
}
