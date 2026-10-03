export interface FAQItem {
  id: string;
  code: string;
  question: string;
  answer: string;
  category: string;
}

export const faqData: FAQItem[] = [
  {
    id: "faq-01",
    code: "QUERY 01",
    question: "What is RESURRECTION?",
    answer: "RESURRECTION is a flagship technical hackathon organized by the Department of Computer Science & Engineering, Institute of Engineering & Management (IEM), Kolkata. It serves as a mission launchpad for engineering students and developers to construct transformative solutions for high-impact challenges.",
    category: "GENERAL",
  },
  {
    id: "faq-02",
    code: "QUERY 02",
    question: "Who is organizing the hackathon?",
    answer: "The event is organized and hosted by the Department of Computer Science & Engineering, Institute of Engineering & Management (IEM), Kolkata.",
    category: "ORGANIZATION",
  },
  {
    id: "faq-03",
    code: "QUERY 03",
    question: "When will the official dates and timeline be announced?",
    answer: "Specific mission dates, schedule milestones, and sprint durations are currently being finalized. All confirmed dates will be announced on this official staging platform and verified department channels.",
    category: "SCHEDULE",
  },
  {
    id: "faq-04",
    code: "QUERY 04",
    question: "Who is eligible to participate?",
    answer: "Undergraduate and postgraduate students enrolled in recognized universities and colleges will be eligible to register. Comprehensive eligibility rules will be published alongside registration documentation.",
    category: "ELIGIBILITY",
  },
  {
    id: "faq-05",
    code: "QUERY 05",
    question: "What is the expected team size?",
    answer: "Team size requirements (typically squads of 2 to 4 members) are currently being reviewed. Detailed squad composition rules will be published before registration commences.",
    category: "TEAMS",
  },
  {
    id: "faq-06",
    code: "QUERY 06",
    question: "What are the hackathon tracks and problem statements?",
    answer: "All track themes are currently marked CLASSIFIED. Problem domains and specialized challenge briefs will be declassified and unlocked upon the official mission briefing.",
    category: "TRACKS",
  },
  {
    id: "faq-07",
    code: "QUERY 07",
    question: "Where will the hackathon take place?",
    answer: "The hackathon is anchored by IEM Kolkata. Exact venue details (on-campus facilities and virtual telemetry infrastructure) will be announced prior to registration opening.",
    category: "VENUE",
  },
  {
    id: "faq-08",
    code: "QUERY 08",
    question: "What is the prize pool for RESURRECTION?",
    answer: "The complete prize structure—including champion trophies, tier bounties, and partner tracks—is currently in calibration. Official amounts will be revealed during the event announcement.",
    category: "PRIZES",
  },
  {
    id: "faq-09",
    code: "QUERY 09",
    question: "How do I register and is there a registration fee?",
    answer: "Registration links are not yet active as this is the official pre-announcement staging surface. Full registration procedures and fee structures (if any) will be revealed upon mission launch.",
    category: "REGISTRATION",
  },
];
