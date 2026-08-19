export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

export const faqSections: FaqSection[] = [
  {
    title: "Applying to a Hackathon",
    items: [
      {
        question: "How do I register for an upcoming event?",
        answer:
          "You can register for an event by navigating to the \"Hackathons\" tab, selecting an active event, and clicking the \"Register\" button. Make sure your profile is complete before submitting your application.",
      },
      {
        question: "Can I participate if I don't have a team?",
        answer:
          "Absolutely! Many of our events include team-building sessions at the start. You can also use our community channels to find teammates before the hackathon begins.",
      },
      {
        question: "Is there a registration fee?",
        answer:
          "Most JHUB Africa hackathons are completely free to attend, thanks to our sponsors and partners. Any exceptions will be clearly stated on the specific event page.",
      },
    ],
  },
  {
    title: "Eligibility",
    items: [
      {
        question: "Do I need to be a university student?",
        answer:
          "While many events focus on university students, we frequently host open hackathons for recent graduates, professionals, and hobbyists. Check the eligibility section on each event page for details.",
      },
      {
        question: "What if I have no coding experience?",
        answer:
          "Hackathons need diverse skills! We welcome designers, product managers, domain experts, and complete beginners. Many events include beginner-friendly tracks and mentorship.",
      },
      {
        question: "Are international participants allowed?",
        answer:
          "Virtual hackathons are typically open globally. For in-person events in Africa, international participants are welcome but must manage their own travel and accommodation.",
      },
    ],
  },
  {
    title: "Technical Requirements",
    items: [
      {
        question: "What hardware do I need?",
        answer:
          "A personal laptop and charger are required for most events. If specific hardware (like VR headsets or specialized sensors) is needed for a challenge, it will be listed in the event details or provided on-site.",
      },
      {
        question: "Can I use pre-existing code?",
        answer:
          "You can use open-source libraries and frameworks. However, the core logic and main development of your project must be written during the hackathon.",
      },
      {
        question: "How do I submit my project?",
        answer:
          "Projects are usually submitted via Devpost or a similar platform. You will need to provide a link to a public GitHub repository and a short demonstration video.",
      },
    ],
  },
];
