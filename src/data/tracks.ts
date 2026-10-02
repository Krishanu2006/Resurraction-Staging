export interface Track {
  id: string;
  code: string;
  title: string;
  description: string;
  status: "announced" | "classified" | "coming-soon";
  domainStatus?: string;
}

export const tracksData: Track[] = [
  {
    id: "track-01",
    code: "TRACK 01",
    title: "CLASSIFIED",
    description: "Mission objective and problem domain parameters are sealed pending official telemetry broadcast. Algorithmic architecture briefing will be unlocked upon announcement.",
    status: "classified",
    domainStatus: "SECTOR CLEARANCE REQUIRED",
  },
  {
    id: "track-02",
    code: "TRACK 02",
    title: "CLASSIFIED",
    description: "Mission objective and problem domain parameters are sealed pending official telemetry broadcast. Algorithmic architecture briefing will be unlocked upon announcement.",
    status: "classified",
    domainStatus: "SECTOR CLEARANCE REQUIRED",
  },
  {
    id: "track-03",
    code: "TRACK 03",
    title: "CLASSIFIED",
    description: "Mission objective and problem domain parameters are sealed pending official telemetry broadcast. Algorithmic architecture briefing will be unlocked upon announcement.",
    status: "classified",
    domainStatus: "SECTOR CLEARANCE REQUIRED",
  },
  {
    id: "track-04",
    code: "TRACK 04",
    title: "CLASSIFIED",
    description: "Mission objective and problem domain parameters are sealed pending official telemetry broadcast. Algorithmic architecture briefing will be unlocked upon announcement.",
    status: "classified",
    domainStatus: "SECTOR CLEARANCE REQUIRED",
  },
];
