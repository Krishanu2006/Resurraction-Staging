import React, { useEffect, useRef } from 'react';

interface ScrollVideoBackgroundProps {
  progress: number;
}

export const ScrollVideoBackground: React.FC<
  ScrollVideoBackgroundProps
> = ({ progress }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

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

        /*
         * Smoothly move toward the scroll target.
         *
         * Higher value = more responsive
         * Lower value = more cinematic
         */
        const smoothing = 0.14;

        const nextTime =
          current + difference * smoothing;

        currentTimeRef.current = nextTime;

        /*
         * Only seek when the difference is noticeable.
         * This prevents excessive browser seeking.
         */
        if (Math.abs(nextTime - video.currentTime) > 0.015) {
          video.currentTime = nextTime;
        }
      }

      animationFrameRef.current =
        requestAnimationFrame(animate);
    };

    animationFrameRef.current =
      requestAnimationFrame(animate);

    return () => {
      running = false;

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initialize = () => {
      if (!video.duration || !Number.isFinite(video.duration)) {
        return;
      }

      const clamped = Math.min(Math.max(progress, 0), 1);

      const initialTime =
        clamped * video.duration;

      video.currentTime = initialTime;
      currentTimeRef.current = initialTime;
      targetTimeRef.current = initialTime;
    };

    if (video.readyState >= 1) {
      initialize();
    } else {
      video.addEventListener(
        'loadedmetadata',
        initialize
      );
    }

    return () => {
      video.removeEventListener(
        'loadedmetadata',
        initialize
      );
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        backgroundColor: 'var(--theme-background)',
      }}
    >
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
        }}
      />

      {/* Dark cinematic overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.70) 100%)',
        }}
      />

      {/* Side vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.35) 100%)',
        }}
      />
    </div>
  );
};