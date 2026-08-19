import type { Metadata } from "next";
import { communities } from "@/data/communities";
import { CommunityCard } from "@/components/community-card";

export const metadata: Metadata = {
  title: "Communities | JHUB Africa Hackathons",
};

export default function CommunitiesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Communities
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist">
        Connect with builders across JHUB Africa &amp; JKUAT. Find your tribe, collaborate on
        projects, and level up your skills together.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <CommunityCard key={community.slug} community={community} />
        ))}
      </div>
    </div>
  );
}
