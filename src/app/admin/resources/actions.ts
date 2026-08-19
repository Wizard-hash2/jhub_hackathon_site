"use server";

import { revalidatePath } from "next/cache";
import {
  createResource,
  updateResource,
  deleteResource,
  validateResource,
  type ResourceInput,
} from "@/lib/resources-db";

export interface CreateResourceFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  type: "article" | "video" | "download" | "showcase";
  image: string;
  href: string;
  readTime: string;
  duration: string;
  fileInfo: string;
  tags: string[];
}

export async function createResourceAction(data: CreateResourceFormData) {
  const input: ResourceInput = {
    title: data.title.trim(),
    slug: data.slug.trim() || undefined,
    description: data.description.trim(),
    category: data.category,
    type: data.type,
    image: data.image.trim(),
    href: data.href.trim() || `/resources/${data.slug.trim()}`,
    readTime: data.readTime,
    duration: data.duration,
    fileInfo: data.fileInfo,
    tags: data.tags,
  };

  const problem = validateResource(input as never);
  if (problem) throw new Error(problem);

  const created = await createResource(input);
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  return created;
}

export async function updateResourceAction(slug: string, data: Partial<CreateResourceFormData>) {
  const input: Partial<ResourceInput> = {};

  if (data.title !== undefined) input.title = data.title.trim();
  if (data.slug !== undefined) input.slug = data.slug.trim();
  if (data.description !== undefined) input.description = data.description.trim();
  if (data.category !== undefined) input.category = data.category;
  if (data.type !== undefined) input.type = data.type;
  if (data.image !== undefined) input.image = data.image.trim();
  if (data.href !== undefined) input.href = data.href.trim();
  if (data.readTime !== undefined) input.readTime = data.readTime;
  if (data.duration !== undefined) input.duration = data.duration;
  if (data.fileInfo !== undefined) input.fileInfo = data.fileInfo;
  if (data.tags !== undefined) input.tags = data.tags;

  const problem = validateResource(input as never, true);
  if (problem) throw new Error(problem);

  const updated = await updateResource(slug, input);
  if (!updated) throw new Error("Resource not found.");

  revalidatePath("/admin/resources");
  revalidatePath("/admin/resources/[slug]/edit");
  revalidatePath("/resources");
  revalidatePath(`/resources/${slug}`);
  return updated;
}

export async function deleteResourceAction(slug: string) {
  const ok = await deleteResource(slug);
  if (!ok) throw new Error("Resource not found.");

  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}
