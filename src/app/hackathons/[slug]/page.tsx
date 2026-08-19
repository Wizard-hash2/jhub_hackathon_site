import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHackathonBySlug } from "@/lib/hackathons";
import { formatDateRange } from "@/lib/format";
import { CoHostBadge } from "@/components/co-host-badge";
import { StatusBadge } from "@/components/status-badge";
import { CalendarIcon, GlobeIcon, MapPinIcon, UsersIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HackathonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const LocationIcon = hackathon.locationType === "virtual" ? GlobeIcon : MapPinIcon;
  const isTeam = hackathon.applicationMode === "team";

  const deadlinePassed = hackathon.applicationDeadline
    ? Date.now() > new Date(`${hackathon.applicationDeadline}T23:59:59Z`).getTime()
    : false;
  const canApply = hackathon.status !== "ended" && !deadlinePassed;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <Link href="/" className="text-sm text-mist transition-colors hover:text-white">
        &larr; Back to hackathons
      </Link>

      <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-2xl border border-edge-soft">
        <Image
          src={hackathon.imageUrl}
          alt={hackathon.title}
          fill
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover"
          priority
        />
        <StatusBadge status={hackathon.status} className="absolute right-4 top-4" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {hackathon.title}
        </h1>
        <CoHostBadge />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-mist">
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-fog" />
          {formatDateRange(hackathon.startDate, hackathon.endDate)}
        </span>
        <span className="flex items-center gap-2">
          <LocationIcon className="h-4 w-4 text-fog" />
          {hackathon.location}
        </span>
        <span className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-fog" />
          {isTeam
            ? `Teams of ${hackathon.minTeamSize}–${hackathon.maxTeamSize}`
            : "Individual entry"}
        </span>
      </div>

      <p className="mt-6 max-w-2xl leading-relaxed text-mist">
        {hackathon.description || hackathon.summary}
      </p>

      {/* Apply CTA */}
      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-edge-soft bg-panel px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-white">
            {canApply ? "Ready to build?" : "Applications closed"}
          </p>
          <p className="mt-1 text-sm text-mist">
            {canApply ? (
              <>
                {isTeam
                  ? `Apply as a team of ${hackathon.minTeamSize}–${hackathon.maxTeamSize}. The team lead submits everyone's details.`
                  : "Apply individually — it only takes a minute."}
                {hackathon.applicationDeadline && (
                  <> Applications close {hackathon.applicationDeadline}.</>
                )}
              </>
            ) : (
              "This event is no longer accepting new applications."
            )}
          </p>
        </div>

        {canApply ? (
          hackathon.externalRegUrl ? (
            <a
              href={hackathon.externalRegUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-lg bg-mint px-6 py-3 text-sm font-semibold text-[#062a21] transition-opacity hover:opacity-90"
            >
              Apply Now ↗
            </a>
          ) : (
            <Link
              href={`/hackathons/${hackathon.slug}/apply`}
              className="shrink-0 rounded-lg bg-mint px-6 py-3 text-center text-sm font-semibold text-[#062a21] transition-opacity hover:opacity-90"
            >
              Apply Now
            </Link>
          )
        ) : (
          <span className="shrink-0 cursor-not-allowed rounded-lg border border-edge px-6 py-3 text-center text-sm font-medium text-fog">
            Closed
          </span>
        )}
      </div>
    </div>
  );
}
