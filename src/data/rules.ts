export interface RuleCategory {
  id: string;
  category: string;
  code: string;
  status: "confirmed" | "coming-soon";
  summary: string;
  rules: {
    id: string;
    title: string;
    description: string;
    status: "confirmed" | "coming-soon";
  }[];
}

export const rulesOverview = {
  heading: "MISSION DIRECTIVES",
  subheading: "OPERATIONAL PROTOCOLS & GOVERNANCE",
  description: "Standard ethical, security, and algorithmic compliance protocols apply to all mission participants. Comprehensive rule handbooks will be distributed upon registration commencement.",
};

export const rulesData: RuleCategory[] = [
  {
    id: "rules-eligibility",
    category: "ELIGIBILITY",
    code: "DIR-01",
    status: "coming-soon",
    summary: "Participant qualifications and academic standing requirements.",
    rules: [
      {
        id: "rule-el-1",
        title: "STUDENT STATUS",
        description: "Open to enrolled undergraduate and postgraduate students from recognized universities and institutions. Official student verification guidelines will be published with registration.",
        status: "coming-soon",
      },
      {
        id: "rule-el-2",
        title: "INSTITUTIONAL CRITERIA",
        description: "DETAILED CRITERIA // TO BE ANNOUNCED.",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "rules-teams",
    category: "TEAM FORMATION",
    code: "DIR-02",
    status: "coming-soon",
    summary: "Squad composition and inter-college team policies.",
    rules: [
      {
        id: "rule-tm-1",
        title: "SQUAD SIZE CONSTRAINTS",
        description: "Official minimum and maximum team limits will be confirmed prior to registration.",
        status: "coming-soon",
      },
      {
        id: "rule-tm-2",
        title: "CROSS-INSTITUTION TEAMS",
        description: "POLICY SPECIFICATION // TO BE ANNOUNCED.",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "rules-submission",
    category: "SUBMISSION",
    code: "DIR-03",
    status: "coming-soon",
    summary: "Deliverable standards, code repository protocols, and project demos.",
    rules: [
      {
        id: "rule-sub-1",
        title: "ORIGINAL CODEBASE",
        description: "All project development must occur during the specified hackathon sprint window. Pre-built production codebases are strictly disqualified.",
        status: "coming-soon",
      },
      {
        id: "rule-sub-2",
        title: "REPOSITORY & TELEMETRY REQUIREMENTS",
        description: "DELIVERABLE FORMAT // TO BE ANNOUNCED.",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "rules-conduct",
    category: "CODE OF CONDUCT",
    code: "DIR-04",
    status: "confirmed",
    summary: "Professional decorum, intellectual integrity, and zero tolerance policies.",
    rules: [
      {
        id: "rule-cd-1",
        title: "INCLUSION & MUTUAL RESPECT",
        description: "RESURRECTION upholds a safe, respectful, and harassment-free experience for everyone, regardless of gender, identity, disability, or background.",
        status: "confirmed",
      },
      {
        id: "rule-cd-2",
        title: "ACADEMIC & ALGORITHMIC INTEGRITY",
        description: "Plagiarism, deceptive presentations, or unauthorized external assistance will result in immediate disqualification.",
        status: "confirmed",
      },
    ],
  },
  {
    id: "rules-judging",
    category: "JUDGING",
    code: "DIR-05",
    status: "coming-soon",
    summary: "Scoring rubrics, technical weightages, and evaluation procedures.",
    rules: [
      {
        id: "rule-jd-1",
        title: "RUBRIC WEIGHTAGES",
        description: "WEIGHTAGE MATRIX // TO BE ANNOUNCED.",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "rules-ip",
    category: "INTELLECTUAL PROPERTY",
    code: "DIR-06",
    status: "confirmed",
    summary: "Ownership rights over prototypes created during the mission.",
    rules: [
      {
        id: "rule-ip-1",
        title: "BUILDER OWNERSHIP",
        description: "Participants retain 100% intellectual property ownership of the code, designs, and hardware developed during RESURRECTION.",
        status: "confirmed",
      },
    ],
  },
];
