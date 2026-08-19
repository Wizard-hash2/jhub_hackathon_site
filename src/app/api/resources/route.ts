import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createResource, listResources, validateResource } from "@/lib/resources-db";

export const dynamic = "force-dynamic";

/** GET /api/resources — list every resource (optionally ?category=…&type=…). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  let items = await listResources();
  if (category && category !== "All") items = items.filter((r) => r.category === category);
  if (type) items = items.filter((r) => r.type === type);

  return NextResponse.json({ count: items.length, items });
}

/** POST /api/resources — create a resource. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const problem = validateResource(body as never);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const created = await createResource(body as never);
    revalidatePath("/resources");
    return NextResponse.json({ resource: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create resource.";
    const conflict = message.includes("duplicate key");
    return NextResponse.json(
      { error: conflict ? "A resource with that slug already exists." : message },
      { status: conflict ? 409 : 500 },
    );
  }
}
