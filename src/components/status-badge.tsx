const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  applications_open: {
    label: "Applications Open",
    className: "bg-mint text-[#062a21]",
  },
  starts_soon: {
    label: "Starts Soon",
    className: "bg-[#2b2d33]/90 text-[#e8e9ec] backdrop-blur-sm",
  },
  ended: {
    label: "Ended",
    className: "bg-[#2b2d33]/90 text-fog backdrop-blur-sm",
  },
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.starts_soon;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${style.className} ${className}`}
    >
      {style.label}
    </span>
  );
}
