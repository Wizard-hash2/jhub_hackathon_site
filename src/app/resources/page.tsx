import type { Metadata } from "next";
import { listResources } from "@/lib/resources-db";
import { ResourcesExplorer } from "@/components/resources-explorer";

export const metadata: Metadata = {
  title: "Resources | JHUB Africa Hackathons",
};

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await listResources();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Resources
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist">
        Guides, templates, and past project showcases to help you build.
      </p>

      <div className="mt-8">
        <ResourcesExplorer resources={resources} />
      </div>
    </div>
  );
}
