export interface SponsorTier {
  id: string;
  tierName: string;
  badge: string;
  slots: {
    id: string;
    label: string;
    status: "incoming" | "confirmed";
    note: string;
  }[];
}

export const sponsorsOverview = {
  headerBadge: "PARTNERS - INCOMING",
  title: "MISSION PARTNERS & SPONSORS",
  description: "Partnership inquiries and corporate sponsorships are currently undergoing mission clearance. Tier slots will feature leading technology innovators, industry leaders, and developer tools.",
  inquiryNotice: "Interested in supporting the next generation of builders? Official partnership channels will be announced shortly.",
};

export const sponsorTiers: SponsorTier[] = [
  {
    id: "tier-title",
    tierName: "TITLE PARTNER",
    badge: "TIER 01",
    slots: [
      {
        id: "title-slot-1",
        label: "PARTNER - INCOMING",
        status: "incoming",
        note: "CLEARANCE IN PROGRESS",
      },
    ],
  },
  {
    id: "tier-platinum",
    tierName: "PLATINUM PARTNERS",
    badge: "TIER 02",
    slots: [
      {
        id: "plat-slot-1",
        label: "PARTNER - INCOMING",
        status: "incoming",
        note: "CLEARANCE IN PROGRESS",
      },
      {
        id: "plat-slot-2",
        label: "PARTNER - INCOMING",
        status: "incoming",
        note: "CLEARANCE IN PROGRESS",
      },
    ],
  },
  {
    id: "tier-gold",
    tierName: "GOLD & COMMUNITY PARTNERS",
    badge: "TIER 03",
    slots: [
      {
        id: "gold-slot-1",
        label: "PARTNER - INCOMING",
        status: "incoming",
        note: "CLEARANCE IN PROGRESS",
      },
      {
        id: "gold-slot-2",
        label: "PARTNER - INCOMING",
        status: "incoming",
        note: "CLEARANCE IN PROGRESS",
      },
      {
        id: "gold-slot-3",
        label: "PARTNER - INCOMING",
        status: "incoming",
        note: "CLEARANCE IN PROGRESS",
      },
    ],
  },
];
