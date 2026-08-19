import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteResource,
  getResourceBySlug,
  updateResource,
  validateResource,
} from "@/lib/resources-db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

/** GET /api/resources/[slug] */
export async function GET(_request: Request, { params }: Ctx) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  return NextResponse.json({ resource });
}

/** PATCH /api/resources/[slug] — partial update. */
export async function PATCH(request: Request, { params }: Ctx) {
  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const problem = validateResource(body as never, true);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const updated = await updateResource(slug, body as never);
  if (!updated) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

  revalidatePath("/resources");
  revalidatePath(`/resources/${slug}`);
  return NextResponse.json({ resource: updated });
}

/** PUT behaves like PATCH for convenience. */
export const PUT = PATCH;

/** DELETE /api/resources/[slug] */
export async function DELETE(_request: Request, { params }: Ctx) {
  const { slug } = await params;
  const ok = await deleteResource(slug);
  if (!ok) return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  revalidatePath("/resources");
  return NextResponse.json({ deleted: slug });
}
