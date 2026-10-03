export interface EventData {
  name: string;
  organizer: string;
  department: string;
  institution: string;
  tagline: string;
  missionStatement: string;
  phase: string;
  status: "coming-soon";
  technicalStatus: string;
  technicalSubtext: string;
  venue: string;
  edition: string;
}

export const eventData: EventData = {
  name: "RESURRECTION",
  organizer: "Department of Computer Science & Engineering, Institute of Engineering & Management (IEM), Kolkata",
  department: "Department of Computer Science & Engineering",
  institution: "Institute of Engineering & Management (IEM), Kolkata",
  tagline: "A signal emerges from a cosmic phenomenon. RESURRECTION is the mission that follows.",
  missionStatement: "RESURRECTION is a flagship hackathon engineered to unite visionary student builders, engineers, and creators. Guided by scientific rigor and high-stakes problem solving, our mission parameters will push algorithmic and hardware ingenuity.",
  phase: "Pre-announcement / Coming Soon",
  status: "coming-soon",
  technicalStatus: "SIGNAL DETECTED // MISSION INITIALIZING",
  technicalSubtext: "A NEW BUILDING MISSION IS APPROACHING",
  venue: "Institute of Engineering & Management (IEM), Kolkata",
  edition: "2027 // STAGING",
};
