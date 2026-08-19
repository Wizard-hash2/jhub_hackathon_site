/** Formats a Date into a short absolute string like "Sep 28, 2024". */
export function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Formats a range like "Oct 12 - Oct 15, 2024" or "Dec 01, 2023 - Jan 03, 2024". */
export function formatAdminDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start || !end) return "Dates TBD";
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const sameYear = s.getUTCFullYear() === e.getUTCFullYear();
  const sameMonth = sameYear && s.getUTCMonth() === e.getUTCMonth();
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const dayFmt = new Intl.DateTimeFormat("en-US", { day: "2-digit", timeZone: "UTC" });
  if (sameMonth) {
    return `${monthFmt.format(s)} ${dayFmt.format(s)} - ${dayFmt.format(e)}, ${s.getUTCFullYear()}`;
  }
  if (sameYear) {
    return `${monthFmt.format(s)} ${dayFmt.format(s)} - ${monthFmt.format(e)} ${dayFmt.format(e)}, ${s.getUTCFullYear()}`;
  }
  return `${monthFmt.format(s)} ${dayFmt.format(s)}, ${s.getUTCFullYear()} - ${monthFmt.format(e)} ${dayFmt.format(e)}, ${e.getUTCFullYear()}`;
}

/** Human-friendly relative label like "updated 2 days ago". */
export function relativeUpdated(updatedAt: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(updatedAt).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "updated just now";
  if (mins < 60) return `updated ${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `updated ${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `updated ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `updated ${years} year${years === 1 ? "" : "s"} ago`;
}
