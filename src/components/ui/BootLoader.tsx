import React, { useEffect, useRef, useState, useCallback } from 'react';

type BootLoaderProps = {
  onComplete: () => void;
};

export const BootLoader: React.FC<BootLoaderProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const isCompletedRef = useRef(false);

  const skipBoot = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    document.body.style.overflow = '';
    onComplete();
  }, [onComplete]);

  // Handle video ready state: initiates video play and start timers
  const handleVideoReady = useCallback(() => {
    setVideoLoaded((prev) => {
      if (prev) return true;
      setLoadProgress(100);
      return true;
    });
  }, []);

  // Monitor buffering progress
  const handleProgress = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (v.readyState >= 4) {
      handleVideoReady();
      return;
    }

    if (v.duration > 0 && v.buffered.length > 0) {
      const bufferedEnd = v.buffered.end(v.buffered.length - 1);
      const pct = Math.min(100, Math.round((bufferedEnd / v.duration) * 100));
      setLoadProgress((cur) => Math.max(cur, pct));
      if (pct >= 98 || bufferedEnd >= v.duration - 0.25) {
        handleVideoReady();
      }
    }
  }, [handleVideoReady]);

  // Keyboard shortcut for skipping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        skipBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skipBoot]);

  // Check if video is already cached on mount
  useEffect(() => {
    const v = videoRef.current;
    if (v && (v.readyState >= 3 || v.readyState === 4)) {
      handleVideoReady();
    }
  }, [handleVideoReady]);

  // Lock scroll during boot
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // ONCE VIDEO IS FULLY LOADED: start playback and run animation sequences
  useEffect(() => {
    if (!videoLoaded) return;

    // Play video smoothly now that it has completely loaded
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }

    // Logo appears after 1.9 seconds of video playback
    const logoTimer = window.setTimeout(() => {
      setLogoVisible(true);
    }, 1900);

    // Start exit fade at 4.0 seconds
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 4000);

    // Complete boot sequence at 4.8 seconds
    const completeTimer = window.setTimeout(() => {
      if (isCompletedRef.current) return;
      isCompletedRef.current = true;
      document.body.style.overflow = '';
      onComplete();
    }, 4800);

    return () => {
      window.clearTimeout(logoTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [videoLoaded, onComplete]);

  return (
    <div
      className={`resurrection-boot ${
        exiting ? 'resurrection-boot--exiting' : ''
      }`}
      onClick={skipBoot}
      role="button"
      tabIndex={0}
      title="Click or press ESC to skip"
    >
      {/* =====================================================
          BUFFERING LOADING HUD (Until Video Is 100% Loaded)
          ===================================================== */}
      {!videoLoaded && (
        <div className="resurrection-boot__buffer-hud" aria-live="polite">
          <div className="resurrection-boot__buffer-radar">
            <div className="resurrection-boot__radar-ring resurrection-boot__radar-ring--1" />
            <div className="resurrection-boot__radar-ring resurrection-boot__radar-ring--2" />
            <div className="resurrection-boot__radar-core" />
          </div>

          <div className="resurrection-boot__buffer-telemetry">
            <div className="resurrection-boot__buffer-title">
              INITIALIZING MISSION FEED
            </div>
            <div className="resurrection-boot__buffer-status">
              BUFFERING STREAM PACKETS [{loadProgress}%]
            </div>
            <div className="resurrection-boot__buffer-subtext">
              AWAITING VIDEO SYNCHRONIZATION BEFORE LAUNCH
            </div>
          </div>

          <div className="resurrection-boot__progress-bar">
            <div
              className="resurrection-boot__progress-fill"
              style={{ width: `${Math.max(6, loadProgress)}%` }}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          BACKGROUND VIDEO
          Plays only after video has loaded completely
          ===================================================== */}
      <video
        ref={videoRef}
        className={`resurrection-boot__video ${
          videoLoaded ? 'resurrection-boot__video--ready' : ''
        }`}
        src="/assets/hero/scroll-space-background.mp4"
        poster="/assets/hero/scroll-space-poster.webp"
        muted
        playsInline
        preload="auto"
        onCanPlayThrough={handleVideoReady}
        onLoadedData={handleProgress}
        onProgress={handleProgress}
        onError={handleVideoReady} // Fail-safe: don't permanently stall if video cannot load
      />

      {/* =====================================================
          VERY SUBTLE DARKENING OVERLAY
          ===================================================== */}
      <div className="resurrection-boot__overlay" />

      {/* =====================================================
          LOGO (ANIMATES IN AFTER VIDEO HAS LOADED & PLAYED)
          ===================================================== */}
      <div
        className={`resurrection-boot__logo ${
          logoVisible ? 'resurrection-boot__logo--visible' : ''
        }`}
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
          background: #02040c;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          isolation: isolate;
          transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
                      visibility 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .resurrection-boot--exiting {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        /* ---------------- Video Preload Buffer HUD ---------------- */
        .resurrection-boot__buffer-hud {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          text-align: center;
          user-select: none;
        }

        .resurrection-boot__buffer-radar {
          position: relative;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .resurrection-boot__radar-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid transparent;
        }

        .resurrection-boot__radar-ring--1 {
          border-top-color: var(--theme-accent, #00d2ff);
          border-right-color: var(--theme-accent, #00d2ff);
          animation: resurrectionRadarSpin 1.6s linear infinite;
        }

        .resurrection-boot__radar-ring--2 {
          inset: 10px;
          border-bottom-color: var(--theme-primary, #3b82f6);
          border-left-color: var(--theme-primary, #3b82f6);
          animation: resurrectionRadarSpinReverse 2.2s linear infinite;
        }

        .resurrection-boot__radar-core {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--theme-accent, #00d2ff);
          box-shadow: 0 0 12px var(--theme-accent, #00d2ff);
          animation: resurrectionPulseCore 1.5s ease-in-out infinite alternate;
        }

        @keyframes resurrectionRadarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes resurrectionRadarSpinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes resurrectionPulseCore {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        .resurrection-boot__buffer-telemetry {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-family: 'Space Mono', monospace;
        }

        .resurrection-boot__buffer-title {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          color: #ffffff;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }

        .resurrection-boot__buffer-status {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          color: var(--theme-accent, #00d2ff);
          font-weight: 600;
        }

        .resurrection-boot__buffer-subtext {
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.45);
          margin-top: 0.2rem;
        }

        .resurrection-boot__progress-bar {
          width: min(320px, 80vw);
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .resurrection-boot__progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--theme-primary, #3b82f6), var(--theme-accent, #00d2ff));
          box-shadow: 0 0 10px var(--theme-accent, #00d2ff);
          transition: width 0.25s ease-out;
        }

        /* ---------------- Background Video ---------------- */
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
          filter: brightness(0.72) contrast(1.04) saturate(1.02);
          pointer-events: none;
        }

        .resurrection-boot__video--ready {
          animation: resurrectionBootVideoIn 1200ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes resurrectionBootVideoIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .resurrection-boot__overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: rgba(1, 4, 10, 0.16);
        }

        /* ---------------- Logo ---------------- */
        .resurrection-boot__logo {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(500px, 76vw);
          transform: translate(-50%, -50%) scale(0.96);
          z-index: 2;
          pointer-events: none;
          opacity: 0;
          filter: blur(12px);
          transition: opacity 1200ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 1200ms cubic-bezier(0.22, 1, 0.36, 1),
                      filter 1200ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .resurrection-boot__logo--visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          filter: blur(0);
        }

        .resurrection-boot__logo img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
          filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.28))
                  drop-shadow(0 0 38px rgba(59, 130, 246, 0.16));
        }

        /* ---------------- Skip Button ---------------- */
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

        @media (max-width: 700px) {
          .resurrection-boot__logo {
            width: min(420px, 82vw);
          }
          .resurrection-boot__skip {
            bottom: 1.25rem;
            right: 1.25rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
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