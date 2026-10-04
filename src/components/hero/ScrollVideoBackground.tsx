import React, { useEffect, useRef, useState } from 'react';
import { type ThemeId } from '../../config/theme';

interface ScrollVideoBackgroundProps {
  progress: number;
  themeId?: ThemeId;
}

type VideoThemeConfig = {
  filter: string;
  overlayGradient: string;
  glowGradient: string;
  vignetteColor: string;
};

const videoThemeConfigs: Record<ThemeId, VideoThemeConfig> = {
  'tau-ceti': {
    // Golden Dune World: warm amber, golden sands, deep bronze
    filter: 'hue-rotate(-52deg) saturate(1.45) brightness(1.04) contrast(1.12)',
    overlayGradient:
      'radial-gradient(ellipse at 50% 34%, rgba(229, 169, 60, 0.44) 0%, rgba(168, 124, 50, 0.24) 42%, transparent 72%)',
    glowGradient:
      'radial-gradient(circle at 50% 28%, rgba(229, 169, 60, 0.28) 0%, rgba(247, 239, 227, 0.08) 25%, transparent 60%)',
    vignetteColor: '#120E0A',
  },
  miller: {
    // Monochrome Tidal World: pure steel gray, silver mist, graphite void (NO blue)
    filter: 'grayscale(1) brightness(1.05) contrast(1.25)',
    overlayGradient:
      'radial-gradient(ellipse at 50% 34%, rgba(226, 232, 240, 0.40) 0%, rgba(100, 116, 139, 0.24) 42%, transparent 72%)',
    glowGradient:
      'radial-gradient(circle at 50% 28%, rgba(241, 245, 249, 0.30) 0%, rgba(148, 163, 184, 0.08) 25%, transparent 60%)',
    vignetteColor: '#0B0D11',
  },
  pandora: {
    // Bioluminescent Ocean & Sky: electric cyan-blue, royal sapphire, deep abyssal indigo
    filter: 'hue-rotate(185deg) saturate(1.85) brightness(1.10) contrast(1.22)',
    overlayGradient:
      'radial-gradient(ellipse at 50% 34%, rgba(0, 210, 255, 0.46) 0%, rgba(29, 78, 216, 0.28) 42%, transparent 72%)',
    glowGradient:
      'radial-gradient(circle at 50% 28%, rgba(0, 240, 255, 0.32) 0%, rgba(207, 242, 255, 0.10) 25%, transparent 60%)',
    vignetteColor: '#040816',
  },
  kepler: {
    // Red Grass World: rich crimson red, ruby embers, vermilion atmosphere
    filter: 'hue-rotate(-122deg) saturate(1.72) brightness(1.06) contrast(1.18)',
    overlayGradient:
      'radial-gradient(ellipse at 50% 34%, rgba(255, 51, 68, 0.48) 0%, rgba(166, 38, 57, 0.26) 42%, transparent 72%)',
    glowGradient:
      'radial-gradient(circle at 50% 28%, rgba(255, 51, 68, 0.28) 0%, rgba(255, 240, 242, 0.08) 25%, transparent 60%)',
    vignetteColor: '#120A0C',
  },
};

export const ScrollVideoBackground: React.FC<ScrollVideoBackgroundProps> = ({
  progress,
  themeId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeId>(themeId || 'tau-ceti');

  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  /*
   * Keep activeTheme synced with themeId prop or root data-theme attribute
   */
  useEffect(() => {
    if (themeId) {
      setActiveTheme(themeId);
      return;
    }

    const root = document.documentElement;
    const currentAttr = (root.getAttribute('data-theme') as ThemeId) || 'tau-ceti';
    setActiveTheme(currentAttr);

    const observer = new MutationObserver(() => {
      const updatedAttr = (root.getAttribute('data-theme') as ThemeId) || 'tau-ceti';
      setActiveTheme(updatedAttr);
    });

    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [themeId]);

  /*
   * Calculate video scrub target based on scroll progress
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTarget = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      const clamped = Math.min(Math.max(progress, 0), 1);
      targetTimeRef.current = clamped * video.duration;
    };

    updateTarget();
  }, [progress]);

  /*
   * Smooth physics-interpolated video scrubbing
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let running = true;

    const animate = () => {
      if (!running) return;

      if (video.readyState >= 2 && video.duration) {
        const target = targetTimeRef.current;
        const current = currentTimeRef.current;
        const difference = target - current;

        // Cinematic smoothing factor
        const smoothing = 0.16;
        const nextTime = current + difference * smoothing;
        currentTimeRef.current = nextTime;

        if (Math.abs(nextTime - video.currentTime) > 0.012) {
          video.currentTime = nextTime;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /*
   * Initialize time on video metadata ready
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initialize = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      const clamped = Math.min(Math.max(progress, 0), 1);
      const initialTime = clamped * video.duration;
      video.currentTime = initialTime;
      currentTimeRef.current = initialTime;
      targetTimeRef.current = initialTime;
    };

    if (video.readyState >= 1) {
      initialize();
    } else {
      video.addEventListener('loadedmetadata', initialize);
    }

    return () => {
      video.removeEventListener('loadedmetadata', initialize);
    };
  }, []);

  const config = videoThemeConfigs[activeTheme] || videoThemeConfigs['tau-ceti'];

  return (
    <div
      aria-hidden="true"
      className="scroll-video-container"
      data-video-theme={activeTheme}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        backgroundColor: 'var(--theme-background)',
        transition: 'background-color 700ms ease',
      }}
    >
      {/* 1. Base Video Layer with theme filter grading */}
      <video
        ref={videoRef}
        src="/assets/hero/scroll-space-background.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          display: 'block',
          filter: config.filter,
          transition: 'filter 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'filter',
        }}
      />

      {/* 2. Atmospheric Color Blend Layer (locks hues to the world's palette) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: config.overlayGradient,
          mixBlendMode: 'color',
          opacity: 0.85,
          transition: 'background 800ms ease, opacity 800ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* 3. Radiant Planet Glow Layer (enhances atmospheric scattering in accent color) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: config.glowGradient,
          mixBlendMode: 'screen',
          opacity: 0.72,
          transition: 'background 800ms ease, opacity 800ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* 4. Cinematic Darkening & Readability Gradient (ensures HeroContent text is crisp and readable) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 5. Edge Vignette blending seamlessly into the active theme background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.3) 70%, var(--theme-background) 100%)`,
          transition: 'background 700ms ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ScrollVideoBackground;