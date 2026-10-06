import React from 'react';
import { eventData } from '../../data/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroContentProps {
  scrollProgress: number;
}

type Direction = 'left' | 'right' | 'up' | 'down';

interface SceneConfig {
  start: number;
  enterEnd: number;
  exitStart: number;
  end: number;
  direction: Direction;
}

/* ============================================================
   HELPERS
   ============================================================ */

const clamp = (
  value: number,
  min = 0,
  max = 1
): number => {
  return Math.min(Math.max(value, min), max);
};

const easeIn = (value: number): number => {
  const t = clamp(value);
  return t * t * t;
};

const easeOut = (value: number): number => {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
};


/* ============================================================
   SCENE TRANSFORMS
   ============================================================ */

const getInitialTransform = (
  direction: Direction
): string => {
  switch (direction) {
    case 'left':
      return 'translate(-50%, -50%) translateX(-80px)';

    case 'right':
      return 'translate(-50%, -50%) translateX(80px)';

    case 'up':
      return 'translate(-50%, -50%) translateY(-80px)';

    case 'down':
      return 'translate(-50%, -50%) translateY(80px)';

    default:
      return 'translate(-50%, -50%)';
  }
};


const getExitTransform = (
  direction: Direction
): string => {
  switch (direction) {
    case 'left':
      return 'translate(-50%, -50%) translateX(80px)';

    case 'right':
      return 'translate(-50%, -50%) translateX(-80px)';

    case 'up':
      return 'translate(-50%, -50%) translateY(-80px)';

    case 'down':
      return 'translate(-50%, -50%) translateY(80px)';

    default:
      return 'translate(-50%, -50%)';
  }
};


/* ============================================================
   DIRECTIONAL SCENE ANIMATION
   ============================================================ */

const animateScene = (
  progress: number,
  config: SceneConfig
) => {
  const {
    start,
    enterEnd,
    exitStart,
    end,
    direction,
  } = config;


  /* ----------------------------------------------------------
     BEFORE
     ---------------------------------------------------------- */

  if (progress <= start) {
    return {
      opacity: 0,
      transform: getInitialTransform(direction),
      blur: 8,
    };
  }


  /* ----------------------------------------------------------
     ENTER
     ---------------------------------------------------------- */

  if (progress < enterEnd) {
    const t = easeOut(
      (progress - start) /
      (enterEnd - start)
    );

    const distance = (1 - t) * 80;

    let transform =
      'translate(-50%, -50%)';

    if (direction === 'left') {
      transform += ` translateX(${-distance}px)`;
    }

    if (direction === 'right') {
      transform += ` translateX(${distance}px)`;
    }

    if (direction === 'up') {
      transform += ` translateY(${-distance}px)`;
    }

    if (direction === 'down') {
      transform += ` translateY(${distance}px)`;
    }

    return {
      opacity: t,
      transform,
      blur: (1 - t) * 8,
    };
  }


  /* ----------------------------------------------------------
     HOLD
     ---------------------------------------------------------- */

  if (progress <= exitStart) {
    return {
      opacity: 1,
      transform: 'translate(-50%, -50%)',
      blur: 0,
    };
  }


  /* ----------------------------------------------------------
     EXIT
     ---------------------------------------------------------- */

  if (progress < end) {
    const t = easeIn(
      (progress - exitStart) /
      (end - exitStart)
    );

    const distance = t * 80;

    let transform =
      'translate(-50%, -50%)';

    if (direction === 'left') {
      transform += ` translateX(${distance}px)`;
    }

    if (direction === 'right') {
      transform += ` translateX(${-distance}px)`;
    }

    if (direction === 'up') {
      transform += ` translateY(${-distance}px)`;
    }

    if (direction === 'down') {
      transform += ` translateY(${distance}px)`;
    }

    return {
      opacity: 1 - t,
      transform,
      blur: t * 8,
    };
  }


  /* ----------------------------------------------------------
     AFTER
     ---------------------------------------------------------- */

  return {
    opacity: 0,
    transform: getExitTransform(direction),
    blur: 8,
  };
};


