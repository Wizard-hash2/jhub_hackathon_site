import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { resources, type ResourceRow } from "@/db/schema";
import { resources as seedResources, type Resource } from "@/data/resources";
import { slugify } from "./slugify";

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  const existing = await db.select({ id: resources.id }).from(resources).limit(1);
  if (existing.length === 0) {
    await db.insert(resources).values(
      seedResources.map((r, i) => ({
        slug: r.slug,
        title: r.title,
        description: r.description,
        category: r.category,
        type: r.type,
        image: r.image,
        href: r.href,
        readTime: r.type === "article" ? r.readTime : "",
        duration: r.type === "video" ? r.duration : "",
        fileInfo: r.type === "download" ? r.fileInfo : "",
        tags: r.type === "showcase" ? r.tags.join(",") : "",
        sortOrder: i,
      })),
    ).onConflictDoNothing();
  }
  seeded = true;
}

/** Maps a DB row back onto the discriminated union the cards render from. */
export function rowToResource(row: ResourceRow): Resource {
  const base = {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category as Resource["category"],
    image: row.image,
    href: row.href || `/resources/${row.slug}`,
  };
  switch (row.type) {
    case "video":
      return { ...base, type: "video", duration: row.duration || "—" };
    case "download":
      return { ...base, type: "download", fileInfo: row.fileInfo || "File" };
    case "showcase":
      return {
        ...base,
        type: "showcase",
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
    default:
      return { ...base, type: "article", readTime: row.readTime || "—" };
  }
}

export async function listResources(): Promise<Resource[]> {
  await ensureSeeded();
  const rows = await db.select().from(resources).orderBy(asc(resources.sortOrder));
  return rows.map(rowToResource);
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  await ensureSeeded();
  const [row] = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
  return row ? rowToResource(row) : null;
}

export interface ResourceInput {
  slug?: string;
  title: string;
  description?: string;
  category: string;
  type: "article" | "video" | "download" | "showcase";
  image?: string;
  href?: string;
  readTime?: string;
  duration?: string;
  fileInfo?: string;
  tags?: string[] | string;
  sortOrder?: number;
}

const VALID_TYPES = ["article", "video", "download", "showcase"];

export function validateResource(input: Partial<ResourceInput>, partial = false): string | null {
  if (!partial || input.title !== undefined) {
    if (!input.title || !String(input.title).trim()) return "title is required";
  }
  if (!partial || input.category !== undefined) {
    if (!input.category || !String(input.category).trim()) return "category is required";
  }
  if (!partial || input.type !== undefined) {
    if (!input.type || !VALID_TYPES.includes(input.type)) {
      return `type must be one of: ${VALID_TYPES.join(", ")}`;
    }
  }
  return null;
}

const tagsToString = (tags?: string[] | string) =>
  Array.isArray(tags) ? tags.join(",") : (tags ?? "");

export async function createResource(input: ResourceInput): Promise<Resource> {
  await ensureSeeded();
  const slug = (input.slug?.trim() || slugify(input.title)).toLowerCase();
  const [row] = await db
    .insert(resources)
    .values({
      slug,
      title: input.title.trim(),
      description: input.description ?? "",
      category: input.category,
      type: input.type,
      image: input.image ?? "",
      href: input.href ?? `/resources/${slug}`,
      readTime: input.readTime ?? "",
      duration: input.duration ?? "",
      fileInfo: input.fileInfo ?? "",
      tags: tagsToString(input.tags),
      sortOrder: input.sortOrder ?? 999,
      updatedAt: new Date(),
    })
    .returning();
  return rowToResource(row);
}

export async function updateResource(
  slug: string,
  input: Partial<ResourceInput>,
): Promise<Resource | null> {
  await ensureSeeded();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of [
    "title",
    "description",
    "category",
    "type",
    "image",
    "href",
    "readTime",
    "duration",
    "fileInfo",
    "sortOrder",
  ] as const) {
    if (input[key] !== undefined) patch[key] = input[key];
  }
  if (input.tags !== undefined) patch.tags = tagsToString(input.tags);
  if (input.slug !== undefined) patch.slug = input.slug.trim().toLowerCase();

  const [row] = await db
    .update(resources)
    .set(patch)
    .where(eq(resources.slug, slug))
    .returning();
  return row ? rowToResource(row) : null;
}

export async function deleteResource(slug: string): Promise<boolean> {
  await ensureSeeded();
  const deleted = await db.delete(resources).where(eq(resources.slug, slug)).returning();
  return deleted.length > 0;
}
