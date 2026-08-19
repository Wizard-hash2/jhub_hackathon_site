import type { ReactElement } from "react";
import type { Community, CommunityIconKey } from "@/data/communities";
import {
  BrainIcon,
  CloudIcon,
  CodeIcon,
  DiscordIcon,
  GameControllerIcon,
  PenToolIcon,
  PeopleIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "./icons";

const ICONS: Record<CommunityIconKey, (props: { className?: string }) => ReactElement> = {
  code: CodeIcon,
  brain: BrainIcon,
  phone: PhoneIcon,
  cloud: CloudIcon,
  design: PenToolIcon,
  game: GameControllerIcon,
};

const PLATFORM_LABEL: Record<Community["platform"], string> = {
  discord: "Join on Discord",
  whatsapp: "Join on WhatsApp",
};

export function CommunityCard({ community }: { community: Community }) {
  const Icon = ICONS[community.icon];
  const PlatformIcon = community.platform === "discord" ? DiscordIcon : WhatsAppIcon;

  return (
    <div className="flex flex-col rounded-2xl border border-edge-soft bg-card p-6">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${community.iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium text-mist">
          <PeopleIcon className="h-3.5 w-3.5 text-fog" />
          {community.members}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-white">
        {community.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{community.description}</p>

      <a
        href={community.joinUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-edge px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-fog hover:bg-panel"
      >
        <PlatformIcon className="h-4 w-4" />
        {PLATFORM_LABEL[community.platform]}
      </a>
    </div>
  );
}
