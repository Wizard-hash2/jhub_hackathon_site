import Image from "next/image";
import Link from "next/link";
import type { Resource } from "@/data/resources";
import {
  ArrowRightIcon,
  ClockIcon,
  CompassIcon,
  DownloadIcon,
  PlayIcon,
} from "./icons";

const TYPE_BADGE: Record<Resource["type"], { label: string; className: string }> = {
  article: { label: "ARTICLE", className: "bg-rose text-[#2a1414]" },
  video: { label: "VIDEO", className: "bg-mint text-[#062a21]" },
  download: { label: "DOWNLOAD", className: "bg-info text-white" },
  showcase: { label: "SHOWCASE", className: "bg-[#2b2d33] text-mist" },
};

function TypeBadge({ type, className = "" }: { type: Resource["type"]; className?: string }) {
  const badge = TYPE_BADGE[type];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide ${badge.className} ${className}`}
    >
      {badge.label}
    </span>
  );
}

export function ResourceCard({ resource }: { resource: Resource }) {
  if (resource.type === "showcase") {
    return (
      <Link
        href={resource.href}
        className="group flex flex-col overflow-hidden rounded-2xl border border-edge-soft bg-card transition-colors hover:border-edge sm:col-span-2 sm:flex-row"
      >
        <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-1/2">
          <Image
            src={resource.image}
            alt={resource.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            Past Project Showcase
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center px-6 py-6">
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-panel px-3 py-1 text-[11px] font-medium text-mist"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-white">
            {resource.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-mist">{resource.description}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-mint">
            View Case Study
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    );
  }

  if (resource.type === "download") {
    return (
      <Link
        href={resource.href}
        className="group flex flex-col overflow-hidden rounded-2xl border border-edge-soft bg-card transition-colors hover:border-edge"
      >
        <div className="relative flex aspect-[16/8.2] items-center justify-center bg-[#1c1d22]">
          <TypeBadge type="download" className="absolute right-3 top-3" />
          <CompassIcon className="h-9 w-9 text-fog transition-colors group-hover:text-mist" />
        </div>
        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <h3 className="font-display text-lg font-semibold tracking-tight text-white">
            {resource.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{resource.description}</p>
          <div className="mt-4 flex items-center gap-2 border-t border-edge-soft pt-4 text-xs text-mist">
            <DownloadIcon className="h-4 w-4 text-fog" />
            {resource.fileInfo}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={resource.href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-edge-soft bg-card transition-colors hover:border-edge"
    >
      <div className="relative aspect-[16/8.2] overflow-hidden">
        <Image
          src={resource.image}
          alt={resource.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <TypeBadge type={resource.type} className="absolute right-3 top-3" />
        {resource.type === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-transform group-hover:scale-110">
              <PlayIcon className="ml-0.5 h-5 w-5 text-white" />
            </span>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-white">
          {resource.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{resource.description}</p>
        <div className="mt-4 flex items-center gap-2 border-t border-edge-soft pt-4 text-xs text-mist">
          <ClockIcon className="h-4 w-4 text-fog" />
          {resource.type === "article" ? resource.readTime : resource.duration}
        </div>
      </div>
    </Link>
  );
}
