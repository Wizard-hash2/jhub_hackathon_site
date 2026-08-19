import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  applicationMembers,
  applications,
  hackathons,
  type Application,
  type ApplicationMember,
  type Hackathon,
} from "@/db/schema";

export interface MemberInput {
  name: string;
  email: string;
}

export interface ApplyInput {
  hackathonSlug: string;
  leadName: string;
  leadEmail: string;
  teamName?: string;
  institution?: string;
  notes?: string;
  /** Additional team members (excluding the lead). Ignored for individual events. */
  members?: MemberInput[];
}

export type ApplyResult =
  | { ok: true; applicationId: number; message: string }
  | { ok: false; error: string; conflictEmails?: string[] };

const normalizeEmail = (e: string) => e.trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Submits an application.
 *
 * Rules enforced here:
 *  - Individual events accept exactly one person (the applicant).
 *  - Team events require the total headcount to fall inside [minTeamSize, maxTeamSize].
 *  - A given email may only appear on ONE application per hackathon. If any member
 *    (or the lead) is already registered for this hackathon, the whole submission is
 *    rejected and the offending emails are returned so the UI can name them.
 */
export async function submitApplication(input: ApplyInput): Promise<ApplyResult> {
  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.slug, input.hackathonSlug))
    .limit(1);

  if (!hackathon) return { ok: false, error: "Hackathon not found." };
  if (hackathon.adminStatus !== "published") {
    return { ok: false, error: "This hackathon is not open for applications." };
  }
  if (hackathon.status === "ended") {
    return { ok: false, error: "Applications for this hackathon have closed." };
  }
  if (hackathon.applicationDeadline) {
    const deadline = new Date(`${hackathon.applicationDeadline}T23:59:59Z`);
    if (Date.now() > deadline.getTime()) {
      return { ok: false, error: "The application deadline for this hackathon has passed." };
    }
  }

  const leadName = input.leadName?.trim();
  const leadEmail = normalizeEmail(input.leadEmail ?? "");
  if (!leadName) return { ok: false, error: "Your full name is required." };
  if (!EMAIL_RE.test(leadEmail)) return { ok: false, error: "A valid email address is required." };

  const isTeam = hackathon.applicationMode === "team";

  // Build the full roster: lead first, then members (team events only).
  const roster: Array<MemberInput & { role: "lead" | "member" }> = [
    { name: leadName, email: leadEmail, role: "lead" },
  ];

  if (isTeam) {
    for (const m of input.members ?? []) {
      const name = m.name?.trim();
      const email = normalizeEmail(m.email ?? "");
      if (!name && !email) continue; // skip blank rows
      if (!name) return { ok: false, error: "Every team member needs a name." };
      if (!EMAIL_RE.test(email)) {
        return { ok: false, error: `"${email || name}" is not a valid email address.` };
      }
      roster.push({ name, email, role: "member" });
    }

    if (!input.teamName?.trim()) {
      return { ok: false, error: "A team name is required for this hackathon." };
    }

    // Duplicates inside the submission itself.
    const seen = new Set<string>();
    for (const p of roster) {
      if (seen.has(p.email)) {
        return { ok: false, error: `${p.email} appears more than once in your team.` };
      }
      seen.add(p.email);
    }

    if (roster.length < hackathon.minTeamSize) {
      return {
        ok: false,
        error: `This hackathon requires at least ${hackathon.minTeamSize} team members (including you). You currently have ${roster.length}.`,
      };
    }
    if (roster.length > hackathon.maxTeamSize) {
      return {
        ok: false,
        error: `This hackathon allows a maximum of ${hackathon.maxTeamSize} team members (including you). You currently have ${roster.length}.`,
      };
    }
  }

  // ---- Redundancy check: is anyone already registered for THIS hackathon? ----
  const emails = roster.map((r) => r.email);
  const existing = await db
    .select({ email: applicationMembers.email })
    .from(applicationMembers)
    .where(
      and(
        eq(applicationMembers.hackathonId, hackathon.id),
        inArray(applicationMembers.email, emails),
      ),
    );

  if (existing.length > 0) {
    const conflictEmails = Array.from(new Set(existing.map((e) => e.email)));
    const isSelf = conflictEmails.includes(leadEmail);
    const list = conflictEmails.join(", ");
    return {
      ok: false,
      conflictEmails,
      error: isTeam
        ? isSelf && conflictEmails.length === 1
          ? `You (${leadEmail}) are already registered for ${hackathon.title} with another team. A person can only join one team per hackathon.`
          : `${list} ${conflictEmails.length === 1 ? "is" : "are"} already registered for ${hackathon.title} with another team. A person can only join one team per hackathon — please remove them and try again.`
        : `${list} has already applied to ${hackathon.title}. Only one application per person is allowed.`,
    };
  }

  // ---- Insert ----
  const [created] = await db
    .insert(applications)
    .values({
      hackathonId: hackathon.id,
      mode: isTeam ? "team" : "individual",
      teamName: isTeam ? input.teamName!.trim() : "",
      leadName,
      leadEmail,
      institution: input.institution?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      status: "submitted",
    })
    .returning();

  try {
    await db.insert(applicationMembers).values(
      roster.map((r) => ({
        applicationId: created.id,
        hackathonId: hackathon.id,
        name: r.name,
        email: r.email,
        role: r.role,
      })),
    );
  } catch {
    // Unique-index violation from a concurrent submission — roll the application back.
    await db.delete(applications).where(eq(applications.id, created.id));
    return {
      ok: false,
      error:
        "One of these people was registered for this hackathon a moment ago. Please review your team and try again.",
    };
  }

  await db
    .update(hackathons)
    .set({ participantCount: hackathon.participantCount + roster.length })
    .where(eq(hackathons.id, hackathon.id));

  return {
    ok: true,
    applicationId: created.id,
    message: isTeam
      ? `Team "${input.teamName!.trim()}" (${roster.length} members) has been registered for ${hackathon.title}.`
      : `You're registered for ${hackathon.title}. A confirmation has been sent to ${leadEmail}.`,
  };
}

