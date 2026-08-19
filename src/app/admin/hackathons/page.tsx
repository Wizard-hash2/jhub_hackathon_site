import type { Metadata } from "next";
import { countByStatus, listAllForAdmin, getDistinctThemes } from "@/lib/hackathons";
import { AdminHackathonsTable } from "@/components/admin/admin-hackathons-table";
import type { AdminStatus } from "@/lib/hackathons";

export const metadata: Metadata = {
  title: "Manage Hackathons | Admin Portal",
};

export const dynamic = "force-dynamic";

export default async function AdminHackathonsPage() {
  const [hackathons, counts, themes] = await Promise.all([
    listAllForAdmin(),
    countByStatus(),
    getDistinctThemes(),
  ]);

  const countsWithAll = {
    all: counts.all,
    published: counts.published,
    draft: counts.draft,
    archived: counts.archived,
  } as Record<"all" | AdminStatus, number>;

  return (
    <AdminHackathonsTable
      hackathons={hackathons}
      counts={countsWithAll}
      themes={themes}
    />
  );
}
