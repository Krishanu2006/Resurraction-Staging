# RESURRACTION — Product Requirements Document

## 1. Product Overview

**Product:** RESURRACTION Hackathon Staging Website

**Organizer:** Department of Computer Science & Engineering, Institute of Engineering & Management (IEM), Kolkata

**Phase:** Pre-announcement / Coming Soon

**Backend:** None required

**Primary objective:** Establish RESURRACTION as a distinctive upcoming hackathon through a cinematic public-facing website.

## 2. Product Vision

The website should feel like the opening of a scientific mission.

The supplied cosmic reference image and official RESURRACTION logo form the foundation of the visual identity:
- black/cosmic environment;
- crimson energy;
- warm peach branding;
- animated overlays;
- cinematic scientific atmosphere.

The reference image will be used as a **hero visual base**, while animated overlays add movement and depth.

## 3. Target Users

- Students interested in hackathons
- Developers/builders
- Engineering/CSE students
- Faculty
- Potential sponsors
- Jury members
- Event visitors

## 4. User Goals

Visitors should be able to:
- understand that RESURRACTION is an upcoming hackathon;
- identify CSE, IEM Kolkata as the organizer;
- experience the event's visual identity;
- navigate all major information sections;
- understand which details are still pending;
- find future registration information once published.

## 5. Event Goals

The staging website should:
- establish the RESURRACTION brand;
- create anticipation;
- provide one official public information surface;
- support later announcements;
- provide a frontend foundation for the complete hackathon platform.

## 6. In Scope

- Cinematic hero
- Coming Soon state
- Cosmic reference image background
- Animated overlays
- About
- Tracks
- Prizes
- Timeline
- Sponsors
- Jury
- Rules
- FAQ
- Footer
- Responsive navigation
- Scroll animation
- Accessibility
- Static content/data
- Static deployment

## 7. Out of Scope

- Registration
- Login/signup
- Team creation
- Problem statement management
- Submissions
- Judging
- Leaderboard
- Admin dashboard
- Database
- Backend API
- Payment
- Email automation
- Notifications

## 8. Information Architecture

```text
Home
├── Hero / Coming Soon
├── About
├── Tracks
├── Prizes
├── Timeline
├── Sponsors
├── Jury
├── Rules
├── FAQ
└── Footer
```

## 9. Functional Requirements

### FR-01 Hero
Display logo, Coming Soon status, event teaser, cosmic background, animated overlays, and navigation.

### FR-02 Navigation
Provide links to all required sections.

### FR-03 About
Provide event and organizer information.

### FR-04 Tracks
Support multiple track cards and pending states.

### FR-05 Prizes
Support prize information and pending state.

### FR-06 Timeline
Support event stages and dates.

### FR-07 Sponsors
Support sponsor logos and tiers.

### FR-08 Jury
Support jury profiles.

### FR-09 Rules
Support categorized rules.

### FR-10 FAQ
Support expandable FAQs.

### FR-11 Responsive UI
Support mobile, tablet, and desktop.

### FR-12 Reduced Motion
Respect system reduced-motion preferences.

## 10. Content Governance

### Confirmed
- Event name: RESURRACTION
- Organizer: Department of CSE, IEM Kolkata
- Official logo
- Cosmic visual direction/reference
- Coming Soon state

### Pending
- dates
- tracks
- prize amounts
- sponsors
- jury
- detailed rules
- registration
- venue
- contact details

Pending information must never be fabricated.

## 11. Future Evolution

The site may later evolve into:

```text
Public Website
├── Registration
├── Authentication
├── Team Management
├── Problem Statements
├── Submissions
├── Judging
├── Announcements
└── Admin Dashboard
```

## 12. Success Criteria

- Immediate recognition of RESURRACTION.
- Distinctive cinematic visual experience.
- Supplied cosmic image integrated into the hero.
- Animated overlays provide depth.
- All required sections are available.
- Pending information is clearly marked.
- Desktop and mobile experiences work.
- Organizers can replace content without rewriting components.
- Static deployment works without a backend.
