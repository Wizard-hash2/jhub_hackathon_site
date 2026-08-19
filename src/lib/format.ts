const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parse(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Formats a range like "Oct 15 - 17, 2024" or "Oct 30 - Nov 02, 2024". */
export function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start || !end) return "Dates TBD";
  const s = parse(start);
  const e = parse(end);
  if (s.y === e.y && s.m === e.m) {
    return `${MONTHS[s.m - 1]} ${pad(s.d)} - ${pad(e.d)}, ${s.y}`;
  }
  if (s.y === e.y) {
    return `${MONTHS[s.m - 1]} ${pad(s.d)} - ${MONTHS[e.m - 1]} ${pad(e.d)}, ${s.y}`;
  }
  return `${MONTHS[s.m - 1]} ${pad(s.d)}, ${s.y} - ${MONTHS[e.m - 1]} ${pad(e.d)}, ${e.y}`;
}
