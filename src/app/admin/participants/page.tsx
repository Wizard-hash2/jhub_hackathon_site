import type { Metadata } from "next";
import Link from "next/link";
import { listParticipants } from "@/lib/applications";
import { listAllForAdmin } from "@/lib/hackathons";
import { DownloadIcon, UsersIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Participants | Admin Portal" };
export const dynamic = "force-dynamic";

export default async function AdminParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ hackathonId?: string }>;
}) {
  const { hackathonId } = await searchParams;
  const selectedId = hackathonId ? Number(hackathonId) : undefined;

  const [rows, events] = await Promise.all([
    listParticipants(Number.isFinite(selectedId) ? selectedId : undefined),
    listAllForAdmin(),
  ]);

  const totalPeople = rows.reduce((sum, r) => sum + r.members.length, 0);
  const teamCount = rows.filter((r) => r.application.mode === "team").length;
  const soloCount = rows.length - teamCount;
  const exportHref = `/api/admin/participants/export${
    selectedId ? `?hackathonId=${selectedId}` : ""
  }`;

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Participants
          </h1>
          <p className="mt-2 text-sm text-mist">
            {totalPeople} people · {teamCount} teams · {soloCount} individual entries
          </p>
        </div>
        <a
          href={exportHref}
          className="inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-[#062a21] transition-opacity hover:opacity-90"
        >
          <DownloadIcon className="h-4 w-4" />
          Export to Excel (CSV)
        </a>
      </div>

      {/* Hackathon filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold tracking-wider text-fog">EVENT:</span>
        <Link
          href="/admin/participants"
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !selectedId
              ? "border-sky/60 bg-sky/10 text-sky"
              : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
          }`}
        >
          All events
        </Link>
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/admin/participants?hackathonId=${e.id}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              selectedId === e.id
                ? "border-sky/60 bg-sky/10 text-sky"
                : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
            }`}
          >
            {e.title}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-edge-soft bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-edge-soft text-left text-[13px] font-semibold text-mist">
                <th className="px-5 py-4">Team / Applicant</th>
                <th className="px-5 py-4">Hackathon</th>
                <th className="px-5 py-4">Members</th>
                <th className="px-5 py-4">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ application, hackathon, members }) => (
                <tr key={application.id} className="border-b border-edge-soft last:border-b-0">
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-panel text-fog">
                        <UsersIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {application.mode === "team"
                            ? application.teamName
                            : application.leadName}
                        </p>
                        <p className="mt-0.5 text-xs text-fog">
                          {application.mode === "team" ? "Team" : "Individual"} ·{" "}
                          {application.leadEmail}
                        </p>
                        {application.institution && (
                          <p className="mt-0.5 text-[11px] text-fog/70">
                            {application.institution}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-mist">{hackathon.title}</td>
                  <td className="px-5 py-4 align-top">
                    <ul className="space-y-1">
                      {members.map((m) => (
                        <li key={m.id} className="text-xs text-mist">
                          <span className="text-white">{m.name}</span>{" "}
                          <span className="text-fog">&lt;{m.email}&gt;</span>
                          {m.role === "lead" && (
                            <span className="ml-1.5 rounded bg-mint/10 px-1.5 py-0.5 text-[10px] font-semibold text-mint">
                              LEAD
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-4 align-top whitespace-nowrap text-xs text-mist">
                    {new Date(application.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-sm text-mist">
                    No applications yet. Once people apply they&apos;ll appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
