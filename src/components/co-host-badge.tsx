export function CoHostBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border border-edge bg-panel px-3 py-1.5 text-[11px] font-medium text-mist ${className}`}
    >
      Hosted by <span className="font-semibold text-mint">JHUB Africa &amp; JKUAT</span>
    </span>
  );
}
