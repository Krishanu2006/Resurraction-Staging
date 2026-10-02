# RESURRACTION — Design Specification

## 1. Design Direction

RESURRACTION is a hackathon organized by the Department of Computer Science & Engineering, Institute of Engineering & Management (IEM), Kolkata.

The staging website takes its visual inspiration from the cosmic/scientific atmosphere of *Project Hail Mary*, with the supplied red cosmic-energy reference as the primary visual direction.

The official RESURRACTION logo establishes the brand identity:
- warm peach/salmon wordmark;
- planetary-ring symbol integrated into the wordmark;
- high contrast against black.

The supplied cosmic reference establishes the environment:
- deep black space;
- crimson/red energy;
- bright white-hot highlights;
- flowing plasma-like forms;
- sparse stars/particles;
- strong horizontal movement.

### Core visual concept

> **A signal emerges from a cosmic phenomenon. RESURRACTION is the mission that follows.**

The supplied cosmic image should be used as the **base visual layer**, with animated overlays creating depth and movement. It should not simply remain a static screenshot.

The design must be inspired by the supplied reference rather than reproducing copyrighted film imagery, scenes, characters, or proprietary interfaces.

---

## 2. Brand Palette

### Primary Brand

| Token | Value | Usage |
|---|---|---|
| `--brand-peach` | `#F2B18A` | Logo, key accents, buttons, highlights |
| `--brand-peach-light` | `#FFD0B3` | Hover/highlight states |
| `--brand-peach-dark` | `#C98262` | Secondary accent |

The exact logo color should remain the source of truth once the final asset is provided in its production format.

### Environment

| Token | Value | Usage |
|---|---|---|
| `--void` | `#000000` | Main background |
| `--space` | `#090305` | Secondary dark surface |
| `--crimson-deep` | `#250006` | Background tint |
| `--crimson` | `#8E0617` | Energy layer |
| `--red-hot` | `#E51B32` | Strong energy |
| `--white-hot` | `#FFF4ED` | Energy cores/highlights |
| `--text` | `#F5F2EF` | Primary text |
| `--muted` | `#9D9692` | Secondary text |

### Color ratio

Approximate visual balance:

- Black / near-black: 65–75%
- Crimson/red: 15–25%
- Peach: 5–10%
- White/hot highlights: used selectively

Peach is the **brand color**. Crimson is the **environmental/energy color**.

Do not turn the whole interface into a red neon UI.

---

## 3. Typography

Recommended:

### Display
- Space Grotesk
- Sora

### Body
- Inter
- Geist
- Manrope

### Technical
- IBM Plex Mono
- JetBrains Mono

Use monospace for:
- system labels;
- mission codes;
- timestamps;
- coordinates;
- status indicators.

Avoid using futuristic display fonts for paragraphs.

---

## 4. Visual Composition

The website should combine three layers.

### Layer 1 — Cosmic Base

The supplied red cosmic image.

Responsibilities:
- establish atmosphere;
- provide organic energy forms;
- create immediate visual identity.

Treatment:
- full-bleed;
- cover;
- darkened edges;
- subtle color grading;
- responsive crop;
- optional slow zoom/pan.

### Layer 2 — Animated Energy

Animated elements over the reference image:
- drifting particles;
- glowing dust;
- thin energy filaments;
- horizontal light streaks;
- soft bloom;
- subtle distortion;
- moving haze;
- occasional bright wave sweep.

Animation must be slow and cinematic.

### Layer 3 — Interface / Branding

On top:
- logo;
- navigation;
- mission labels;
- headings;
- section indicators;
- CTA/status elements.

This layer should remain readable even when the cosmic background becomes bright.

---

## 5. Hero Experience

The hero should be the signature experience of the website.

### Opening sequence

Recommended sequence:

**0.0–1.5 sec**
- black screen;
- tiny particles barely visible.

**1.5–3.0 sec**
- cosmic image fades in;
- red energy becomes visible;
- background slowly moves.

**3.0–4.5 sec**
- animated overlays activate;
- fine particles and energy filaments appear.

**4.5–6.0 sec**
- RESURRACTION logo reveals;
- planetary ring catches a subtle highlight.

**6.0 sec+**
- Coming Soon status appears;
- navigation settles;
- hero enters ambient animation.

The exact timing can be adjusted during implementation.

### Hero hierarchy

```text
[small technical status]

RESURRACTION

[short event statement]

COMING SOON

[scroll / explore indicator]
```

Possible technical copy:

`SIGNAL DETECTED // MISSION INITIALIZING`

`A NEW BUILDING MISSION IS APPROACHING`

These are placeholders and require organizer approval before final publication.

---

## 6. Hero Background Treatment

The supplied image should not be stretched arbitrarily.

Recommended CSS treatment:

```text
background image
    ↓
cover
    ↓
dark edge vignette
    ↓
subtle crimson overlay
    ↓
animated horizontal light layer
    ↓
particle layer
    ↓
content
```

On desktop:
- retain the strongest energy flow near the visual center;
- keep sufficient negative/dark space behind text.

On mobile:
- crop intelligently;
- reduce background brightness behind typography;
- simplify overlay density.

---

## 7. Animation System

### A. Background Motion

Very slow:
- scale: `1.00 → 1.04`;
- horizontal translation;
- occasional vertical drift.