/* ============================================================
   HERO CONTENT
   ============================================================ */

export const HeroContent: React.FC<HeroContentProps> = ({
  scrollProgress,
}) => {

  const progress = clamp(scrollProgress);


  /* ==========================================================
     1. RESURRECTION LOGO

     0.00 - 0.10
       Fully visible

     0.10 - 0.21
       Fade + move upward

     0.21+
       Gone
     ========================================================== */

  let logoOpacity = 1;
  let logoY = 0;
  let logoScale = 1;
  let logoBlur = 0;


  if (progress <= 0.10) {

    logoOpacity = 1;
    logoY = 0;
    logoScale = 1;
    logoBlur = 0;

  } else if (progress < 0.21) {

    const t = easeIn(
      (progress - 0.10) / 0.11
    );

    logoOpacity = 1 - t;
    logoY = -80 * t;
    logoScale = 1 + 0.06 * t;
    logoBlur = 7 * t;

  } else {

    logoOpacity = 0;
    logoY = -80;
    logoScale = 1.06;
    logoBlur = 8;
  }


  /* ==========================================================
     2. INSTITUTION

     RED TRANSITION + 0.4 SECOND DELAY

     The red scene begins first.

     Then we wait approximately 0.4 seconds.

     Timeline:

       BLACK
         ↓
       RED APPEARS
         ↓
       ~0.4 SECOND DELAY
         ↓
       INSTITUTION ENTERS
         ↓
       INSTITUTION HOLDS
         ↓
       INSTITUTION EXITS

     Normalized timing:

       0.354
         ↓
       ENTER

       0.377
         ↓
       FULLY VISIBLE

       0.467
         ↓
       EXIT

       0.547
         ↓
       GONE

     Direction:
       LEFT → CENTER → RIGHT
     ========================================================== */

  const institution = animateScene(
    progress,
    {
      start: 0.354,
      enterEnd: 0.377,
      exitStart: 0.467,
      end: 0.547,
      direction: 'left',
    }
  );


  /* ==========================================================
     3. COMING SOON

     Institution is completely gone first.

       0.55 → 0.59
       ENTER

       0.59 → 0.68
       HOLD

       0.68 → 0.75
       EXIT

     Direction:
       RIGHT → CENTER → LEFT
     ========================================================== */

  const comingSoon = animateScene(
    progress,
    {
      start: 0.55,
      enterEnd: 0.59,
      exitStart: 0.68,
      end: 0.75,
      direction: 'right',
    }
  );


  /* ==========================================================
     4. TAGLINE

       0.755 → 0.795
       ENTER

       0.795 → 0.87
       HOLD

       0.87 → 0.91
       EXIT

     Direction:
       LEFT → CENTER → RIGHT
     ========================================================== */

  const tagline = animateScene(
    progress,
    {
      start: 0.755,
      enterEnd: 0.795,
      exitStart: 0.87,
      end: 0.91,
      direction: 'left',
    }
  );


  /* ==========================================================
     5. BUTTONS

       0.92 → 0.96
       ENTER

       0.96 → 1.00
       HOLD

     Direction:
       BOTTOM → CENTER
     ========================================================== */

  const actionProgress = clamp(
    (progress - 0.92) / 0.04
  );

  const actionEase = easeOut(
    actionProgress
  );

  const actionsOpacity =
    actionEase;

  const actionsY =
    (1 - actionEase) * 50;

  const actionsScale =
    0.94 + actionEase * 0.06;


  /* ==========================================================
     6. EXPLORE INDICATOR
     ========================================================== */

  const indicatorProgress = clamp(
    (progress - 0.96) / 0.04
  );

  const indicatorOpacity =
    easeOut(indicatorProgress);


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >

      {/* ======================================================
          CENTER ATMOSPHERIC GLOW
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          top: '50%',

          width: 'min(850px, 90vw)',
          height: 'min(850px, 90vw)',

          transform:
            'translate(-50%, -50%)',

          borderRadius: '50%',

          background:
            'radial-gradient(circle, rgba(34, 211, 238, 0.055) 0%, rgba(59, 130, 246, 0.025) 38%, transparent 72%)',

          pointerEvents: 'none',

          zIndex: 1,
        }}
      />


      {/* ======================================================
          1. RESURRECTION LOGO
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          top: '40%',

          width:
            'min(1000px, 90vw)',

          transform: `
            translate(-50%, -50%)
            translateY(${logoY}px)
            scale(${logoScale})
          `,

          opacity:
            logoOpacity,

          filter:
            `blur(${logoBlur}px)`,

          willChange:
            'transform, opacity, filter',

          display:
            'flex',

          justifyContent:
            'center',

          alignItems:
            'center',

          zIndex: 20,
        }}
      >

        <img
          src="/assets/brand/resurraction-logo.webp"
          alt="RESURRACTION — IEM CSE Hackathon"
          width="2048"
          height="169"
          fetchPriority="high"
          decoding="async"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',

            filter:
              'drop-shadow(0 0 18px rgba(34, 211, 238, 0.30)) drop-shadow(0 0 50px rgba(59, 130, 246, 0.20))',
          }}
        />

      </div>


      {/* ======================================================
          2. INSTITUTION

          APPEARS 0.4 SECOND AFTER RED BEGINS
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          top: '50%',

          width:
            'min(900px, 92vw)',

          textAlign: 'center',

          transform:
            institution.transform,

          opacity:
            institution.opacity,

          filter:
            `blur(${institution.blur}px)`,

          willChange:
            'transform, opacity, filter',

          zIndex: 15,
        }}
      >

        <div
          style={{
            marginBottom: '16px',

            fontFamily:
              'var(--font-mono)',

            fontSize:
              'clamp(0.60rem, 1vw, 0.78rem)',

            fontWeight: 500,

            letterSpacing:
              '0.30em',

            textTransform:
              'uppercase',

            color:
              'var(--stellar-cyan)',

            textShadow:
              '0 0 20px rgba(34, 211, 238, 0.30)',
          }}
        >
          {eventData.department}
        </div>


        <div
          style={{
            fontFamily:
              'var(--font-display)',

            fontSize:
              'clamp(1.8rem, 4.3vw, 4rem)',

            fontWeight: 700,

            letterSpacing:
              '-0.04em',

            lineHeight: 1.05,

            color: '#ffffff',

            textShadow:
              '0 2px 18px rgba(0, 0, 0, 0.80), 0 0 35px rgba(255, 255, 255, 0.08)',
          }}
        >
          {eventData.institution}
        </div>

      </div>


      {/* ======================================================
          3. COMING SOON
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          top: '50%',

          width:
            'min(1000px, 92vw)',

          textAlign: 'center',

          transform:
            comingSoon.transform,

          opacity:
            comingSoon.opacity,

          filter:
            `blur(${comingSoon.blur}px)`,

          willChange:
            'transform, opacity, filter',

          zIndex: 15,
        }}
      >

        <Badge
          variant="accent"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] backdrop-blur-md text-[var(--theme-accent)] font-mono text-[11px] tracking-[0.20em] uppercase shadow-[var(--theme-glow)]"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] shadow-[var(--theme-glow)] animate-pulse" />
          NEXT TRANSMISSION
        </Badge>


        <div
          style={{
            marginTop:
              '24px',

            fontFamily:
              'var(--font-display)',

            fontSize:
              'clamp(3rem, 8vw, 7rem)',

            fontWeight: 700,

            lineHeight: 0.95,

            letterSpacing:
              '-0.055em',

            color:
              '#ffffff',

            textShadow:
              '0 0 35px rgba(34, 211, 238, 0.16), 0 0 90px rgba(59, 130, 246, 0.10)',
          }}
        >
          COMING SOON
        </div>

      </div>


      {/* ======================================================
          4. TAGLINE
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          top: '50%',

          width:
            'min(850px, 90vw)',

          textAlign:
            'center',

          transform:
            tagline.transform,

          opacity:
            tagline.opacity,

          filter:
            `blur(${tagline.blur}px)`,

          willChange:
            'transform, opacity, filter',

          zIndex: 15,
        }}
      >

        <p
          style={{
            margin: 0,

            fontFamily:
              'var(--font-display)',

            fontSize:
              'clamp(1.25rem, 3vw, 2.6rem)',

            lineHeight:
              1.3,

            fontWeight: 500,

            letterSpacing:
              '-0.025em',

            color:
              'rgba(248, 251, 255, 0.96)',

            textShadow:
              '0 2px 25px rgba(0, 0, 0, 0.65)',
          }}
        >
          {eventData.tagline}
        </p>

      </div>


      {/* ======================================================
          5. BUTTONS
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          top: '50%',

          width:
            'min(850px, 90vw)',

          display:
            'flex',

          justifyContent:
            'center',

          alignItems:
            'center',

          gap:
            '14px',

          flexWrap:
            'wrap',

          transform: `
            translate(-50%, -50%)
            translateY(${actionsY}px)
            scale(${actionsScale})
          `,

          opacity:
            actionsOpacity,

          willChange:
            'transform, opacity',

          pointerEvents:
            actionsOpacity > 0.1
              ? 'auto'
              : 'none',

          zIndex: 16,
        }}
      >

        <Button
          asChild
          size="lg"
          variant="default"
          className="min-w-[210px] h-12 font-nasalization text-sm tracking-wider uppercase font-bold shadow-[var(--theme-glow)] rounded-xl cursor-pointer"
        >
          <a href="#about">
            Explore RESURRECTION
          </a>
        </Button>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="min-w-[160px] h-12 font-nasalization text-sm tracking-wider uppercase font-semibold rounded-xl border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] text-[var(--theme-text)] hover:border-[var(--theme-accent)] hover:bg-[var(--theme-surface)] backdrop-blur-md cursor-pointer"
        >
          <a href="#tracks">
            View tracks
          </a>
        </Button>

      </div>


      {/* ======================================================
          6. EXPLORE INDICATOR
          ====================================================== */}

      <div
        style={{
          position: 'absolute',

          left: '50%',
          bottom: '7%',

          transform:
            'translateX(-50%)',

          opacity:
            indicatorOpacity,

          display:
            'flex',

          flexDirection:
            'column',

          alignItems:
            'center',

          gap:
            '10px',

          color:
            'rgba(255, 255, 255, 0.62)',

          fontFamily:
            'var(--font-mono)',

          fontSize:
            '0.63rem',

          letterSpacing:
            '0.26em',

          textTransform:
            'uppercase',

          zIndex: 16,
        }}
      >

        <span>
          Explore
        </span>

        <span
          style={{
            fontSize:
              '1.3rem',

            animation:
              'heroArrowFloat 1.8s ease-in-out infinite',
          }}
        >
          ↓
        </span>

      </div>


      {/* ======================================================
          VIGNETTE
          ====================================================== */}

      <div
        style={{
          position:
            'absolute',

          inset: 0,

          pointerEvents:
            'none',

          zIndex: 8,

          background:
            'linear-gradient(to bottom, rgba(3, 5, 16, 0.25), transparent 18%, transparent 78%, rgba(3, 5, 16, 0.42))',
        }}
      />


      {/* ======================================================
          ARROW ANIMATION
          ====================================================== */}

      <style>
        {`
          @keyframes heroArrowFloat {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.55;
            }

            50% {
              transform: translateY(7px);
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

    </div>
  );
};