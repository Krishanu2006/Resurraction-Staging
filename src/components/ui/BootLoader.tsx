import React, { useEffect, useState } from 'react';

type BootLoaderProps = {
  onComplete: () => void;
};

export const BootLoader: React.FC<BootLoaderProps> = ({
  onComplete,
}) => {
  const [logoVisible, setLogoVisible] =
    useState(false);

  const [exiting, setExiting] =
    useState(false);

  const skipBoot = React.useCallback(() => {
    try {
      sessionStorage.setItem('resurrection_boot_seen', 'true');
    } catch {
      // ignore
    }
    document.body.style.overflow = '';
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        skipBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    /*
     * =====================================================
     * LOGO APPEARS AFTER EXACTLY 1.9 SECONDS
     * =====================================================
     */

    const logoTimer =
      window.setTimeout(() => {
        setLogoVisible(true);
      }, 1900);


    /*
     * =====================================================
     * START EXIT
     * =====================================================
     */

    const exitTimer =
      window.setTimeout(() => {
        setExiting(true);
      }, 4000);


    /*
     * =====================================================
     * COMPLETE BOOT
     * =====================================================
     */

    const completeTimer =
      window.setTimeout(() => {
        document.body.style.overflow =
          previousOverflow;
        try {
          sessionStorage.setItem('resurrection_boot_seen', 'true');
        } catch {
          // ignore
        }
        onComplete();
      }, 4800);


    return () => {
      window.removeEventListener('keydown', handleKeyDown);

      window.clearTimeout(
        logoTimer,
      );

      window.clearTimeout(
        exitTimer,
      );

      window.clearTimeout(
        completeTimer,
      );

      document.body.style.overflow =
        previousOverflow;
    };

  }, [onComplete, skipBoot]);


  return (
    <div
      className={`
        resurrection-boot
        ${
          exiting
            ? 'resurrection-boot--exiting'
            : ''
        }
      `}
      onClick={skipBoot}
      role="button"
      tabIndex={0}
      title="Click or press ESC to skip"
    >

      {/* =====================================================
          BACKGROUND VIDEO
          ===================================================== */}

      <video
        className="
          resurrection-boot__video
        "
        src="/assets/hero/scroll-space-background.mp4"
        poster="/assets/hero/scroll-space-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />


      {/* =====================================================
          VERY SUBTLE DARKENING
          ===================================================== */}

      <div
        className="
          resurrection-boot__overlay
        "
      />


      {/* =====================================================
          LOGO
          ===================================================== */}

      <div
        className={`
          resurrection-boot__logo
          ${
            logoVisible
              ? 'resurrection-boot__logo--visible'
              : ''
          }
        `}
      >

        <img
          src="/assets/brand/resurraction-logo.webp"
          alt="RESURRACTION"
          width="500"
          height="41"
          draggable={false}
        />

      </div>

      {/* =====================================================
          SKIP BUTTON
          ===================================================== */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          skipBoot();
        }}
        className="resurrection-boot__skip"
        aria-label="Skip introduction"
      >
        <span>SKIP INTRO</span>
        <kbd>ESC</kbd>
      </button>


      {/* =====================================================
          STYLING
          ===================================================== */}

      <style>{`

        /* =====================================================
           BOOT SCREEN
           ===================================================== */

        .resurrection-boot {
          position: fixed;

          inset: 0;

          width: 100vw;

          height: 100vh;

          height: 100svh;

          z-index: 2147483000;

          overflow: hidden;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            #02040c;

          opacity: 1;

          visibility: visible;

          pointer-events: auto;

          isolation: isolate;

          transition:
            opacity 800ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            ),
            visibility 800ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            );
        }


        /* =====================================================
           BOOT EXIT
           ===================================================== */

        .resurrection-boot--exiting {
          opacity: 0;

          visibility: hidden;

          pointer-events: none;
        }


        /* =====================================================
           BACKGROUND VIDEO
           ===================================================== */

        .resurrection-boot__video {
          position: absolute;

          inset: 0;

          width: 100%;

          height: 100%;

          object-fit: cover;

          object-position: center;

          display: block;

          z-index: 0;

          opacity: 0;

          filter:
            brightness(0.72)
            contrast(1.04)
            saturate(1.02);

          animation:
            resurrectionBootVideoIn
            1200ms
            cubic-bezier(
              0.22,
              1,
              0.36,
              1
            )
            forwards;
        }


        @keyframes resurrectionBootVideoIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }


        /* =====================================================
           VERY SUBTLE VIDEO DARKENING
           ===================================================== */

        .resurrection-boot__overlay {
          position: absolute;

          inset: 0;

          z-index: 1;

          pointer-events: none;

          background:
            rgba(
              1,
              4,
              10,
              0.16
            );
        }


        /* =====================================================
           LOGO
           ===================================================== */

        .resurrection-boot__logo {
          position: absolute;

          left: 50%;

          top: 50%;

          width:
            min(
              500px,
              76vw
            );

          transform:
            translate(
              -50%,
              -50%
            )
            scale(0.92);

          z-index: 5;

          opacity: 0;

          filter:
            blur(14px);

          pointer-events: none;

          transition:
            opacity 1200ms
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            ),
            transform 1400ms
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            ),
            filter 1400ms
            cubic-bezier(
              0.16,
              1,
              0.3,
              1
            );
        }


        /*
         * This class is added at 1.9 seconds.
         */

        .resurrection-boot__logo--visible {
          opacity: 1;

          transform:
            translate(
              -50%,
              -50%
            )
            scale(1);

          filter:
            blur(0);
        }


        .resurrection-boot__logo img {
          display: block;

          width: 100%;

          height: auto;

          object-fit: contain;

          user-select: none;

          -webkit-user-drag: none;

          /*
           * Very subtle logo glow.
           */

          filter:
            drop-shadow(
              0 0 16px
              rgba(
                34,
                211,
                238,
                0.28
              )
            )
            drop-shadow(
              0 0 38px
              rgba(
                59,
                130,
                246,
                0.16
              )
            );
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 700px) {

          .resurrection-boot__logo {
            width:
              min(
                420px,
                82vw
              );
          }

        }

        /* =====================================================
           SKIP BUTTON
           ===================================================== */
        .resurrection-boot__skip {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(10, 15, 30, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resurrection-boot__skip:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
        }

        .resurrection-boot__skip kbd {
          padding: 0.1rem 0.35rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 0.65rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* =====================================================
           REDUCED MOTION
           ===================================================== */

        @media (
          prefers-reduced-motion: reduce
        ) {

          .resurrection-boot__video {
            animation: none;

            opacity: 1;
          }

          .resurrection-boot__logo {
            transition: none;
          }

        }

      `}</style>

    </div>
  );
};

export default BootLoader;