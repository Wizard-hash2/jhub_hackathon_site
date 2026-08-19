import { listParticipants, participantsToCsv } from "@/lib/applications";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/participants/export[?hackathonId=1]
 * Streams a UTF-8 CSV (with BOM) that opens directly in Excel / Google Sheets.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("hackathonId");
  const hackathonId = raw ? Number(raw) : undefined;

  const rows = await listParticipants(
    Number.isFinite(hackathonId) ? (hackathonId as number) : undefined,
  );
  const csv = participantsToCsv(rows);

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `jhub-participants${hackathonId ? `-${hackathonId}` : ""}-${stamp}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
