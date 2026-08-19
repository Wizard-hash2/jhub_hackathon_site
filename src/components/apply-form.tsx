"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Hackathon } from "@/db/schema";
import { applyAction } from "@/app/hackathons/[slug]/apply/actions";
import { CoHostBadge } from "./co-host-badge";
import { PlusIcon, TrashIcon, UsersIcon } from "./icons";

const inputCls =
  "w-full rounded-lg border border-edge bg-panel px-3.5 py-2.5 text-sm text-white placeholder:text-fog focus:border-mint/60 focus:outline-none";

interface Row {
  name: string;
  email: string;
}

export function ApplyForm({ hackathon }: { hackathon: Hackathon }) {
  const isTeam = hackathon.applicationMode === "team";
  const minSize = hackathon.minTeamSize;
  const maxSize = hackathon.maxTeamSize;

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [institution, setInstitution] = useState("");
  const [notes, setNotes] = useState("");
  // Lead counts as 1, so pre-fill enough blank rows to reach the minimum.
  const [members, setMembers] = useState<Row[]>(
    isTeam ? Array.from({ length: Math.max(minSize - 1, 1) }, () => ({ name: "", email: "" })) : [],
  );

  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  const headcount = 1 + members.filter((m) => m.name.trim() || m.email.trim()).length;

  function updateMember(i: number, key: keyof Row, value: string) {
    setMembers((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  }

  function submit() {
    setError(null);
    setConflicts([]);
    start(async () => {
      const result = await applyAction({
        hackathonSlug: hackathon.slug,
        leadName,
        leadEmail,
        teamName: isTeam ? teamName : undefined,
        institution,
        notes,
        members: isTeam ? members : [],
      });
      if (result.ok) {
        setSuccess(result.message);
      } else {
        setError(result.error);
        setConflicts(result.conflictEmails ?? []);
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-mint/40 bg-mint/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint/15 text-2xl">
          ✅
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-white">
          Application submitted
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist">{success}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/hackathons/${hackathon.slug}`}
            className="rounded-lg border border-edge px-5 py-2.5 text-sm text-mist hover:text-white"
          >
            Back to event
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-[#062a21]"
          >
            Browse more hackathons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-edge-soft bg-panel px-5 py-4">
        <UsersIcon className="h-5 w-5 text-mint" />
        <p className="text-sm text-mist">
          {isTeam ? (
            <>
              This is a <span className="font-semibold text-white">team hackathon</span>. Teams must
              have between{" "}
              <span className="font-semibold text-white">
                {minSize} and {maxSize} members
              </span>{" "}
              (including you, the team lead).
            </>
          ) : (
            <>
              This is an <span className="font-semibold text-white">individual hackathon</span>. You
              are applying for yourself only.
            </>
          )}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#c0392b]/50 bg-[#c0392b]/10 px-5 py-4 text-sm text-[#ff9b8b]"
        >
          <p className="font-medium">Application rejected</p>
          <p className="mt-1">{error}</p>
          {conflicts.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs">
              {conflicts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Lead details */}
      <section className="rounded-2xl border border-edge-soft bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-white">
          {isTeam ? "Team lead details" : "Your details"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="leadName" className="mb-1.5 block text-sm text-mist">
              Full name <span className="text-rose">*</span>
            </label>
            <input
              id="leadName"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="e.g. Amina Otieno"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="leadEmail" className="mb-1.5 block text-sm text-mist">
              Email address <span className="text-rose">*</span>
            </label>
            <input
              id="leadEmail"
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>
          {isTeam && (
            <div>
              <label htmlFor="teamName" className="mb-1.5 block text-sm text-mist">
                Team name <span className="text-rose">*</span>
              </label>
              <input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Team Alpha"
                className={inputCls}
              />
            </div>
          )}
          <div>
            <label htmlFor="institution" className="mb-1.5 block text-sm text-mist">
              Institution / company
            </label>
            <input
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. JKUAT"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Members */}
      {isTeam && (
        <section className="rounded-2xl border border-edge-soft bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Team members</h2>
              <p className="mt-1 text-xs text-fog">
                Add everyone except yourself — you are already counted as the lead.
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                headcount >= minSize && headcount <= maxSize
                  ? "border-mint/50 bg-mint/10 text-mint"
                  : "border-[#e0b84a]/50 bg-[#e0b84a]/10 text-[#e0b84a]"
              }`}
            >
              {headcount} / {maxSize} members
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {members.map((m, i) => (
              <div key={i} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs text-fog">Member {i + 2} name</label>
                  <input
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs text-fog">Email address</label>
                  <input
                    type="email"
                    value={m.email}
                    onChange={(e) => updateMember(i, "email", e.target.value)}
                    placeholder="member@example.com"
                    className={inputCls}
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Remove member ${i + 2}`}
                  onClick={() => setMembers((rows) => rows.filter((_, idx) => idx !== i))}
                  className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-fog transition-colors hover:bg-[#c0392b]/20 hover:text-[#ff6b5b]"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {headcount < maxSize && (
            <button
              type="button"
              onClick={() => setMembers((rows) => [...rows, { name: "", email: "" }])}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-mint hover:underline"
            >
              <PlusIcon className="h-4 w-4" /> Add another member
            </button>
          )}
        </section>
      )}

      {/* Notes */}
      <section className="rounded-2xl border border-edge-soft bg-card p-6">
        <label htmlFor="notes" className="mb-1.5 block text-sm text-mist">
          Anything else we should know?
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Project idea, accessibility needs, dietary requirements…"
          className={`${inputCls} resize-y`}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <CoHostBadge />
        <div className="flex gap-3">
          <Link
            href={`/hackathons/${hackathon.slug}`}
            className="rounded-lg border border-edge px-5 py-2.5 text-sm text-mist hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-lg bg-mint px-6 py-2.5 text-sm font-semibold text-[#062a21] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </div>
    </div>
  );
}
