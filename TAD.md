# RESURRACTION — Technical Architecture Document

## 1. Architecture

Frontend-only SPA:

```text
Browser
   |
   v
React Application
   |
   +-------------------+
   |                   |
UI Components      Animation Layer
   |                   |
   +---------+---------+
             |
        Static Data
             |
          No API
```

## 2. Recommended Stack

- React
- TypeScript
- Vite
- CSS/SCSS or Tailwind CSS

For this highly customized visual identity, CSS/SCSS is recommended for the core visual system.

### Animation

Use:
- CSS animations/transitions for lightweight effects;
- Framer Motion for React component/scroll transitions if desired;
- Canvas only where particle density or procedural animation requires it.

A 3D engine is unnecessary for the staging version unless a later design decision explicitly requires it.

## 3. Project Structure

```text
resurraction/
├── public/
│   ├── assets/
│   │   ├── brand/
│   │   │   └── resurraction-logo.*
│   │   ├── hero/
│   │   │   └── cosmic-reference.*
│   │   ├── sponsors/
│   │   └── jury/
│   └── favicon/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header
│   │   │   └── Footer
│   │   ├── hero/
│   │   │   ├── MissionIntro
│   │   │   ├── CosmicBackground
│   │   │   ├── EnergyOverlay
│   │   │   ├── ParticleLayer
│   │   │   └── HeroSection
│   │   ├── sections/
│   │   │   ├── AboutSection
│   │   │   ├── TracksSection
│   │   │   ├── PrizesSection
│   │   │   ├── TimelineSection
│   │   │   ├── SponsorsSection
│   │   │   ├── JurySection
│   │   │   ├── RulesSection
│   │   │   └── FAQSection
│   │   └── ui/
│   │       ├── SectionHeading
│   │       ├── StatusBadge
│   │       └── Reveal
│   │
│   ├── data/
│   │   ├── event.ts
│   │   ├── tracks.ts
│   │   ├── prizes.ts
│   │   ├── timeline.ts
│   │   ├── sponsors.ts
│   │   ├── jury.ts
│   │   ├── rules.ts
│   │   └── faq.ts
│   │
│   ├── hooks/
│   │   ├── useReducedMotion.ts
│   │   └── useScrollSection.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   └── animations.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── package.json
└── README.md
```

## 4. Asset Pipeline

### Logo

The official RESURRACTION logo should be stored as a production-ready SVG/PNG.

Use the supplied logo as the visual source of truth.

### Cosmic Reference

The supplied red cosmic image is the hero base layer.

Recommended processing:
1. preserve the original source;
2. create optimized WebP/AVIF version;
3. create desktop and mobile crops if necessary;
4. use CSS overlay/vignette rather than permanently editing brightness into the source.

## 5. Hero Rendering Architecture

```text
Hero
 |
 +-- Background Image
 |
 +-- Dark/Crimson Gradient
 |
 +-- Animated Energy
 |
 +-- Particle Canvas/CSS
 |
 +-- Vignette
 |
 +-- Logo
 |
 +-- Content
```

Layers should use independent positioning so each can be enabled/disabled.

This allows the visual treatment to evolve without replacing the hero component.

## 6. Animation Performance

Avoid:
- frequent React state updates for animation;
- animating width/height/top/left where transform works;
- high particle counts on mobile;
- large blur filters stacked excessively.

Prefer:
- CSS transforms;
- opacity;
- requestAnimationFrame only when procedural animation is necessary;
- GPU-friendly compositing;
- reduced particle counts on low-power/mobile devices.

## 7. Data Architecture

All event content remains local for staging.

Example:

```ts
export const event = {
  name: "RESURRACTION",
  organizer: "Department of CSE, IEM Kolkata",
  status: "coming-soon",
};
```

Future API migration:

```text
Component
    |
Content Service
    |
    +-- Static Data (staging)
    |
    +-- REST API (future)
```

## 8. Deployment

Suitable static deployment targets:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

No server is required for the staging release.

## 9. Security

Even with no backend:
- never commit secrets;
- no private API keys;
- validate future externally supplied content;
- keep dependencies updated.

## 10. Future Architecture

```text
                     CDN / Frontend
                           |
                      API Gateway
                           |
             +-------------+-------------+
             |                           |
        Application API              Auth
             |
     +-------+-------+-------+
     |       |       |       |
   Events  Teams  Submissions Judging
             |
          Database
             |
       Object Storage
             |
       Admin / Jury
```

Potential future modules:
- registration;
- authentication;
- team management;
- problem statements;
- submissions;
- judging;
- leaderboard;
- certificates;
- sponsor management;
- announcements;
- admin dashboard.

## 11. Engineering Rules

1. Separate content from UI.
2. Separate animation from business logic.
3. Preserve stable section IDs.
4. Keep the hero layers independent.
5. Do not hard-code unannounced event information.
6. Support reduced motion.
7. Optimize the supplied image before production.
8. Keep mobile animation lighter than desktop.
9. Avoid unnecessary dependencies.
10. Ensure the site remains functional if all animation is disabled.

## 12. Environment

No environment variables are required initially.

Future examples:

```env
VITE_API_URL=
VITE_REGISTRATION_URL=
VITE_ANALYTICS_ID=
```

Only public values may be exposed through `VITE_*`.

## 13. Acceptance Criteria

- production build succeeds;
- official logo is used;
- supplied cosmic image is integrated;
- animated overlays work;
- hero remains readable;
- all sections work;
- mobile layout works;
- reduced motion works;
- no console errors;
- assets are optimized;
- no secrets are committed;
- static deployment works.
