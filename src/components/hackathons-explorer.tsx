"use client";

import { useMemo, useRef, useState } from "react";
import type { Hackathon } from "@/db/schema";
import { HackathonCard } from "./hackathon-card";
import { CalendarIcon } from "./icons";

const THEMES = ["All", "AI/ML", "FinTech", "Climate"] as const;
type Tab = "upcoming" | "past";

const SORTS = [
  { key: "open_first", label: "Open applications first" },
  { key: "date_asc", label: "Date — soonest first" },
  { key: "date_desc", label: "Date — latest first" },
  { key: "deadline", label: "Application deadline" },
  { key: "title", label: "Title (A–Z)" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

/** Lower number = higher priority in "open applications first". */
const statusRank = (status: string) =>
  status === "applications_open" ? 0 : status === "starts_soon" ? 1 : 2;

export function HackathonsExplorer({ hackathons }: { hackathons: Hackathon[] }) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [theme, setTheme] = useState<(typeof THEMES)[number]>("All");
  const [sort, setSort] = useState<SortKey>("open_first");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const rangeRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const rows = hackathons.filter((h) => {
      const isPast = h.status === "ended";
      if (tab === "upcoming" ? isPast : !isPast) return false;
      if (theme !== "All" && h.theme !== theme) return false;
      if (from && h.endDate && h.endDate < from) return false;
      if (to && h.startDate && h.startDate > to) return false;
      return true;
    });

    const byDate = (a: string | null, b: string | null, dir: 1 | -1) => {
      if (!a && !b) return 0;
      if (!a) return 1; // undated events sink to the bottom
      if (!b) return -1;
      return a < b ? -dir : a > b ? dir : 0;
    };

    return [...rows].sort((a, b) => {
      switch (sort) {
        case "date_asc":
          return byDate(a.startDate, b.startDate, 1);
        case "date_desc":
          return byDate(a.startDate, b.startDate, -1);
        case "deadline":
          return byDate(a.applicationDeadline, b.applicationDeadline, 1);
        case "title":
          return a.title.localeCompare(b.title);
        case "open_first":
        default: {
          // Open applications first, then soonest start date as the tiebreaker.
          const rank = statusRank(a.status) - statusRank(b.status);
          return rank !== 0 ? rank : byDate(a.startDate, b.startDate, 1);
        }
      }
    });
  }, [hackathons, tab, theme, from, to, sort]);

  const rangeActive = Boolean(from || to);

  return (
    <div>
      {/* Filter bar */}
      <div className="rounded-2xl border border-edge-soft bg-panel px-4 py-4 sm:px-5">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          {/* Upcoming / Past tabs */}
          <div className="flex rounded-xl border border-edge-soft bg-ink p-1">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg px-5 py-1.5 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? "bg-[#2b2d33] text-white"
                    : "text-mist hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Theme chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-[11px] font-semibold tracking-wider text-fog">
              THEMES:
            </span>
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`rounded-full border px-3.5 py-1 text-xs transition-colors ${
                  theme === t
                    ? "border-mint/60 bg-mint/10 text-mint"
                    : "border-edge bg-ink text-mist hover:border-fog hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort */}
          <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-fog">
            SORT:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort hackathons"
              className="rounded-lg border border-edge bg-ink px-3 py-2 text-xs font-medium text-mist focus:border-mint/60 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {/* Date range */}
          <div className="relative" ref={rangeRef}>
            <button
              type="button"
              onClick={() => setRangeOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                rangeActive
                  ? "border-mint/60 bg-mint/10 text-mint"
                  : "border-edge bg-ink text-mist hover:text-white"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              {rangeActive ? `${from || "…"} → ${to || "…"}` : "Date Range"}
            </button>

            {rangeOpen && (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-edge bg-card p-4 shadow-xl shadow-black/50">
                <label className="block text-[11px] font-medium text-fog">
                  From
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-xs text-white outline-none focus:border-mint/60"
                  />
                </label>
                <label className="mt-3 block text-[11px] font-medium text-fog">
                  To
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-edge bg-ink px-3 py-2 text-xs text-white outline-none focus:border-mint/60"
                  />
                </label>
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                    className="text-xs text-fog hover:text-white"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setRangeOpen(false)}
                    className="rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-[#062a21]"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <HackathonCard key={h.slug} hackathon={h} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-edge py-16 text-center">
          <p className="font-display text-lg font-semibold text-white">No hackathons found</p>
          <p className="mt-1 text-sm text-mist">
            Try a different theme, tab, or date range.
          </p>
        </div>
      )}
    </div>
  );
}
