import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listAllForAdmin } from "@/lib/hackathons";

export const metadata: Metadata = { title: "Edit Hackathon | Admin Portal" };
export const dynamic = "force-dynamic";

export default async function EditHackathonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await listAllForAdmin();
  const event = all.find((h) => String(h.id) === id);
  if (!event) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Edit: {event.title}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-mist">
        The edit-event form will be built from the form screenshots.
      </p>
      <Link
        href="/admin/hackathons"
        className="mt-6 inline-flex rounded-lg border border-edge px-4 py-2 text-sm text-mist transition-colors hover:text-white"
      >
        ← Back to Manage Hackathons
      </Link>
    </div>
  );
}
