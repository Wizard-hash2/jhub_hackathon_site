import Image from "next/image";
import Link from "next/link";
import type { Hackathon } from "@/db/schema";
import { formatDateRange } from "@/lib/format";
import { CoHostBadge } from "./co-host-badge";
import { StatusBadge } from "./status-badge";
import { CalendarIcon, GlobeIcon, MapPinIcon } from "./icons";

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const LocationIcon = hackathon.locationType === "virtual" ? GlobeIcon : MapPinIcon;
  const canApply = hackathon.status !== "ended";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-edge-soft bg-card transition-colors duration-200 hover:border-edge focus-within:border-edge">
      <div className="relative aspect-[16/8.2] overflow-hidden">
        <Image
          src={hackathon.imageUrl}
          alt={hackathon.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <StatusBadge status={hackathon.status} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="font-display text-xl font-semibold tracking-tight text-white">
          <Link
            href={`/hackathons/${hackathon.slug}`}
            className="transition-colors hover:text-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
          >
            {hackathon.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">
          {hackathon.description || hackathon.summary}
        </p>

        <div className="mt-4 space-y-2 text-xs text-mist">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-fog" />
            <span>{formatDateRange(hackathon.startDate, hackathon.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <LocationIcon className="h-4 w-4 shrink-0 text-fog" />
            <span>{hackathon.location}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-edge-soft pt-4">
          <CoHostBadge />
          {canApply ? (
            <Link
              href={`/hackathons/${hackathon.slug}/apply`}
              className="rounded-lg bg-mint px-4 py-1.5 text-xs font-semibold text-[#062a21] transition-opacity hover:opacity-90"
            >
              Apply Now
            </Link>
          ) : (
            <span className="rounded-lg border border-edge px-4 py-1.5 text-xs font-medium text-fog">
              Closed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
