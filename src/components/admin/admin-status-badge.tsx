const STYLES: Record<string, { dot: string; text: string; label: string }> = {
  published: {
    dot: "bg-mint",
    text: "text-mint border-mint/40 bg-mint/5",
    label: "Published",
  },
  draft: {
    dot: "bg-[#e0b84a]",
    text: "text-[#e0b84a] border-[#e0b84a]/40 bg-[#e0b84a]/10",
    label: "Draft",
  },
  archived: {
    dot: "bg-fog",
    text: "text-mist border-fog/30 bg-[#2b2d33]/60",
    label: "Archived",
  },
};

export function AdminStatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.draft;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
