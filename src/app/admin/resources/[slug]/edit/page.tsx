import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listResources } from "@/lib/resources-db";
import { ResourceForm } from "@/components/admin/resource-form";

export const metadata: Metadata = { title: "Edit Resource | Admin Portal" };
export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resources = await listResources();
  const resource = resources.find((r) => r.slug === slug);
  if (!resource) notFound();

  return <ResourceForm existing={resource} />;
}
