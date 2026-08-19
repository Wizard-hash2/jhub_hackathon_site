"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Resource } from "@/data/resources";
import { RESOURCE_CATEGORIES } from "@/data/resources";
import { deleteResourceAction } from "@/app/admin/resources/actions";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import {
  EyeIcon,
  PencilIcon,
  SearchIcon,
  SortIcon,
  TrashIcon,
} from "../icons";

type SortKey = "title" | "category" | "type";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  article: { label: "ARTICLE", className: "bg-rose text-[#2a1414]" },
  video: { label: "VIDEO", className: "bg-mint text-[#062a21]" },
  download: { label: "DOWNLOAD", className: "bg-info text-white" },
  showcase: { label: "SHOWCASE", className: "bg-[#2b2d33] text-mist" },
};

export function AdminResourcesTable({ resources }: { resources: Resource[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Resource | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const filtered = useMemo(() => {
    let rows = resources;
    if (typeFilter !== "all") rows = rows.filter((r) => r.type === typeFilter);
    if (categoryFilter !== "all") rows = rows.filter((r) => r.category === categoryFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return rows;
  }, [resources, typeFilter, categoryFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function doDelete() {
    if (!pendingDelete) return;
    const slug = pendingDelete.slug;
    startDelete(async () => {
      await deleteResourceAction(slug);
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Manage Resources
        </h1>
        <Link
          href="/admin/resources/new"
          className="inline-flex items-center gap-2 rounded-lg bg-rose px-5 py-2.5 text-sm font-semibold text-[#2a1414] transition-opacity hover:opacity-90"
        >
          + Add New Resource
        </Link>
      </div>

      {/* Search + filters */}
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
            placeholder="Search resources..."
            className="w-full rounded-lg border border-edge bg-panel py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-fog focus:border-sky/60 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-mist focus:border-sky/60 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="download">Downloads</option>
            <option value="showcase">Showcases</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-mist focus:border-sky/60 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-edge-soft bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-edge-soft text-left text-[13px] font-semibold text-mist">
                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("title")}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Title
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
                    onClick={() => toggleSort("category")}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Category
                    <SortIcon
                      className={`h-3.5 w-3.5 transition-transform ${
                        sortKey === "category"
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
                    onClick={() => toggleSort("type")}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    Type
                    <SortIcon
                      className={`h-3.5 w-3.5 transition-transform ${
                        sortKey === "type"
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
              {pageRows.map((r) => {
                const badge = TYPE_BADGES[r.type] ?? TYPE_BADGES.article;
                return (
                  <tr
                    key={r.slug}
                    className="border-b border-edge-soft last:border-b-0 hover:bg-panel/60"
                  >
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{r.title}</p>
                        <p className="mt-0.5 truncate text-xs text-fog">{r.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-mist">{r.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wide ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/resources/${r.slug}/edit`}
                          aria-label="Edit resource"
                          title="Edit resource"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-panel hover:text-white"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/resources/${r.slug}`}
                          target="_blank"
                          aria-label="Preview"
                          title="Preview"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-panel hover:text-white"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          aria-label="Delete resource"
                          title="Delete resource"
                          onClick={() => setPendingDelete(r)}
                          className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-[#c0392b]/20 hover:text-[#ff6b5b]"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-mist">
                    No resources match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => currentPage > 1 && setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-edge text-fog transition-colors hover:border-fog hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lsaquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors ${
                  p === currentPage
                    ? "border-sky/60 bg-sky/10 text-sky"
                    : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => currentPage < totalPages && setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-edge text-fog transition-colors hover:border-fog hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              &rsaquo;
            </button>
          </div>
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
