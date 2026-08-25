import Image from "next/image";
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
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-6">
          <Image
            src="/images/green-code-background-hacking-in-progress.webp"
            alt="Hacking in progress with green code on screen"
            width={500}
            height={335}
            priority
            className="h-full w-full rounded-xl border border-edge-soft object-cover shadow-lg"
          />
          <Image
            src="/images/group-people-working-laptops-room-hackathon-event_706399-17237.webp"
            alt="Team collaborating on laptops at a hackathon event"
            width={500}
            height={280}
            priority
            className="h-full w-full rounded-xl border border-edge-soft object-cover shadow-lg"
          />
        </div>
      </section>

      <HackathonsExplorer hackathons={hackathons} />
    </div>
  );
}
