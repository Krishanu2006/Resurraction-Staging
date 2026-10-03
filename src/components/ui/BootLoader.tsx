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

  useEffect(() => {
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
     *
     * Logo remains visible for a short moment,
     * then the entire boot screen fades away.
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

        onComplete();

      }, 4800);


    return () => {

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

  }, [onComplete]);


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
    >

      {/* =====================================================
          BACKGROUND VIDEO
          ===================================================== */}

      <video
        className="
          resurrection-boot__video
        "
        src="/assets/hero/scroll-space-background.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
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
          src="/assets/brand/resurraction-logo.png"
          alt="RESURRACTION"
          draggable={false}
        />

      </div>


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