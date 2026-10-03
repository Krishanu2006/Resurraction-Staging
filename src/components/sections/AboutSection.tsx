import React, { useEffect, useRef, useState } from 'react';
import {
  Atom,
  BrainCircuit,
  Code2,
  Cpu,
  Orbit,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react';

import '../../styles/about-scroll.css';

interface AboutSectionProps {
  /**
   * Flipped to true the instant the hero begins its fade-out.
   * Triggers the About section's parallel fade-in.
   */
  active?: boolean;
}

/* =========================================================
   HELPERS
   ========================================================= */

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const smootherStep = (value: number) => {
  const t = clamp(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/* =========================================================
   CRITICALLY DAMPED SPRING
   ========================================================= */

class Spring {
  value: number;
  velocity = 0;
  target: number;
  omega = 50;

  constructor(initial = 0) {
    this.value = initial;
    this.target = initial;
  }

  step(target: number, dt: number): number {
    dt = Math.min(dt, 1 / 30);
    this.target = target;

    const omega = this.omega;
    const x = this.value - target;
    const v = this.velocity;

    const e = Math.exp(-omega * dt);
    const newX = (x + (v + omega * x) * dt) * e;
    const newV = (v - (v + omega * x) * dt * omega) * e;

    this.value = target + newX;
    this.velocity = newV;

    if (Math.abs(this.value - target) < 0.00015) {
      this.value = target;
      this.velocity = 0;
    }

    return this.value;
  }
}

/* =========================================================
   SCENE STYLE
   ========================================================= */

const getSceneStyle = (
  progress: number,
  start: number,
  enterEnd: number,
  exitStart: number,
  end: number,
  direction: 'left' | 'right' | 'up' = 'up'
): React.CSSProperties => {
  let opacity = 0;
  let movement = 0;

  if (progress < start) {
    opacity = 0;
    movement = 0;
  } else if (progress >= start && progress < enterEnd) {
    const raw = (progress - start) / (enterEnd - start);
    movement = smootherStep(raw);
    opacity = movement;
  } else if (progress >= enterEnd && progress <= exitStart) {
    opacity = 1;
    movement = 1;
  } else if (progress > exitStart && progress <= end) {
    const raw = (progress - exitStart) / (end - exitStart);
    movement = 1 - smootherStep(raw);
    opacity = movement;
  } else {
    opacity = 0;
    movement = 0;
  }

  let x = 0;
  let y = 0;
  if (direction === 'left') x = -45 * (1 - movement);
  if (direction === 'right') x = 45 * (1 - movement);
  if (direction === 'up') y = 28 * (1 - movement);

  const scale = 0.975 + movement * 0.025;

  const rx = Math.round(x * 1000) / 1000;
  const ry = Math.round(y * 1000) / 1000;
  const rs = Math.round(scale * 10000) / 10000;
  const ro = Math.round(opacity * 1000) / 1000;

  return {
    opacity: ro,
    transform: `translate3d(${rx}px, ${ry}px, 0) scale(${rs})`,
    pointerEvents: ro > 0.5 ? 'auto' : 'none',
  };
};

/* =========================================================
   ABOUT SECTION
   ========================================================= */

export const AboutSection: React.FC<AboutSectionProps> = ({
  active = false,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);

  const targetProgressRef = useRef(0);
  const scrollSpringRef = useRef(new Spring(0));
  const videoSpringRef = useRef(new Spring(0));
  const lastSeekValueRef = useRef(0);
  const lastRenderRef = useRef(0);

  const [, setTick] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  /* =======================================================
     CONSTANTS
     ======================================================= */

  const VIDEO_DURATION = 2;
  const VIDEO_START_TIME = 0;
  const VIDEO_END_TIME = VIDEO_DURATION;

  const videoStartProgress = 0.0;
  const videoEndProgress = 0.35;

  const RENDER_INTERVAL = 32;
  const SEEK_DEAD_ZONE = 0.01;

  /* =======================================================
     SCROLL LISTENER
     ======================================================= */

  useEffect(() => {
    const updateTargetProgress = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionHeight = section.offsetHeight;

      const scrollDistance = Math.max(sectionHeight - viewportHeight, 1);
      const travelled = Math.min(Math.max(-rect.top, 0), scrollDistance);

      targetProgressRef.current = clamp(travelled / scrollDistance);
    };

    updateTargetProgress();

    window.addEventListener('scroll', updateTargetProgress, {
      passive: true,
    });
    window.addEventListener('resize', updateTargetProgress);

    return () => {
      window.removeEventListener('scroll', updateTargetProgress);
      window.removeEventListener('resize', updateTargetProgress);
    };
  }, []);

  /* =======================================================
     MAIN ANIMATION LOOP
     ======================================================= */

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let seekInFlight = false;
    let pendingSeekTime: number | null = null;

    const onSeeked = () => {
      seekInFlight = false;
      if (pendingSeekTime !== null) {
        const t = pendingSeekTime;
        pendingSeekTime = null;
        trySeek(t);
      }
    };

    const trySeek = (time: number) => {
      if (!video) return;
      if (seekInFlight) {
        pendingSeekTime = time;
        return;
      }
      try {
        if (typeof (video as any).fastSeek === 'function') {
          (video as any).fastSeek(time);
        } else {
          video.currentTime = time;
        }
        seekInFlight = true;
      } catch {
        seekInFlight = false;
      }
    };

    video.addEventListener('seeked', onSeeked);

    const loop = (timestamp: number) => {
      const dt = lastTsRef.current
        ? Math.min((timestamp - lastTsRef.current) / 1000, 1 / 30)
        : 1 / 60;
      lastTsRef.current = timestamp;

      const smoothed = scrollSpringRef.current.step(
        targetProgressRef.current,
        dt
      );

      let videoTargetTime = VIDEO_START_TIME;
      if (smoothed >= videoStartProgress && smoothed <= videoEndProgress) {
        const raw =
          (smoothed - videoStartProgress) /
          (videoEndProgress - videoStartProgress);
        videoTargetTime =
          VIDEO_START_TIME +
          (VIDEO_END_TIME - VIDEO_START_TIME) * smootherStep(raw);
      } else if (smoothed > videoEndProgress) {
        videoTargetTime = VIDEO_END_TIME;
      }

      videoSpringRef.current.omega = 28;
      const videoSmoothed = videoSpringRef.current.step(
        videoTargetTime,
        dt
      );

      if (videoReady) {
        const delta = Math.abs(videoSmoothed - lastSeekValueRef.current);
        if (delta >= SEEK_DEAD_ZONE) {
          lastSeekValueRef.current = videoSmoothed;
          trySeek(videoSmoothed);
        }
      }

      if (timestamp - lastRenderRef.current >= RENDER_INTERVAL) {
        lastRenderRef.current = timestamp;
        setTick((t) => (t + 1) % 1_000_000);
      }

      rafRef.current = window.requestAnimationFrame(loop);
    };

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      video.removeEventListener('seeked', onSeeked);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = 0;
    };
  }, [videoReady]);

  /* =======================================================
     VIDEO LOADED
     ======================================================= */

  const handleVideoLoaded = (
    event: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = event.currentTarget;
    video.pause();

    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      setVideoReady(true);
    };
    video.addEventListener('seeked', onSeeked);

    try {
      video.currentTime = VIDEO_START_TIME;
    } catch {
      setVideoReady(true);
    }

    setTimeout(() => setVideoReady(true), 400);
  };

  /* =======================================================
     DERIVED VALUES
     ======================================================= */

  const scrollProgress = scrollSpringRef.current.value;

  let videoDarkness = 0;
  if (scrollProgress > 0.31) {
    const raw = (scrollProgress - 0.31) / 0.14;
    videoDarkness = smootherStep(raw) * 0.55;
  }
  videoDarkness = clamp(videoDarkness, 0, 0.55);

  const greetingStyle = getSceneStyle(
    scrollProgress,
    0.045,
    0.105,
    0.27,
    0.4,
    'up'
  );

  const introStyle = getSceneStyle(
    scrollProgress,
    0.37,
    0.45,
    0.55,
    0.64,
    'left'
  );

  const missionStyle = getSceneStyle(
    scrollProgress,
    0.59,
    0.67,
    0.77,
    0.85,
    'right'
  );

  const detailsStyle = getSceneStyle(
    scrollProgress,
    0.8,
    0.87,
    0.91,
    0.97,
    'left'
  );

  const closingStyle = getSceneStyle(
    scrollProgress,
    0.93,
    0.965,
    0.995,
    1.0,
    'up'
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-scroll-section"
    >
      <div
        className={`about-scroll-sticky${
          active ? ' about-scroll-sticky--active' : ''
        }`}
      >
        {/* VIDEO */}
        <div className="about-video-layer">
          <video
            ref={videoRef}
            className="about-scroll-video"
            src="/assets/about/about-scroll.mp4"
            muted
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            onLoadedMetadata={handleVideoLoaded}
          />

          <div
            className="about-video-darken"
            style={{ opacity: videoDarkness }}
          />

          <div className="about-video-vignette" />
          <div className="about-video-bottom-fade" />
        </div>

        {/* STARS */}
        <div className="about-star about-star-1" />
        <div className="about-star about-star-2" />
        <div className="about-star about-star-3" />

        {/* ORBITS */}
        <div className="about-orbit about-orbit-1" />
        <div className="about-orbit about-orbit-2" />

        {/* TELEMETRY */}
        <div className="about-telemetry">
          <span className="about-status-dot" />
          <span>ROCKY COMMUNICATION LINK</span>
          <span className="about-telemetry-line" />
          <span>
            {Math.round(scrollProgress * 100)
              .toString()
              .padStart(2, '0')}
            %
          </span>
        </div>

        {/* GREETING */}
        <div
          className="about-scene about-greeting-scene"
          style={greetingStyle}
        >
          <div className="about-greeting-card">
            <div className="about-kicker">
              <Sparkles size={15} />
              <span>INCOMING TRANSMISSION</span>
            </div>
            <h2>Hello Earthlings!</h2>
            <h3>I am Rocky.</h3>
            <p>
              I have travelled across the stars to see what you are
              building.
            </p>
          </div>
        </div>

        {/* ABOUT INTRO */}
        <div
          className="about-scene about-intro-scene"
          style={introStyle}
        >
          <div className="about-content-card">
            <div className="about-kicker">
              <Orbit size={16} />
              <span>ABOUT RESURRECTION</span>
            </div>
            <h2 className="about-heading">
              Build beyond
              <br />
              <span>the known.</span>
            </h2>
            <p className="about-description">
              Resurrection is a space where ambitious minds come together
              to transform ideas into technology. It brings together
              developers, designers, innovators and problem-solvers to
              create meaningful solutions to real-world challenges.
            </p>
            <p className="about-description">
              From the first spark of an idea to a working prototype, the
              journey is about experimentation, collaboration and building
              something that can make a difference.
            </p>
            <div className="about-meta">
              <span>MISSION</span>
              <div />
              <strong>RESURRECTION</strong>
            </div>
          </div>
        </div>

        {/* MISSION */}
        <div
          className="about-scene about-mission-scene"
          style={missionStyle}
        >
          <div className="about-content-card">
            <div className="about-kicker">
              <Rocket size={16} />
              <span>THE MISSION</span>
            </div>
            <h2 className="about-heading">
              One mission.
              <br />
              <span>Infinite possibilities.</span>
            </h2>
            <p className="about-description">
              The challenge is not simply to participate. It is to
              explore, experiment and build solutions that push the
              boundaries of what is possible.
            </p>
            <div className="about-feature-grid">
              <div className="about-feature">
                <Code2 size={22} />
                <strong>BUILD</strong>
                <span>Turn ideas into real, working technology.</span>
              </div>
              <div className="about-feature">
                <BrainCircuit size={22} />
                <strong>THINK</strong>
                <span>Question assumptions and solve difficult problems.</span>
              </div>
              <div className="about-feature">
                <Rocket size={22} />
                <strong>LAUNCH</strong>
                <span>Take your solution from concept to execution.</span>
              </div>
            </div>
          </div>
        </div>

        {/* WHY RESURRECTION */}
        <div
          className="about-scene about-details-scene"
          style={detailsStyle}
        >
          <div className="about-details-wrapper">
            <div className="about-content-card about-details-main">
              <div className="about-kicker">
                <Atom size={16} />
                <span>WHY RESURRECTION?</span>
              </div>
              <h2 className="about-heading">
                Ideas deserve
                <br />
                <span>more than gravity.</span>
              </h2>
              <p className="about-description">
                Resurrection encourages you to think beyond conventional
                solutions. Whether you are exploring artificial
                intelligence, software engineering, quantum computing or
                another emerging field, the focus is on learning, creating
                and solving.
              </p>
            </div>

            <div className="about-small-card">
              <Cpu size={23} />
              <strong>TECHNOLOGY</strong>
              <span>
                Explore modern technologies and turn them into practical
                solutions.
              </span>
            </div>

            <div className="about-small-card">
              <Users size={23} />
              <strong>COLLABORATION</strong>
              <span>
                Work with people who bring different perspectives and
                ideas.
              </span>
            </div>
          </div>
        </div>

        {/* CLOSING */}
        <div
          className="about-scene about-closing-scene"
          style={closingStyle}
        >
          <div className="about-closing">
            <span className="about-closing-label">RESURRECTION</span>
            <h2>
              Your next idea
              <br />
              <span>starts here.</span>
            </h2>
            <p>
              Keep exploring.
              <br />
              The mission has only just begun.
            </p>
            <div className="about-continue">
              <div />
              <span>CONTINUE EXPLORING</span>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="about-progress">
          <div
            style={{
              transform: `scaleX(${scrollProgress})`,
            }}
          />
        </div>
      </div>
    </section>
  );
};