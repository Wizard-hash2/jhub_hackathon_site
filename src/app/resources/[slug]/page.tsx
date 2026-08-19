import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResourceBySlug } from "@/lib/resources-db";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <Link href="/resources" className="text-sm text-mist transition-colors hover:text-white">
        &larr; Back to resources
      </Link>

      {resource.image && (
        <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-2xl border border-edge-soft">
          <Image src={resource.image} alt={resource.title} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {resource.title}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-mist">{resource.description}</p>

      <p className="mt-10 rounded-xl border border-dashed border-edge bg-panel px-5 py-4 text-sm text-fog">
        Full resource content coming soon.
      </p>
    </div>
  );
}
