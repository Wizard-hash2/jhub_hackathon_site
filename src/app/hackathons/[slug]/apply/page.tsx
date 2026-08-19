import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHackathonBySlug } from "@/lib/hackathons";
import { formatDateRange } from "@/lib/format";
import { ApplyForm } from "@/components/apply-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  return { title: hackathon ? `Apply · ${hackathon.title}` : "Apply" };
}

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const closed =
    hackathon.status === "ended" ||
    hackathon.adminStatus !== "published" ||
    (hackathon.applicationDeadline
      ? Date.now() > new Date(`${hackathon.applicationDeadline}T23:59:59Z`).getTime()
      : false);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <Link
        href={`/hackathons/${hackathon.slug}`}
        className="text-sm text-mist transition-colors hover:text-white"
      >
        &larr; Back to {hackathon.title}
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Apply to {hackathon.title}
      </h1>
      <p className="mt-2 text-sm text-mist">
        {formatDateRange(hackathon.startDate, hackathon.endDate)} · {hackathon.location}
        {hackathon.applicationDeadline && (
          <> · Applications close {hackathon.applicationDeadline}</>
        )}
      </p>

      <div className="mt-8">
        {closed ? (
          <div className="rounded-2xl border border-edge bg-panel px-6 py-10 text-center">
            <p className="font-display text-lg font-semibold text-white">Applications are closed</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-mist">
              This hackathon is no longer accepting applications. Browse other open events instead.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-[#062a21]"
            >
              See open hackathons
            </Link>
          </div>
        ) : (
          <ApplyForm hackathon={hackathon} />
        )}
      </div>
    </div>
  );
}
