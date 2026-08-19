"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Hackathon } from "@/db/schema";
import type { AdminStatus } from "@/lib/hackathons";
import { formatAdminDateRange, relativeUpdated } from "@/lib/time";
import { AdminStatusBadge } from "./admin-status-badge";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  EyeIcon,
  PencilIcon,
  SearchIcon,
  SortIcon,
  TrashIcon,
  UndoIcon,
} from "../icons";
import {
  deleteHackathonAction,
  duplicateHackathonAction,
  setAdminStatusAction,
} from "@/app/admin/hackathons/actions";

type Tab = "all" | "published" | "draft" | "archived";

interface Props {
  hackathons: Hackathon[];
  counts: Record<Tab, number>;
  themes: string[];
}

const PAGE_SIZE = 4;

type SortKey = "title" | "adminStatus" | "startDate" | "updatedAt";
type SortDir = "asc" | "desc";

/** Generates a small colored glyph square per theme (mimics the screenshot's colored icons). */
function TrackIcon({ theme }: { theme: string }) {
  const palette: Record<string, string> = {
    Web3: "bg-[#2a5cc7]",
    "AI/ML": "bg-[#2a5cc7]",
    FinTech: "bg-[#6b4f20]",
    Climate: "bg-[#2a5c4c]",
    HealthTech: "bg-[#9d2c60]",
    AgriTech: "bg-[#2a5c4c]",
    Sustainability: "bg-[#2a5c4c]",
  };
  const color = palette[theme] ?? "bg-[#3a3d45]";
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} text-white`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
        <rect x="4" y="4" width="16" height="14" rx="2" />
        <path d="M8 20h8" />
      </svg>
    </span>
  );
}

export function AdminHackathonsTable({ hackathons, counts, themes }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [theme, setTheme] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Hackathon | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [, startMutation] = useTransition();

  const filtered = useMemo(() => {
    let rows = hackathons;
    if (tab !== "all") rows = rows.filter((r) => r.adminStatus === tab);
    if (theme !== "all") rows = rows.filter((r) => r.theme === theme);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.track.toLowerCase().includes(q) ||
          r.theme.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }, [hackathons, tab, theme, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleTab(t: Tab) {
    setTab(t);
    setPage(1);
  }

  function handleTheme(t: string) {
    setTheme(t);
    setPage(1);
  }

  function doDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startDelete(async () => {
      await deleteHackathonAction(id);
      setPendingDelete(null);
      router.refresh();
    });
  }

  function doDuplicate(id: number) {
    startMutation(async () => {
      await duplicateHackathonAction(id);
      router.refresh();
    });
  }

  function doRestore(id: number) {
    startMutation(async () => {
      await setAdminStatusAction(id, "draft");
      router.refresh();
    });
  }

  const tabs: Array<{ key: Tab; label: string; count: number }> = [
    { key: "all", label: "All", count: counts.all },
    { key: "published", label: "Published", count: counts.published },
    { key: "draft", label: "Drafts", count: counts.draft },
    { key: "archived", label: "Archived", count: counts.archived },
  ];

  return (
    <div>
      {/* Page title + CTA */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Manage Hackathons
        </h1>
        <Link
          href="/admin/hackathons/new"
          className="inline-flex items-center gap-2 rounded-lg bg-rose px-5 py-2.5 text-sm font-semibold text-[#2a1414] transition-opacity hover:opacity-90"
        >
          + Create New Hackathon
        </Link>
      </div>

      {/* Search + status tabs */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search hackathons…"
            className="w-full rounded-lg border border-edge bg-panel py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-fog focus:border-sky/60 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTab(t.key)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-sky/60 bg-sky/10 text-sky"
                    : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
                }`}
              >
                {t.label} <span className={active ? "text-sky/70" : "text-fog"}>({t.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary theme filter */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold tracking-wider text-fog">THEME:</span>
        {["all", ...themes].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTheme(t)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              theme === t
                ? "border-mist/60 bg-white/10 text-white"
                : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
            }`}
          >
            {t === "all" ? "All Themes" : t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-edge-soft bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-edge-soft text-left text-[13px] font-semibold text-mist">
                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("title")}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Hackathon Title
                    <SortIcon
                      className={`h-3.5 w-3.5 transition-transform ${
                        sortKey === "title"
                          ? sortDir === "asc"
                            ? "text-sky -scale-y-100"
                            : "text-sky"
                          : "text-fog"
                      }`}
                    />
                  </button>
                </th>
                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("adminStatus")}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Status
                    <SortIcon
                      className={`h-3.5 w-3.5 transition-transform ${
                        sortKey === "adminStatus"
                          ? sortDir === "asc"
                            ? "text-sky -scale-y-100"
                            : "text-sky"
                          : "text-fog"
                      }`}
                    />
                  </button>
                </th>
                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("startDate")}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Dates
                    <SortIcon
                      className={`h-3.5 w-3.5 transition-transform ${
                        sortKey === "startDate"
                          ? sortDir === "asc"
                            ? "text-sky -scale-y-100"
                            : "text-sky"
                          : "text-fog"
                      }`}
                    />
                  </button>
                </th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((h) => {
                const archived = h.adminStatus === "archived";
                return (
                  <tr
                    key={h.id}
                    className="border-b border-edge-soft last:border-b-0 hover:bg-panel/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-4">
                        <TrackIcon theme={h.theme} />
                        <div className="min-w-0">
                          <Link
                            href={`/hackathons/${h.slug}`}
                            className="block truncate font-semibold text-white hover:text-sky"
                          >
                            {h.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-fog">
                            {h.participantCount} Participants
                            {h.track ? ` • ${h.track}` : ""}
                          </p>
                          <p className="mt-1 truncate text-[11px] text-fog/70">
                            {relativeUpdated(h.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={h.adminStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-mist">
                        <CalendarIcon className="h-4 w-4 text-fog" />
                        {formatAdminDateRange(h.startDate, h.endDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {archived ? (
                          <>
                            <IconActionButton
                              label="Restore to Draft"
                              onClick={() => doRestore(h.id)}
                            >
                              <UndoIcon className="h-4 w-4" />
                            </IconActionButton>
                            <IconActionButton
                              label="Duplicate"
                              onClick={() => doDuplicate(h.id)}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </IconActionButton>
                            <Link
                              href={`/hackathons/${h.slug}`}
                              aria-label="Preview"
                              title="Preview"
                              className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-panel hover:text-white"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/admin/hackathons/${h.id}/edit`}
                              aria-label={h.adminStatus === "draft" ? "Edit draft" : "Edit"}
                              title={h.adminStatus === "draft" ? "Edit draft" : "Edit"}
                              className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-panel hover:text-white"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/hackathons/${h.slug}`}
                              target="_blank"
                              aria-label="Preview"
                              title="Preview"
                              className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-panel hover:text-white"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <IconActionButton
                              label="Duplicate"
                              onClick={() => doDuplicate(h.id)}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </IconActionButton>
                            <IconActionButton
                              label="Delete"
                              danger
                              onClick={() => setPendingDelete(h)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconActionButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-mist">
                    No hackathons match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-edge-soft px-5 py-4 sm:flex-row">
          <p className="text-xs text-mist">
            Showing{" "}
            <span className="text-white">
              {filtered.length === 0
                ? "0-0"
                : `${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(
                    currentPage * PAGE_SIZE,
                    filtered.length,
                  )}`}
            </span>{" "}
            of <span className="text-white">{filtered.length}</span>
          </p>

          <Pagination
            current={currentPage}
            total={totalPages}
            onGoTo={(p) => setPage(p)}
          />
        </div>
      </div>

      <DeleteConfirmModal
        open={!!pendingDelete}
        title={pendingDelete?.title ?? ""}
        onCancel={() => setPendingDelete(null)}
        onConfirm={doDelete}
        busy={isDeleting}
      />
    </div>
  );
}

function IconActionButton({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
        danger
          ? "text-fog hover:bg-[#c0392b]/20 hover:text-[#ff6b5b]"
          : "text-fog hover:bg-panel hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function Pagination({
  current,
  total,
  onGoTo,
}: {
  current: number;
  total: number;
  onGoTo: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => current > 1 && onGoTo(current - 1)}
        disabled={current === 1}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-edge text-fog transition-colors hover:border-fog hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-fog">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onGoTo(p)}
            aria-current={p === current ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
              p === current
                ? "border-sky/60 bg-sky/10 text-sky"
                : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => current < total && onGoTo(current + 1)}
        disabled={current === total}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-edge text-fog transition-colors hover:border-fog hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