export interface ParticipantRow {
  application: Application;
  hackathon: Pick<Hackathon, "id" | "slug" | "title">;
  members: ApplicationMember[];
}

/** Returns applications (with their members) for the admin Participants screen. */
export async function listParticipants(hackathonId?: number): Promise<ParticipantRow[]> {
  const appRows = hackathonId
    ? await db
        .select()
        .from(applications)
        .where(eq(applications.hackathonId, hackathonId))
        .orderBy(desc(applications.createdAt))
    : await db.select().from(applications).orderBy(desc(applications.createdAt));

  if (appRows.length === 0) return [];

  const ids = appRows.map((a) => a.id);
  const memberRows = await db
    .select()
    .from(applicationMembers)
    .where(inArray(applicationMembers.applicationId, ids));

  const hackRows = await db
    .select({ id: hackathons.id, slug: hackathons.slug, title: hackathons.title })
    .from(hackathons);
  const hackMap = new Map(hackRows.map((h) => [h.id, h]));

  return appRows.map((application) => ({
    application,
    hackathon:
      hackMap.get(application.hackathonId) ?? {
        id: application.hackathonId,
        slug: "",
        title: "Unknown",
      },
    members: memberRows
      .filter((m) => m.applicationId === application.id)
      .sort((a, b) => (a.role === "lead" ? -1 : b.role === "lead" ? 1 : a.id - b.id)),
  }));
}

const csvCell = (value: unknown) => {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Flattens participants to one row per person and renders CSV.
 * A UTF-8 BOM is prepended so Excel opens it with correct encoding.
 */
export function participantsToCsv(rows: ParticipantRow[]): string {
  const header = [
    "Hackathon",
    "Application ID",
    "Mode",
    "Team Name",
    "Participant Name",
    "Email",
    "Role",
    "Institution",
    "Status",
    "Submitted At",
  ];
  const lines = [header.join(",")];

  for (const row of rows) {
    for (const member of row.members) {
      lines.push(
        [
          row.hackathon.title,
          row.application.id,
          row.application.mode,
          row.application.teamName,
          member.name,
          member.email,
          member.role,
          row.application.institution,
          row.application.status,
          new Date(row.application.createdAt).toISOString(),
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }

  return "\uFEFF" + lines.join("\r\n");
}
