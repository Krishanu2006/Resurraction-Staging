# RESURRACTION — Functional Specification Document

## 1. Purpose

Define the frontend behavior and component contracts for the RESURRACTION staging website.

## 2. Application Type

Frontend-only single-page application.

No backend is required.

## 3. Page Structure

```text
App
├── MissionIntro
├── Header
├── HeroSection
│   ├── CosmicBackground
│   ├── EnergyOverlay
│   ├── ParticleLayer
│   └── HeroContent
├── AboutSection
├── TracksSection
├── PrizesSection
├── TimelineSection
├── SponsorsSection
├── JurySection
├── RulesSection
├── FAQSection
└── Footer
```

## 4. Hero Functional Behavior

### CosmicBackground

Input:
- image source;
- positioning;
- opacity;
- optional mobile crop.

Behavior:
- cover viewport;
- slow zoom/pan;
- dark edge treatment.

### EnergyOverlay

Behavior:
- animated red/crimson light sweeps;
- low-opacity glow;
- optional SVG/canvas filaments;
- must not obscure hero text.

### ParticleLayer

Behavior:
- sparse floating particles;
- random visual variation;
- disabled/reduced under reduced-motion preference.

### HeroContent

Contains:
- technical status;
- RESURRACTION logo;
- event statement;
- Coming Soon;
- scroll indicator.

## 5. Header

Responsibilities:
- logo;
- navigation;
- mobile menu;
- active state;
- smooth scrolling.

Required anchors:

```text
#about
#tracks
#prize
#timeline
#sponsors
#organizers
#rules
#faq
```

## 6. Section Components

### AboutSection

Data:
```ts
type AboutData = {
  title: string;
  description: string;
  organizer: string;
};
```

### TracksSection

```ts
type Track = {
  id: string;
  code: string;
  title: string;
  description: string;
  status: "announced" | "classified" | "coming-soon";
};
```

### PrizesSection

```ts
type Prize = {
  id: string;
  title: string;
  amount?: string;
  description?: string;
  status: "announced" | "coming-soon";
};
```

### TimelineSection

```ts
type TimelineItem = {
  id: string;
  date?: string;
  title: string;
  description?: string;
  status: "confirmed" | "coming-soon";
};
```

### SponsorsSection

```ts
type Sponsor = {
  id: string;
  name: string;
  logo?: string;
  tier?: string;
  status: "confirmed" | "incoming";
};
```

### JurySection

```ts
type JuryMember = {
  id: string;
  name?: string;
  role?: string;
  organization?: string;
  image?: string;
  status: "confirmed" | "coming-soon";
};
```

### RulesSection

```ts
type Rule = {
  id: string;
  title: string;
  description: string;
  status: "confirmed" | "coming-soon";
};
```

### FAQSection

```ts
type FAQItem = {
  id: string;
  question: string;
  answer: string;
};
```

## 7. Content Configuration

Recommended:

```text
src/data/
├── event.ts
├── tracks.ts
├── prizes.ts
├── timeline.ts
├── sponsors.ts
├── jury.ts
├── rules.ts
└── faq.ts
```

This ensures event announcements can replace placeholder data without modifying UI logic.

## 8. Animation Requirements

### Hero
- background image motion;
- energy sweep;
- particles;
- logo reveal;
- subtle ring highlight.

### Sections
- intersection-based reveal;
- opacity/transform;
- optional line-drawing animation.

### Reduced Motion
When enabled:
- static background;
- no particle movement;
- no background panning;
- minimal opacity transitions.

## 9. FAQ

Behavior:
- click/tap opens answer;
- keyboard accessible;
- `aria-expanded` updates;
- focus remains visible.

## 10. Mobile Menu

Behavior:
- opens from menu trigger;
- exposes all section links;
- closes after navigation;
- keyboard accessible.

## 11. Accessibility

Use semantic elements:
- header
- nav
- main
- section
- footer

All interactive controls must be actual buttons/links.

## 12. SEO

Initial title:

`RESURRACTION — CSE Hackathon | IEM Kolkata`

Initial description:

`RESURRACTION — an upcoming hackathon by the Department of CSE, IEM Kolkata.`

Add Open Graph metadata and official social preview artwork when available.

## 13. Fallback Behavior

Missing content:
- use Coming Soon/Announcement Pending;
- never break the page.

Missing image:
- use dark fallback background.

Missing sponsor/jury:
- use neutral placeholder state.

## 14. Testing

Test:
- hero animation;
- image loading;
- navigation;
- mobile menu;
- FAQ;
- responsive layouts;
- reduced motion;
- keyboard navigation;
- missing optional content;
- production build;
- browser console;
- Lighthouse.
