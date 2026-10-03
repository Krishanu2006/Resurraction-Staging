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
  active?: boolean;
}


/* =========================================================
   HELPERS
   ========================================================= */

const clamp = (
  value: number,
  min = 0,
  max = 1
) => {
  return Math.min(
    Math.max(value, min),
    max
  );
};


const smootherStep = (
  value: number
) => {
  const t = clamp(value);

  return (
    t *
    t *
    t *
    (t * (t * 6 - 15) + 10)
  );
};


/* =========================================================
   CRITICALLY DAMPED SPRING
   ========================================================= */

class Spring {
  value: number;

  velocity = 0;

  target: number;

  omega: number;

  constructor(
    initial = 0,
    omega = 50
  ) {
    this.value = initial;
    this.target = initial;
    this.omega = omega;
  }

  step(
    target: number,
    dt: number
  ): number {
    dt = Math.min(
      dt,
      1 / 30
    );

    this.target = target;

    const omega =
      this.omega;

    const x =
      this.value -
      target;

    const v =
      this.velocity;

    const e =
      Math.exp(
        -omega * dt
      );

    const newX =
      (
        x +
        (
          v +
          omega * x
        ) *
          dt
      ) *
      e;

    const newV =
      (
        v -
        (
          v +
          omega * x
        ) *
          dt *
          omega
      ) *
      e;

    this.value =
      target +
      newX;

    this.velocity =
      newV;

    if (
      Math.abs(
        this.value -
        target
      ) < 0.00005
    ) {
      this.value =
        target;

      this.velocity =
        0;
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
  direction:
    | 'left'
    | 'right'
    | 'up' = 'up'
): React.CSSProperties => {

  let opacity = 0;

  let movement = 0;

  if (
    progress <
    start
  ) {
    opacity = 0;
    movement = 0;
  }

  else if (
    progress >= start &&
    progress < enterEnd
  ) {
    const raw =
      (
        progress -
        start
      ) /
      (
        enterEnd -
        start
      );

    movement =
      smootherStep(raw);

    opacity =
      movement;
  }

  else if (
    progress >= enterEnd &&
    progress <= exitStart
  ) {
    opacity = 1;
    movement = 1;
  }

  else if (
    progress > exitStart &&
    progress <= end
  ) {
    const raw =
      (
        progress -
        exitStart
      ) /
      (
        end -
        exitStart
      );

    movement =
      1 -
      smootherStep(raw);

    opacity =
      movement;
  }

  else {
    opacity = 0;
    movement = 0;
  }


  let x = 0;

  let y = 0;


  if (
    direction === 'left'
  ) {
    x =
      -45 *
      (1 - movement);
  }


  if (
    direction === 'right'
  ) {
    x =
      45 *
      (1 - movement);
  }


  if (
    direction === 'up'
  ) {
    y =
      28 *
      (1 - movement);
  }


  const scale =
    0.975 +
    movement * 0.025;


  return {
    opacity,

    transform:
      `translate3d(${x}px, ${y}px, 0) scale(${scale})`,

    pointerEvents:
      opacity > 0.5
        ? 'auto'
        : 'none',
  };
};


/* =========================================================
   ROCKY WAYPOINTS
   ========================================================= */

type RockyWaypoint = {
  x: number;
  y: number;
  scale: number;
};


type RockyTargets = {
  offscreen: RockyWaypoint;
  intro: RockyWaypoint;
  mission: RockyWaypoint;
  details: RockyWaypoint;
  exit: RockyWaypoint;
};


const DEFAULT_TARGETS:
  RockyTargets = {

  offscreen: {
    x: 120,
    y: 28,
    scale: 0.82,
  },

  intro: {
    x: 40,
    y: 28,
    scale: 0.82,
  },

  mission: {
    x: 89.3026,
    y: 30.1212,
    scale: 0.78,
  },

  details: {
    x: 76,
    y: 24,
    scale: 0.74,
  },

  exit: {
    x: 120,
    y: 24,
    scale: 0.74,
  },
};


/* =========================================================
   ROCKY BLEND
   ========================================================= */

type RockyBlend = {
  from: keyof RockyTargets;
  to: keyof RockyTargets;
  t: number;
};


const getRockyBlend = (
  progress: number
): RockyBlend => {

  if (
    progress <
    0.395
  ) {
    return {
      from:
        'offscreen',

      to:
        'offscreen',

      t: 0,
    };
  }


  if (
    progress <
    0.46
  ) {
    const raw =
      (
        progress -
        0.395
      ) /
      0.065;

    return {
      from:
        'offscreen',

      to:
        'intro',

      t:
        smootherStep(raw),
    };
  }


  if (
    progress <
    0.555
  ) {
    return {
      from:
        'intro',

      to:
        'intro',

      t: 1,
    };
  }


  if (
    progress <
    0.62
  ) {
    const raw =
      (
        progress -
        0.555
      ) /
      0.065;

    return {
      from:
        'intro',

      to:
        'mission',

      t:
        smootherStep(raw),
    };
  }


  if (
    progress <
    0.775
  ) {
    return {
      from:
        'mission',

      to:
        'mission',

      t: 1,
    };
  }


  if (
    progress <
    0.84
  ) {
    const raw =
      (
        progress -
        0.775
      ) /
      0.065;

    return {
      from:
        'mission',

      to:
        'details',

      t:
        smootherStep(raw),
    };
  }


  if (
    progress <
    0.9
  ) {
    return {
      from:
        'details',

      to:
        'details',

      t: 1,
    };
  }


  if (
    progress <
    0.96
  ) {
    const raw =
      (
        progress -
        0.9
      ) /
      0.06;

    return {
      from:
        'details',

      to:
        'exit',

      t:
        smootherStep(raw),
    };
  }


  return {
    from:
      'exit',

    to:
      'exit',

    t: 1,
  };
};


/* =========================================================
   ABOUT SECTION
   ========================================================= */

export const AboutSection:
  React.FC<AboutSectionProps> = ({
    active = false,
  }) => {

  const sectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const rafRef =
    useRef<number | null>(
      null
    );

  const lastTsRef =
    useRef(0);

  const targetProgressRef =
    useRef(0);

  const scrollSpringRef =
    useRef(
      new Spring(
        0,
        22
      )
    );

  const videoSpringRef =
    useRef(
      new Spring(
        0,
        28
      )
    );

  const rockyXSpringRef =
    useRef(
      new Spring(
        DEFAULT_TARGETS
          .offscreen.x,
        14
      )
    );

  const rockyYSpringRef =
    useRef(
      new Spring(
        DEFAULT_TARGETS
          .offscreen.y,
        14
      )
    );

  const rockyScaleSpringRef =
    useRef(
      new Spring(
        DEFAULT_TARGETS
          .offscreen.scale,
        14
      )
    );

  const rockyBlendProgressRef =
    useRef(0);

  const lastSeekValueRef =
    useRef(0);

  const lastRenderRef =
    useRef(0);

  const oscillationTimeRef =
    useRef(0);

  const [, setTick] =
    useState(0);

  const [
    videoReady,
    setVideoReady,
  ] = useState(false);


  const rockyRenderRef =
    useRef({
      x:
        DEFAULT_TARGETS
          .offscreen.x,

      y:
        DEFAULT_TARGETS
          .offscreen.y,

      scale:
        DEFAULT_TARGETS
          .offscreen.scale,

      opacity: 0,
    });


  /* =======================================================
     VIDEO CONSTANTS
     ======================================================= */

  const VIDEO_DURATION =
    2;

  const VIDEO_START_TIME =
    0;

  const VIDEO_END_TIME =
    VIDEO_DURATION;

  const videoStartProgress =
    0.0;

  const videoEndProgress =
    0.35;

  const RENDER_INTERVAL =
    16;

  const SEEK_DEAD_ZONE =
    0.01;


  /* =======================================================
     ROCKY OSCILLATION
     ======================================================= */

  const OSCILLATION_AMPLITUDE =
    6;

  const OSCILLATION_SPEED =
    4.5;


  /* =======================================================
     SCROLL
     ======================================================= */

  useEffect(() => {

    const updateTargetProgress =
      () => {

        const section =
          sectionRef.current;

        if (!section) {
          return;
        }

        const rect =
          section.getBoundingClientRect();

        const viewportHeight =
          window.innerHeight;

        const sectionHeight =
          section.offsetHeight;

        const scrollDistance =
          Math.max(
            sectionHeight -
            viewportHeight,
            1
          );

        const travelled =
          Math.min(
            Math.max(
              -rect.top,
              0
            ),
            scrollDistance
          );

        targetProgressRef.current =
          clamp(
            travelled /
            scrollDistance
          );
      };


    updateTargetProgress();


    window.addEventListener(
      'scroll',
      updateTargetProgress,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'resize',
      updateTargetProgress
    );


    return () => {

      window.removeEventListener(
        'scroll',
        updateTargetProgress
      );

      window.removeEventListener(
        'resize',
        updateTargetProgress
      );
    };

  }, []);


  /* =======================================================
     MAIN ANIMATION LOOP
     ======================================================= */

  useEffect(() => {

    const video =
      videoRef.current;

    if (!video) {
      return;
    }


    let seekInFlight =
      false;

    let pendingSeekTime:
      number | null =
      null;


    const trySeek = (
      time: number
    ) => {

      if (!video) {
        return;
      }


      if (seekInFlight) {
        pendingSeekTime =
          time;

        return;
      }


      try {

        if (
          typeof
          (video as any)
            .fastSeek ===
          'function'
        ) {

          (
            video as any
          ).fastSeek(
            time
          );

        } else {

          video.currentTime =
            time;
        }

        seekInFlight =
          true;

      } catch {

        seekInFlight =
          false;
      }
    };


    const onSeeked = () => {

      seekInFlight =
        false;

      if (
        pendingSeekTime !==
        null
      ) {

        const next =
          pendingSeekTime;

        pendingSeekTime =
          null;

        trySeek(next);
      }
    };


    video.addEventListener(
      'seeked',
      onSeeked
    );


    const loop = (
      timestamp: number
    ) => {

      const dt =
        lastTsRef.current
          ? Math.min(
              (
                timestamp -
                lastTsRef.current
              ) / 1000,
              1 / 30
            )
          : 1 / 60;

      lastTsRef.current =
        timestamp;


      /* SCROLL */

      const smoothed =
        scrollSpringRef.current.step(
          targetProgressRef.current,
          dt
        );


      /* VIDEO */

      let videoTargetTime =
        VIDEO_START_TIME;


      if (
        smoothed >=
          videoStartProgress &&
        smoothed <=
          videoEndProgress
      ) {

        const raw =
          (
            smoothed -
            videoStartProgress
          ) /
          (
            videoEndProgress -
            videoStartProgress
          );

        videoTargetTime =
          VIDEO_START_TIME +
          (
            VIDEO_END_TIME -
            VIDEO_START_TIME
          ) *
          smootherStep(raw);

      }

      else if (
        smoothed >
        videoEndProgress
      ) {

        videoTargetTime =
          VIDEO_END_TIME;
      }


      const videoSmoothed =
        videoSpringRef.current.step(
          videoTargetTime,
          dt
        );


      if (videoReady) {

        const delta =
          Math.abs(
            videoSmoothed -
            lastSeekValueRef.current
          );


        if (
          delta >=
          SEEK_DEAD_ZONE
        ) {

          lastSeekValueRef.current =
            videoSmoothed;

          trySeek(
            videoSmoothed
          );
        }
      }


      /* ROCKY */

      const blendDelta =
        smoothed -
        rockyBlendProgressRef.current;


      rockyBlendProgressRef.current +=
        blendDelta *
        (
          1 -
          Math.exp(
            -18 * dt
          )
        );


      const blend =
        getRockyBlend(
          rockyBlendProgressRef.current
        );


      const from =
        DEFAULT_TARGETS[
          blend.from
        ];

      const to =
        DEFAULT_TARGETS[
          blend.to
        ];


      const targetX =
        from.x +
        (
          to.x -
          from.x
        ) *
        blend.t;


      const targetY =
        from.y +
        (
          to.y -
          from.y
        ) *
        blend.t;


      const targetScale =
        from.scale +
        (
          to.scale -
          from.scale
        ) *
        blend.t;


      const rockyX =
        rockyXSpringRef.current.step(
          targetX,
          dt
        );

      const rockyY =
        rockyYSpringRef.current.step(
          targetY,
          dt
        );

      const rockyScale =
        rockyScaleSpringRef.current.step(
          targetScale,
          dt
        );


      /* ROCKY HOP */

      let hop = 0;


      if (
        blend.from !==
          blend.to &&
        blend.t > 0 &&
        blend.t < 1
      ) {

        const hopAmplitude =
          blend.from ===
            'offscreen' ||
          blend.to ===
            'mission'
            ? 6
            : 8;


        hop =
          Math.sin(
            blend.t *
            Math.PI
          ) *
          hopAmplitude;
      }


      /* ROCKY FLOAT */

      oscillationTimeRef.current +=
        dt *
        OSCILLATION_SPEED;


      const oscillationPx =
        Math.sin(
          oscillationTimeRef.current
        ) *
        OSCILLATION_AMPLITUDE;


      const oscillationPercent =
        (
          oscillationPx /
          window.innerHeight
        ) *
        100;


      /* ROCKY FADE */

      const fadeIn =
        smootherStep(
          clamp(
            (
              smoothed -
              0.395
            ) /
            0.05
          )
        );


      const fadeOut =
        1 -
        smootherStep(
          clamp(
            (
              smoothed -
              0.91
            ) /
            0.05
          )
        );


      const opacity =
        fadeIn *
        fadeOut;


      rockyRenderRef.current.x =
        rockyX;


      rockyRenderRef.current.y =
        rockyY -
        (
          hop /
          window.innerHeight
        ) *
        100 +
        oscillationPercent;


      rockyRenderRef.current.scale =
        rockyScale;


      rockyRenderRef.current.opacity =
        opacity;


      if (
        timestamp -
        lastRenderRef.current >=
        RENDER_INTERVAL
      ) {

        lastRenderRef.current =
          timestamp;

        setTick(
          (t) =>
            (
              t + 1
            ) %
            1_000_000
        );
      }


      rafRef.current =
        window.requestAnimationFrame(
          loop
        );
    };


    rafRef.current =
      window.requestAnimationFrame(
        loop
      );


    return () => {

      video.removeEventListener(
        'seeked',
        onSeeked
      );


      if (
        rafRef.current !==
        null
      ) {

        window.cancelAnimationFrame(
          rafRef.current
        );

        rafRef.current =
          null;
      }


      lastTsRef.current =
        0;
    };

  }, [videoReady]);


  /* =======================================================
     VIDEO LOADED
     ======================================================= */

  const handleVideoLoaded = (
    event:
      React.SyntheticEvent<
        HTMLVideoElement
      >
  ) => {

    const video =
      event.currentTarget;


    video.pause();


    const onSeeked = () => {

      video.removeEventListener(
        'seeked',
        onSeeked
      );

      setVideoReady(
        true
      );
    };


    video.addEventListener(
      'seeked',
      onSeeked
    );


    try {

      video.currentTime =
        VIDEO_START_TIME;

    } catch {

      setVideoReady(
        true
      );
    }


    setTimeout(
      () =>
        setVideoReady(
          true
        ),
      400
    );
  };


  /* =======================================================
     DERIVED VALUES
     ======================================================= */

  const scrollProgress =
    scrollSpringRef.current.value;


  let videoDarkness = 0;


  if (
    scrollProgress >
    0.31
  ) {

    const raw =
      (
        scrollProgress -
        0.31
      ) /
      0.14;


    videoDarkness =
      smootherStep(
        raw
      ) *
      0.55;
  }


  videoDarkness =
    clamp(
      videoDarkness,
      0,
      0.55
    );


  /* =======================================================
     SCENE STYLES
     ======================================================= */

  const greetingStyle =
    getSceneStyle(
      scrollProgress,
      0.045,
      0.105,
      0.27,
      0.4,
      'up'
    );


  const introStyle =
    getSceneStyle(
      scrollProgress,
      0.37,
      0.45,
      0.55,
      0.64,
      'left'
    );


  const missionStyle =
    getSceneStyle(
      scrollProgress,
      0.59,
      0.67,
      0.77,
      0.85,
      'right'
    );


  const detailsStyle =
    getSceneStyle(
      scrollProgress,
      0.8,
      0.87,
      0.91,
      0.97,
      'left'
    );


  const closingStyle =
    getSceneStyle(
      scrollProgress,
      0.93,
      0.965,
      0.995,
      1,
      'up'
    );


  /* =======================================================
     ROCKY STYLE
     ======================================================= */

  const rockyStyle:
    React.CSSProperties = {

    position:
      'fixed',

    left:
      `${rockyRenderRef.current.x}vw`,

    top:
      `${rockyRenderRef.current.y}vh`,

    opacity:
      rockyRenderRef.current.opacity,

    transform:
      `translate(-50%, -100%) scale(${rockyRenderRef.current.scale})`,

    transformOrigin:
      '50% 100%',

    width:
      'clamp(82px, 8vw, 120px)',

    height:
      'auto',

    zIndex:
      2147483647,

    pointerEvents:
      'none',

    userSelect:
      'none',

    willChange:
      'left, top, transform, opacity',
  };


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>

      <section
        ref={sectionRef}
        id="about"
        className="about-scroll-section"
      >

        <div
          className={
            `about-scroll-sticky${
              active
                ? ' about-scroll-sticky--active'
                : ''
            }`
          }
        >

          {/* VIDEO */}

          <div
            className="about-video-layer"
          >

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
              onLoadedMetadata={
                handleVideoLoaded
              }
            />


            <div
              className="about-video-darken"
              style={{
                opacity:
                  videoDarkness,
              }}
            />


            <div
              className="about-video-vignette"
            />


            <div
              className="about-video-bottom-fade"
            />

          </div>


          {/* STARS */}

          <div
            className="about-star about-star-1"
          />

          <div
            className="about-star about-star-2"
          />

          <div
            className="about-star about-star-3"
          />


          {/* ORBITS */}

          <div
            className="about-orbit about-orbit-1"
          />

          <div
            className="about-orbit about-orbit-2"
          />


          {/* GREETING */}

          <div
            className="
              about-scene
              about-greeting-scene
            "
            style={
              greetingStyle
            }
          >

            <div
              className="about-greeting-card"
            >

              <div
                className="about-kicker"
              >

                <Sparkles
                  size={15}
                />

                <span>
                  INCOMING TRANSMISSION
                </span>

              </div>


              <h2>
                Hello Earthlings!
              </h2>


              <h3>
                I am Rocky.
              </h3>


              <p>
                I have travelled
                across the stars to
                see what you are
                building.
              </p>

            </div>

          </div>


          {/* ABOUT INTRO */}

          <div
            className="
              about-scene
              about-intro-scene
            "
            style={
              introStyle
            }
          >

            <div
              className="about-content-card"
            >

              <div
                className="about-kicker"
              >

                <Orbit
                  size={16}
                />

                <span>
                  ABOUT RESURRECTION
                </span>

              </div>


              <h2
                className="about-heading"
              >
                Build beyond
                <br />

                <span>
                  the known.
                </span>
              </h2>


              <p
                className="about-description"
              >
                Resurrection is a
                space where ambitious
                minds come together to
                transform ideas into
                technology. It brings
                together developers,
                designers, innovators
                and problem-solvers to
                create meaningful
                solutions to real-world
                challenges.
              </p>


              <p
                className="about-description"
              >
                From the first spark of
                an idea to a working
                prototype, the journey
                is about experimentation,
                collaboration and
                building something that
                can make a difference.
              </p>


              <div
                className="about-meta"
              >

                <span>
                  MISSION
                </span>

                <div />

                <strong>
                  RESURRECTION
                </strong>

              </div>

            </div>

          </div>


          {/* MISSION */}

          <div
            className="
              about-scene
              about-mission-scene
            "
            style={
              missionStyle
            }
          >

            <div
              className="about-content-card"
            >

              <div
                className="about-kicker"
              >

                <Rocket
                  size={16}
                />

                <span>
                  THE MISSION
                </span>

              </div>


              <h2
                className="about-heading"
              >
                One mission.
                <br />

                <span>
                  Infinite possibilities.
                </span>
              </h2>


              <p
                className="about-description"
              >
                The challenge is not
                simply to participate.
                It is to explore,
                experiment and build
                solutions that push the
                boundaries of what is
                possible.
              </p>


              <div
                className="about-feature-grid"
              >

                <div
                  className="about-feature"
                >

                  <Code2
                    size={22}
                  />

                  <strong>
                    BUILD
                  </strong>

                  <span>
                    Turn ideas into real,
                    working technology.
                  </span>

                </div>


                <div
                  className="about-feature"
                >

                  <BrainCircuit
                    size={22}
                  />

                  <strong>
                    THINK
                  </strong>

                  <span>
                    Question assumptions
                    and solve difficult
                    problems.
                  </span>

                </div>


                <div
                  className="about-feature"
                >

                  <Rocket
                    size={22}
                  />

                  <strong>
                    LAUNCH
                  </strong>

                  <span>
                    Take your solution
                    from concept to
                    execution.
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* WHY RESURRECTION */}

          <div
            className="
              about-scene
              about-details-scene
            "
            style={
              detailsStyle
            }
          >

            <div
              className="about-details-wrapper"
            >

              <div
                className="
                  about-content-card
                  about-details-main
                "
              >

                <div
                  className="about-kicker"
                >

                  <Atom
                    size={16}
                  />

                  <span>
                    WHY RESURRECTION?
                  </span>

                </div>


                <h2
                  className="about-heading"
                >
                  Ideas deserve
                  <br />

                  <span>
                    more than gravity.
                  </span>
                </h2>


                <p
                  className="about-description"
                >
                  Resurrection encourages
                  you to think beyond
                  conventional solutions.
                  Whether you are
                  exploring artificial
                  intelligence, software
                  engineering, quantum
                  computing or another
                  emerging field, the
                  focus is on learning,
                  creating and solving.
                </p>

              </div>


              <div
                className="about-small-card"
              >

                <Cpu
                  size={23}
                />

                <strong>
                  TECHNOLOGY
                </strong>

                <span>
                  Explore modern
                  technologies and turn
                  them into practical
                  solutions.
                </span>

              </div>


              <div
                className="about-small-card"
              >

                <Users
                  size={23}
                />

                <strong>
                  COLLABORATION
                </strong>

                <span>
                  Work with people who
                  bring different
                  perspectives and ideas.
                </span>

              </div>

            </div>

          </div>


          {/* CLOSING */}

          <div
            className="
              about-scene
              about-closing-scene
            "
            style={
              closingStyle
            }
          >

            <div
              className="about-closing"
            >

              <span
                className="
                  about-closing-label
                "
              >
                RESURRECTION
              </span>


              <h2>
                Your next idea
                <br />

                <span>
                  starts here.
                </span>
              </h2>


              <p>
                Keep exploring.
                <br />
                The mission has only
                just begun.
              </p>


              <div
                className="about-continue"
              >

                <div />

                <span>
                  CONTINUE EXPLORING
                </span>

              </div>

            </div>

          </div>


          {/* PROGRESS */}

          <div
            className="about-progress"
          >

            <div
              style={{
                transform:
                  `scaleX(${scrollProgress})`,
              }}
            />

          </div>

        </div>

      </section>


      {/* ROCKY FIXED OVERLAY */}

      <div
        className="about-rocky-companion"
        aria-hidden="true"
        style={
          rockyStyle
        }
      >

        <img
          src="/assets/about/rocky.png"
          alt=""
          draggable={false}
          style={{
            display:
              'block',

            width:
              '100%',

            height:
              'auto',

            objectFit:
              'contain',

            filter:
              `
                drop-shadow(
                  0 7px 10px
                  rgba(
                    0,
                    0,
                    0,
                    0.45
                  )
                )
                drop-shadow(
                  0 0 7px
                  rgba(
                    34,
                    211,
                    238,
                    0.10
                  )
                )
              `,
          }}
        />

      </div>

    </>
  );
};