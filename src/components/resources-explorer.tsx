"use client";

import { useMemo, useState } from "react";
import { RESOURCE_CATEGORIES, type Resource, type ResourceCategory } from "@/data/resources";
import { ResourceCard } from "./resource-card";

const FILTERS: Array<ResourceCategory | "All"> = ["All", ...RESOURCE_CATEGORIES];

export function ResourcesExplorer({ resources }: { resources: Resource[] }) {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(
    () => (active === "All" ? resources : resources.filter((r) => r.category === active)),
    [resources, active],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              active === filter
                ? "bg-info text-white"
                : "bg-panel text-mist hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-edge py-16 text-center">
          <p className="font-display text-lg font-semibold text-white">No resources found</p>
          <p className="mt-1 text-sm text-mist">Try a different category.</p>
        </div>
      )}
    </div>
  );
}
