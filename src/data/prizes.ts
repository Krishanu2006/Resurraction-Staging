export interface Prize {
  id: string;
  title: string;
  tier: string;
  amount?: string;
  description?: string;
  status: "announced" | "coming-soon";
}

export const prizePoolOverview = {
  title: "PRIZE POOL",
  highlight: "TO BE ANNOUNCED",
  status: "coming-soon" as const,
  description: "Total reward bounty, category-specific prizes, and sponsored innovation grants are currently being calibrated with our partners.",
};

export const prizesData: Prize[] = [
  {
    id: "prize-grand",
    title: "MISSION CHAMPION",
    tier: "TIER 01",
    amount: "TO BE ANNOUNCED",
    description: "Awarded to the overall highest scoring mission payload exhibiting outstanding engineering innovation, technical execution, and viability.",
    status: "coming-soon",
  },
  {
    id: "prize-first-runner",
    title: "FIRST RUNNER UP",
    tier: "TIER 02",
    amount: "TO BE ANNOUNCED",
    description: "Awarded to the team delivering stellar system architecture and rapid deployment excellence.",
    status: "coming-soon",
  },
  {
    id: "prize-second-runner",
    title: "SECOND RUNNER UP",
    tier: "TIER 03",
    amount: "TO BE ANNOUNCED",
    description: "Awarded to the team with high algorithmic fidelity and creative domain disruption.",
    status: "coming-soon",
  },
  {
    id: "prize-bounties",
    title: "CATEGORY & SPONSOR BOUNTIES",
    tier: "SPECIAL TRACKS",
    amount: "TO BE ANNOUNCED",
    description: "Specialized bounties dedicated to outstanding solutions across targeted technical domains.",
    status: "coming-soon",
  },
];
