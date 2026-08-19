export type CommunityPlatform = "discord" | "whatsapp";

export type CommunityIconKey =
  | "code"
  | "brain"
  | "phone"
  | "cloud"
  | "design"
  | "game";

export interface Community {
  slug: string;
  name: string;
  description: string;
  members: string;
  platform: CommunityPlatform;
  icon: CommunityIconKey;
  /** Tailwind background color class for the icon avatar. */
  iconBg: string;
  joinUrl: string;
}

export const communities: Community[] = [
  {
    slug: "web3-builders",
    name: "Web3 Builders",
    description:
      "A hub for blockchain enthusiasts, smart contract developers, and decentralization advocates building the next web.",
    members: "1.2k",
    platform: "discord",
    icon: "code",
    iconBg: "bg-[#3B82F6]",
    joinUrl: "https://discord.gg/jhub-web3-builders",
  },
  {
    slug: "ai-machine-learning",
    name: "AI & Machine Learning",
    description:
      "Exploring deep learning, generative AI, and data science practical applications for African challenges.",
    members: "850",
    platform: "whatsapp",
    icon: "brain",
    iconBg: "bg-[#0F9D74]",
    joinUrl: "https://chat.whatsapp.com/jhub-ai-ml",
  },
  {
    slug: "mobile-dev-ke",
    name: "Mobile Dev Ke",
    description:
      "Flutter, React Native, and native Android/iOS developers crafting seamless mobile experiences.",
    members: "2.1k",
    platform: "discord",
    icon: "phone",
    iconBg: "bg-[#E8607A]",
    joinUrl: "https://discord.gg/jhub-mobile-dev-ke",
  },
  {
    slug: "cloud-native",
    name: "Cloud Native",
    description:
      "DevOps engineers and cloud architects discussing AWS, Azure, GCP, and containerization strategies.",
    members: "540",
    platform: "whatsapp",
    icon: "cloud",
    iconBg: "bg-[#8A7A1E]",
    joinUrl: "https://chat.whatsapp.com/jhub-cloud-native",
  },
  {
    slug: "design-thinkers",
    name: "Design Thinkers",
    description:
      "UI/UX designers, researchers, and product managers focused on human-centered design in tech.",
    members: "1.5k",
    platform: "discord",
    icon: "design",
    iconBg: "bg-[#4B4E57]",
    joinUrl: "https://discord.gg/jhub-design-thinkers",
  },
  {
    slug: "game-dev-guild",
    name: "Game Dev Guild",
    description:
      "Unity, Unreal, and indie game developers creating the next generation of interactive entertainment.",
    members: "920",
    platform: "discord",
    icon: "game",
    iconBg: "bg-[#C0392B]",
    joinUrl: "https://discord.gg/jhub-game-dev-guild",
  },
];
