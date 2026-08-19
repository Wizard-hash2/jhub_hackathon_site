import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { hackathons, sponsors, type Hackathon, type Sponsor } from "@/db/schema";
import { seedHackathons } from "@/db/seed-data";
import { slugify } from "./slugify";

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  // Count existing rows
  const existing = await db.select({ id: hackathons.id }).from(hackathons).limit(1);
  if (existing.length === 0) {
    await db.insert(hackathons).values(seedHackathons).onConflictDoNothing();
  }
  seeded = true;
}

export type AdminStatus = "published" | "draft" | "archived";
export type SortKey = "title" | "startDate" | "updatedAt" | "adminStatus";
export type SortDir = "asc" | "desc";

export interface ListQuery {
  adminStatus?: AdminStatus | "all";
  theme?: string | "all";
  search?: string;
  sortKey?: SortKey;
  sortDir?: SortDir;
}

export async function listHackathons(query: ListQuery = {}): Promise<Hackathon[]> {
  await ensureSeeded();
  const { adminStatus, theme, search, sortKey = "startDate", sortDir = "asc" } = query;

  // Eager load and filter/sort in Node for simplicity (datasets are small for admin).
  let rows = await db.select().from(hackathons);

  if (adminStatus && adminStatus !== "all") {
    rows = rows.filter((r) => r.adminStatus === adminStatus);
  }
  if (theme && theme !== "all") {
    rows = rows.filter((r) => r.theme === theme);
  }
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.track.toLowerCase().includes(q) ||
        r.theme.toLowerCase().includes(q),
    );
  }

  const cmp = (a: Hackathon, b: Hackathon) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return -1 * dir;
    if (bv == null) return 1 * dir;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  };
  rows.sort(cmp);
  return rows;
}

export async function listAllForAdmin(): Promise<Hackathon[]> {
  await ensureSeeded();
  return db.select().from(hackathons).orderBy(asc(hackathons.startDate));
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon | null> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getDistinctThemes(): Promise<string[]> {
  await ensureSeeded();
  const rows = await db.select({ theme: hackathons.theme }).from(hackathons);
  return Array.from(new Set(rows.map((r) => r.theme))).sort();
}

export async function countByStatus(): Promise<Record<AdminStatus | "all", number>> {
  await ensureSeeded();
  const rows = await db.select({ adminStatus: hackathons.adminStatus }).from(hackathons);
  const counts: Record<string, number> = { published: 0, draft: 0, archived: 0, all: rows.length };
  for (const r of rows) counts[r.adminStatus] = (counts[r.adminStatus] ?? 0) + 1;
  return counts as Record<AdminStatus | "all", number>;
}

/** Create a new hackathon row and return it. */
export async function createHackathon(input: any): Promise<Hackathon> {
  const [row] = await db
    .insert(hackathons)
    .values({ ...input, updatedAt: new Date() })
    .returning();
  return row;
}

/** Compatibility alias used by the public homepage. */
export async function getHackathons(): Promise<Hackathon[]> {
  return listHackathons({ adminStatus: "published", sortKey: "startDate", sortDir: "asc" });
}

/** Duplicate any hackathon into a new draft. */
export async function duplicateHackathon(id: number): Promise<Hackathon | null> {
  const rows = await db.select().from(hackathons).where(eq(hackathons.id, id)).limit(1);
  const original = rows[0];
  if (!original) return null;
  const copyTitle = `${original.title} (Copy)`;
  const [created] = await db
    .insert(hackathons)
    .values({
      slug: slugify(copyTitle) + "-" + Math.random().toString(36).slice(2, 6),
      title: copyTitle,
      summary: original.summary,
      description: original.description,
      theme: original.theme,
      tags: original.tags,
      status: original.status,
      adminStatus: "draft",
      track: original.track,
      participantCount: 0,
      startDate: original.startDate,
      endDate: original.endDate,
      applicationDeadline: original.applicationDeadline,
      location: original.location,
      locationType: original.locationType,
      externalRegUrl: original.externalRegUrl,
      imageUrl: original.imageUrl,
      applicationMode: original.applicationMode,
      minTeamSize: original.minTeamSize,
      maxTeamSize: original.maxTeamSize,
      sortOrder: original.sortOrder + 1,
      updatedAt: new Date(),
    })
    .returning();
  return created;
}

export async function deleteHackathon(id: number): Promise<void> {
  await db.delete(hackathons).where(eq(hackathons.id, id));
}

export async function updateAdminStatus(
  id: number,
  adminStatus: AdminStatus,
): Promise<Hackathon | null> {
  const [updated] = await db
    .update(hackathons)
    .set({ adminStatus, updatedAt: new Date() })
    .where(eq(hackathons.id, id))
    .returning();
  return updated ?? null;
}

export interface SponsorInput {
  name: string;
  logoUrl: string;
}

export interface HackathonInput {
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  theme: string;
  tags?: string[];
  status?: string;
  adminStatus?: "published" | "draft" | "archived";
  track?: string;
  startDate?: string | null;
  endDate?: string | null;
  applicationDeadline?: string | null;
  location?: string;
  locationType?: "physical" | "virtual" | "hybrid";
  externalRegUrl?: string;
  imageUrl?: string;
  applicationMode?: "individual" | "team";
  minTeamSize?: number;
  maxTeamSize?: number;
}

export async function createHackathonWithSponsors(
  input: HackathonInput,
  sponsorList: SponsorInput[] = [],
): Promise<Hackathon> {
  const [created] = await db
    .insert(hackathons)
    .values({
      slug: input.slug,
      title: input.title,
      summary: input.summary ?? "",
      description: input.description ?? "",
      theme: input.theme,
      tags: (input.tags ?? []).join(","),
      status: input.status ?? "applications_open",
      adminStatus: input.adminStatus ?? "draft",
      track: input.track ?? "",
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      applicationDeadline: input.applicationDeadline ?? null,
      location: input.location ?? "",
      locationType: input.locationType ?? "physical",
      externalRegUrl: input.externalRegUrl ?? "",
      imageUrl: input.imageUrl ?? "",
      applicationMode: input.applicationMode ?? "individual",
      minTeamSize: input.minTeamSize ?? 2,
      maxTeamSize: input.maxTeamSize ?? 5,
      sortOrder: 0,
      participantCount: 0,
      updatedAt: new Date(),
    })
    .returning();

  if (sponsorList.length > 0) {
    await db.insert(sponsors).values(
      sponsorList.map((s, i) => ({
        hackathonId: created.id,
        name: s.name,
        logoUrl: s.logoUrl,
        sortOrder: i,
      })),
    );
  }

  return created;
}

export async function getSponsors(hackathonId: number): Promise<Sponsor[]> {
  return db
    .select()
    .from(sponsors)
    .where(eq(sponsors.hackathonId, hackathonId))
    .orderBy(asc(sponsors.sortOrder));
}

export { slugify } from "./slugify";
