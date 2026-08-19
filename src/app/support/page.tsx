import type { Metadata } from "next";
import { faqSections } from "@/data/faq";
import { FaqAccordion } from "@/components/faq-accordion";
import { DiscordIcon, MailIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Support | JHUB Africa Hackathons",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight text-rose sm:text-5xl">
        Support
      </h1>
      <p className="mt-3 text-base text-mist">
        Have questions? We&apos;re here to help you navigate your hackathon journey.
      </p>

      <div className="mt-10 space-y-10">
        {faqSections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-lg font-semibold tracking-tight text-sky">
              {section.title}
            </h2>
            <div className="mt-4">
              <FaqAccordion items={section.items} />
            </div>
          </section>
        ))}
      </div>

      <div
        id="contact"
        className="mt-14 flex flex-col items-center rounded-2xl border border-edge-soft bg-panel px-6 py-10 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-2xl">
          👋
        </span>
        <h3 className="mt-4 font-display text-lg font-semibold text-white">
          Still need help?
        </h3>
        <p className="mt-2 max-w-sm text-sm text-mist">
          If you couldn&apos;t find the answer to your question, reach out to our support team or
          ask the community.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:support@jhubafrica.com"
            className="flex items-center justify-center gap-2 rounded-lg bg-rose px-5 py-2.5 text-sm font-semibold text-[#2a1414] transition-opacity hover:opacity-90"
          >
            <MailIcon className="h-4 w-4" />
            Email Support
          </a>
          <a
            href="https://discord.gg/jhub-africa"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-edge px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-fog hover:bg-card"
          >
            <DiscordIcon className="h-4 w-4" />
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
}
