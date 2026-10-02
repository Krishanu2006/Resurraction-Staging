export interface JuryMember {
  id: string;
  seatCode: string;
  name?: string;
  role?: string;
  organization?: string;
  image?: string;
  status: "confirmed" | "coming-soon";
}

export const juryOverview = {
  heading: "MISSION REVIEW BOARD",
  subheading: "EVALUATION PROTOCOL",
  description: "The evaluation committee will comprise distinguished industry leaders, researchers, and academic faculty from the Department of Computer Science & Engineering, IEM Kolkata and premier partner organizations.",
};

export const juryMembersData: JuryMember[] = [
  {
    id: "jury-seat-01",
    seatCode: "EVAL-SEAT // 01",
    name: "JURY MEMBER",
    role: "ACADEMIC & RESEARCH EVALUATOR",
    organization: "ANNOUNCEMENT PENDING",
    status: "coming-soon",
  },
  {
    id: "jury-seat-02",
    seatCode: "EVAL-SEAT // 02",
    name: "JURY MEMBER",
    role: "INDUSTRY ARCHITECT",
    organization: "ANNOUNCEMENT PENDING",
    status: "coming-soon",
  },
  {
    id: "jury-seat-03",
    seatCode: "EVAL-SEAT // 03",
    name: "JURY MEMBER",
    role: "ENGINEERING DIRECTOR",
    organization: "ANNOUNCEMENT PENDING",
    status: "coming-soon",
  },
  {
    id: "jury-seat-04",
    seatCode: "EVAL-SEAT // 04",
    name: "JURY MEMBER",
    role: "TECHNICAL DOMAIN SPECIALIST",
    organization: "ANNOUNCEMENT PENDING",
    status: "coming-soon",
  },
];