The motion should be almost imperceptible.

### B. Energy Sweep

A blurred light band can periodically travel across the hero.

Properties:
- opacity;
- transform;
- blur;
- width.

Avoid excessive frequency.

### C. Particles

Particles should:
- vary in size;
- move at different speeds;
- have low opacity;
- fade in/out;
- remain sparse.

### D. Logo Reveal

Recommended:
- opacity;
- slight horizontal tracking;
- subtle glow;
- ring highlight.

Do not use aggressive glitch effects unless specifically requested.

### E. Scroll Reveals

Sections can use:
- opacity;
- translateY;
- clip-path;
- subtle scale.

Avoid animating layout dimensions.

---

## 8. Navigation

Desktop:
- logo left;
- section navigation right;
- transparent black gradient/backdrop;
- subtle peach active indicator.

Required links:

- About
- Tracks
- Prizes
- Timeline
- Sponsors
- Jury
- Rules
- FAQ

Mobile:
- logo;
- menu trigger;
- fullscreen/side navigation;
- animated menu transition.

---

## 9. Section Design

Each section should feel like part of the same mission system rather than eight unrelated cards.

### Section Header

Example:

```text
01 / ABOUT
MISSION BRIEFING
```

or:

```text
MISSION 01
ABOUT
```

Use a small technical identifier plus a strong heading.

---

## 10. About

Purpose:
- introduce RESURRACTION;
- identify CSE, IEM Kolkata;
- explain the event concept.

Visual:
- dark section;
- thin red/peach technical lines;
- optional cosmic image fragment.

No unannounced claims.

---

## 11. Tracks

Until tracks are announced:

```text
TRACK 01
CLASSIFIED

TRACK 02
CLASSIFIED

TRACK 03
CLASSIFIED
```

Do not invent track names.

When announced, the same components can display:
- title;
- description;
- problem domain;
- icon/visual.

---

## 12. Prizes

Until officially announced:

```text
PRIZE POOL
TO BE ANNOUNCED
```

Use visual emphasis without fabricating a number.

---

## 13. Timeline

Represent the timeline as a mission sequence.

Example:

```text
ANNOUNCEMENT
      ↓
REGISTRATION
      ↓
PROBLEM STATEMENTS
      ↓
HACKATHON
      ↓
EVALUATION
      ↓
RESULTS
```

Dates remain:

`DATE // TO BE ANNOUNCED`

---

## 14. Sponsors

Visual treatment:
- dark panel;
- subtle border;
- sponsor logos on a clean grid;
- optional tier labels.

Until sponsors are confirmed:

`PARTNERS // INCOMING`

Do not use fictional logos.

---

## 15. Jury

Heading:

`MISSION REVIEW BOARD`

Placeholder state:
- profile silhouette/abstract orbital graphic;
- `JURY MEMBER`;
- `ANNOUNCEMENT PENDING`.

No names should be invented.

---

## 16. Rules

Use expandable or grouped rule blocks.

Possible categories:
- Eligibility
- Team Formation
- Submission
- Code of Conduct
- Judging
- Intellectual Property

Unannounced categories can display `TO BE ANNOUNCED`.

---

## 17. FAQ

Accordion with:
- registration;
- eligibility;
- team size;
- tracks;
- venue;
- dates;
- prizes.

Pending answers should explicitly state that details will be announced.

---

## 18. Footer

Mission-terminal style.

Content:
- RESURRACTION;
- Department of CSE, IEM Kolkata;
- social links when available;
- contact when available;
- `SYSTEM STATUS // ONLINE`.

---

## 19. Responsive Design

### Desktop
- cinematic full-width hero;
- layered animation;
- horizontal navigation;
- asymmetric section compositions.

### Tablet
- reduce decorative density;
- maintain cinematic hero;
- adapt grids.

### Mobile
- intentional recomposition;
- smaller logo;
- simplified cosmic crop;
- lower particle count;
- vertical timeline;
- stacked cards.

---

## 20. Accessibility

Must support:
- semantic HTML;
- keyboard navigation;
- visible focus;
- readable contrast;
- alt text;
- reduced motion.

When `prefers-reduced-motion: reduce` is enabled:
- disable background panning;
- disable particle movement;
- disable large transition effects;
- retain static cosmic background;
- retain content and navigation.

---

## 21. Performance

The supplied image should be optimized before production.

Recommended:
- WebP/AVIF;
- appropriate resolution;
- lazy loading for below-the-fold images;
- no unnecessary video background.

The hero image is above-the-fold and may be preloaded.

Animation should use:
- transform;
- opacity;
- CSS filters where appropriate;
- canvas only if particle density requires it.

---

## 22. Assets Required

Current:
- official RESURRACTION logo;
- supplied cosmic reference image.

Future:
- final tagline;
- official event dates;
- track artwork;
- sponsor logos;
- jury photographs;
- social links;
- contact information;
- official rules.

---

## 23. Design Acceptance Criteria

The design is accepted when:
- the logo is immediately recognizable;
- the supplied cosmic image is clearly part of the hero identity;
- animated overlays create depth rather than replacing the reference;
- the peach brand color remains identifiable;
- crimson is treated as environmental energy;
- all required sections exist;
- pending information is never fabricated;
- mobile remains readable;
- reduced-motion mode remains functional.
