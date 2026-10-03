export interface TimelineItem {
  id: string;
  stageNumber: string;
  title: string;
  date: string;
  description?: string;
  status: "confirmed" | "coming-soon";
}

export const timelineData: TimelineItem[] = [
  {
    id: "stage-01",
    stageNumber: "PHASE 01",
    title: "MISSION ANNOUNCEMENT",
    date: "DATE // TO BE ANNOUNCED",
    description: "Initial signal transmission, website staging launch, and formal announcement of RESURRECTION by Department of CSE, IEM Kolkata.",
    status: "coming-soon",
  },
  {
    id: "stage-02",
    stageNumber: "PHASE 02",
    title: "REGISTRATION PORTAL OPENS",
    date: "DATE // TO BE ANNOUNCED",
    description: "Team registration opens for student developers, builders, and designers nationwide.",
    status: "coming-soon",
  },
  {
    id: "stage-03",
    stageNumber: "PHASE 03",
    title: "PROBLEM STATEMENTS RELEASE",
    date: "DATE // TO BE ANNOUNCED",
    description: "Unlocking classified problem domain briefs and technical challenge guidelines.",
    status: "coming-soon",
  },
  {
    id: "stage-04",
    stageNumber: "PHASE 04",
    title: "HACKATHON COMMENCES",
    date: "DATE // TO BE ANNOUNCED",
    description: "Sprint phase: intense building, mentorship check-ins, and prototype development.",
    status: "coming-soon",
  },
  {
    id: "stage-05",
    stageNumber: "PHASE 05",
    title: "PROJECT EVALUATION",
    date: "DATE // TO BE ANNOUNCED",
    description: "Comprehensive code reviews, live demonstrations, and defense before the Mission Review Board.",
    status: "coming-soon",
  },
  {
    id: "stage-06",
    stageNumber: "PHASE 06",
    title: "RESULTS & VALEDICTORY",
    date: "DATE // TO BE ANNOUNCED",
    description: "Official revelation of mission champions, category awards, and reward disbursement.",
    status: "coming-soon",
  },
];
