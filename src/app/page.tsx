import { getHackathons } from "@/lib/hackathons";
import { HackathonsExplorer } from "@/components/hackathons-explorer";

export const dynamic = "force-dynamic";

export default async function HackathonsHomePage() {
  const hackathons = await getHackathons();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Hero */}
      <section className="pb-12 pt-14 text-center sm:pb-14 sm:pt-20">
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Empowering African Innovation
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-mist sm:text-lg">
          Join the next generation of builders at JHUB Africa &amp; JKUAT hackathons.
        </p>
      </section>

      <HackathonsExplorer hackathons={hackathons} />
    </div>
  );
}
