export type ResourceCategory =
  | "Getting Started"
  | "Mentor Guides"
  | "Templates & Toolkits"
  | "Past Project Showcases";

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "Getting Started",
  "Mentor Guides",
  "Templates & Toolkits",
  "Past Project Showcases",
];

export type ResourceType = "article" | "video" | "download" | "showcase";

interface BaseResource {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  image: string;
  href: string;
}

export interface ArticleResource extends BaseResource {
  type: "article";
  readTime: string;
}

export interface VideoResource extends BaseResource {
  type: "video";
  duration: string;
}

export interface DownloadResource extends BaseResource {
  type: "download";
  fileInfo: string;
}

export interface ShowcaseResource extends BaseResource {
  type: "showcase";
  tags: string[];
}

export type Resource = ArticleResource | VideoResource | DownloadResource | ShowcaseResource;

export const resources: Resource[] = [
  {
    slug: "ultimate-hackathon-survival-guide",
    title: "The Ultimate Hackathon Survival Guide",
    description:
      "Everything you need to know from ideation to pitching. Master the 48-hour sprint with our comprehensive checklist.",
    category: "Getting Started",
    type: "article",
    image: "/images/resources/hackathon-survival-guide.jpg",
    href: "/resources/ultimate-hackathon-survival-guide",
    readTime: "5 min read",
  },
  {
    slug: "mastering-react-rapid-prototyping",
    title: "Mastering React for Rapid Prototyping",
    description:
      "A deep dive into component-driven development to accelerate your MVP build during the competition.",
    category: "Mentor Guides",
    type: "video",
    image: "/images/resources/mastering-react-video.jpg",
    href: "/resources/mastering-react-rapid-prototyping",
    duration: "45 mins",
  },
  {
    slug: "figma-ui-starter-kit",
    title: "Figma UI Starter Kit v2.0",
    description:
      "Pre-built components, dark/light modes, and typographic scales mapped to our design system. Start designing instantly.",
    category: "Templates & Toolkits",
    type: "download",
    image: "",
    href: "/resources/figma-ui-starter-kit",
    fileInfo: "ZIP File (12MB)",
  },
  {
    slug: "agriconnect-ai-crop-disease-detection",
    title: "AgriConnect: AI Crop Disease Detection",
    description:
      "Winner of the JHUB 2023 Challenge. Learn how Team Alpha utilized edge AI and mobile computer vision to empower local farmers.",
    category: "Past Project Showcases",
    type: "showcase",
    image: "/images/resources/agriconnect-dashboard.jpg",
    href: "/resources/agriconnect-ai-crop-disease-detection",
    tags: ["2023 Winner", "HealthTech"],
  },
  {
    slug: "how-to-leverage-mentors-effectively",
    title: "How to Leverage Mentors Effectively",
    description:
      "Don't get stuck for hours. Learn when and how to ask for help from our expert industry mentors.",
    category: "Mentor Guides",
    type: "article",
    image: "/images/resources/mentors-community.jpg",
    href: "/resources/how-to-leverage-mentors-effectively",
    readTime: "3 min read",
  },
];
