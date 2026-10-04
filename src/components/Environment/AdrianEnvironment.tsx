import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AdrianEnvironmentProps {
  scrollProgress?: number;
}

const clamp = (
  value: number,
  min = 0,
  max = 1
) => Math.max(min, Math.min(max, value));

const AdrianEnvironment: React.FC<AdrianEnvironmentProps> = ({
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = clamp(scrollProgress);
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let disposed = false;

    /* =========================================================
       SCENE
       ========================================================= */

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x010604);

    scene.fog = new THREE.FogExp2(
      0x06130b,
      0.0048
    );


    /* =========================================================
       CAMERA
       ========================================================= */

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );

    camera.position.set(
      0,
      0,
      58
    );


    /* =========================================================
       RENDERER
       ========================================================= */

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.7
      )
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.18;

    renderer.domElement.style.position =
      'absolute';

    renderer.domElement.style.inset =
      '0';

    renderer.domElement.style.width =
      '100%';

    renderer.domElement.style.height =
      '100%';

    renderer.domElement.style.pointerEvents =
      'none';

    container.appendChild(
      renderer.domElement
    );


    /* =========================================================
       STAR FIELD
       ========================================================= */

    const STAR_COUNT = 7000;

    const starPositions =
      new Float32Array(
        STAR_COUNT * 3
      );

    const starColors =
      new Float32Array(
        STAR_COUNT * 3
      );

    const starSizes =
      new Float32Array(
        STAR_COUNT
      );

    const colors = [
      new THREE.Color(0xfff4d0),
      new THREE.Color(0xd9f6c4),
      new THREE.Color(0xffc66b),
      new THREE.Color(0xff9850),
      new THREE.Color(0xaee8bb),
      new THREE.Color(0xf5c978),
    ];

    for (
      let i = 0;
      i < STAR_COUNT;
      i++
    ) {
      const radius =
        180 +
        Math.random() * 1100;

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          THREE.MathUtils.randFloatSpread(2)
        );

      starPositions[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      starPositions[i * 3 + 1] =
        radius *
        Math.cos(phi);

      starPositions[i * 3 + 2] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      const color =
        colors[
          Math.floor(
            Math.random() *
            colors.length
          )
        ];

      starColors[i * 3] =
        color.r;

      starColors[i * 3 + 1] =
        color.g;

      starColors[i * 3 + 2] =
        color.b;

      /*
       * Slightly larger stars than before.
       */
      starSizes[i] =
        0.45 +
        Math.random() * 1.9;
    }

    const starGeometry =
      new THREE.BufferGeometry();

    starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        starPositions,
        3
      )
    );

    starGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(
        starColors,
        3
      )
    );

    starGeometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(
        starSizes,
        1
      )
    );

    const starMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        uniforms: {
          uPixelRatio: {
            value:
              renderer.getPixelRatio(),
          },
        },

        vertexShader: `
          attribute vec3 aColor;
          attribute float aSize;

          varying vec3 vColor;

          uniform float uPixelRatio;

          void main() {
            vColor = aColor;

            vec4 mvPosition =
              modelViewMatrix *
              vec4(position, 1.0);

            float depth =
              max(-mvPosition.z, 1.0);

            gl_PointSize =
              aSize *
              uPixelRatio *
              (460.0 / depth);

            gl_PointSize =
              clamp(
                gl_PointSize,
                0.6,
                5.8
              );

            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,

        fragmentShader: `
          varying vec3 vColor;

          void main() {
            vec2 uv =
              gl_PointCoord -
              vec2(0.5);

            float d =
              length(uv);

            if (d > 0.5)
              discard;

            float glow =
              1.0 -
              smoothstep(
                0.0,
                0.5,
                d
              );

            glow =
              pow(glow, 2.35);

            gl_FragColor =
              vec4(
                vColor,
                glow
              );
          }
        `,
      });

    const stars =
      new THREE.Points(
        starGeometry,
        starMaterial
      );

    scene.add(stars);


    /* =========================================================
       SOFT ATMOSPHERIC CLOUDS
       ========================================================= */

    const createCloud = (
      count: number,
      radius: number,
      color1: number,
      color2: number,
      opacity: number
    ) => {
      const positions =
        new Float32Array(
          count * 3
        );

      const colors =
        new Float32Array(
          count * 3
        );

      const sizes =
        new Float32Array(
          count
        );

      const c1 =
        new THREE.Color(color1);

      const c2 =
        new THREE.Color(color2);

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const angle =
          Math.random() *
          Math.PI *
          2;

        const distance =
          Math.pow(
            Math.random(),
            1.48
          ) * radius;

        positions[i * 3] =
          Math.cos(angle) *
          distance;

        positions[i * 3 + 1] =
          (Math.random() - 0.5) *
          radius *
          0.42;

        positions[i * 3 + 2] =
          Math.sin(angle) *
          distance *
          0.68;

        const color =
          c1.clone().lerp(
            c2,
            Math.random()
          );

        colors[i * 3] =
          color.r;

        colors[i * 3 + 1] =
          color.g;

        colors[i * 3 + 2] =
          color.b;

        /*
         * Bigger atmospheric particles.
         */
        sizes[i] =
          10 +
          Math.random() * 30;
      }

      const geometry =
        new THREE.BufferGeometry();

      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
          positions,
          3
        )
      );

      geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
          colors,
          3
        )
      );

      geometry.setAttribute(
        'aSize',
        new THREE.BufferAttribute(
          sizes,
          1
        )
      );

      const material =
        new THREE.ShaderMaterial({
          transparent: true,

          depthWrite: false,

          blending:
            THREE.AdditiveBlending,

          uniforms: {
            uPixelRatio: {
              value:
                renderer.getPixelRatio(),
            },

            uOpacity: {
              value: opacity,
            },
          },

          vertexShader: `
            attribute float aSize;

            varying vec3 vColor;

            uniform float uPixelRatio;

            void main() {
              vColor = color;

              vec4 mvPosition =
                modelViewMatrix *
                vec4(position, 1.0);

              float depth =
                max(-mvPosition.z, 1.0);

              gl_PointSize =
                aSize *
                uPixelRatio *
                (360.0 / depth);

              gl_PointSize =
                clamp(
                  gl_PointSize,
                  2.0,
                  110.0
                );

              gl_Position =
                projectionMatrix *
                mvPosition;
            }
          `,

          fragmentShader: `
            varying vec3 vColor;

            uniform float uOpacity;

            void main() {
              vec2 uv =
                gl_PointCoord -
                vec2(0.5);

              float d =
                length(uv);

              if (d > 0.5)
                discard;

              float alpha =
                1.0 -
                smoothstep(
                  0.02,
                  0.5,
                  d
                );

              alpha =
                pow(alpha, 3.0);

              gl_FragColor =
                vec4(
                  vColor,
                  alpha *
                  uOpacity
                );
            }
          `,
        });

      return new THREE.Points(
        geometry,
        material
      );
    };


    /* =========================================================
       GREEN CLOUD
       ========================================================= */

    const greenCloud =
      createCloud(
        1250,
        230,
        0x173d26,
        0xa7d84d,
        0.30
      );

    greenCloud.position.set(
      -125,
      28,
      -255
    );

    greenCloud.rotation.z =
      -0.25;

    scene.add(greenCloud);


    /* =========================================================
       ORANGE CLOUD
       ========================================================= */

    const orangeCloud =
      createCloud(
        1100,
        205,
        0x5e220c,
        0xff8a32,
        0.30
      );

    orangeCloud.position.set(
      135,
      -25,
      -300
    );

    orangeCloud.rotation.z =
      0.3;

    scene.add(orangeCloud);


    /* =========================================================
       GOLD CLOUD
       ========================================================= */

    const goldCloud =
      createCloud(
        700,
        145,
        0x77530d,
        0xffd66d,
        0.17
      );

    goldCloud.position.set(
      5,
      75,
      -370
    );

    scene.add(goldCloud);


    /* =========================================================
       LARGE FOREGROUND ATMOSPHERIC DUST
       ========================================================= */

    const DUST_COUNT = 900;

    const dustPositions =
      new Float32Array(
        DUST_COUNT * 3
      );

    const dustColors =
      new Float32Array(
        DUST_COUNT * 3
      );

    const dustSizes =
      new Float32Array(
        DUST_COUNT
      );

    const dustPalette = [
      new THREE.Color(0x8fca58),
      new THREE.Color(0xf19a43),
      new THREE.Color(0xffc76b),
      new THREE.Color(0xb9dc87),
    ];

    for (
      let i = 0;
      i < DUST_COUNT;
      i++
    ) {
      dustPositions[i * 3] =
        THREE.MathUtils.randFloat(
          -170,
          170
        );

      dustPositions[i * 3 + 1] =
        THREE.MathUtils.randFloat(
          -100,
          100
        );

      dustPositions[i * 3 + 2] =
        THREE.MathUtils.randFloat(
          -30,
          -480
        );

      const c =
        dustPalette[
          Math.floor(
            Math.random() *
            dustPalette.length
          )
        ];

      dustColors[i * 3] =
        c.r;

      dustColors[i * 3 + 1] =
        c.g;

      dustColors[i * 3 + 2] =
        c.b;

      dustSizes[i] =
        1.5 +
        Math.random() * 4.5;
    }

    const dustGeometry =
      new THREE.BufferGeometry();

    dustGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        dustPositions,
        3
      )
    );

    dustGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(
        dustColors,
        3
      )
    );

    dustGeometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(
        dustSizes,
        1
      )
    );

    const dustMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        uniforms: {
          uPixelRatio: {
            value:
              renderer.getPixelRatio(),
          },
        },

        vertexShader: `
          attribute vec3 aColor;
          attribute float aSize;

          varying vec3 vColor;

          uniform float uPixelRatio;

          void main() {
            vColor = aColor;

            vec4 mvPosition =
              modelViewMatrix *
              vec4(position, 1.0);

            float depth =
              max(-mvPosition.z, 1.0);

            gl_PointSize =
              aSize *
              uPixelRatio *
              (400.0 / depth);

            gl_PointSize =
              clamp(
                gl_PointSize,
                1.2,
                8.0
              );

            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,

        fragmentShader: `
          varying vec3 vColor;

          void main() {
            vec2 uv =
              gl_PointCoord -
              vec2(0.5);

            float d =
              length(uv);

            if (d > 0.5)
              discard;

            float alpha =
              1.0 -
              smoothstep(
                0.05,
                0.5,
                d
              );

            alpha =
              pow(alpha, 2.5);

            gl_FragColor =
              vec4(
                vColor,
                alpha * 0.58
              );
          }
        `,
      });

    const dust =
      new THREE.Points(
        dustGeometry,
        dustMaterial
      );

    scene.add(dust);


    /* =========================================================
       PLANETS
       ========================================================= */

    const createPlanet = (
      radius: number,
      position: THREE.Vector3,
      color: number,
      atmosphere: number
    ) => {
      const group =
        new THREE.Group();

      group.position.copy(
        position
      );

      /*
       * Main planetary body.
       */
      const planet =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            radius,
            64,
            64
          ),

          new THREE.MeshStandardMaterial({
            color,

            roughness: 0.88,

            metalness: 0.015,
          })
        );

      group.add(planet);


      /*
       * Soft atmospheric shell.
       */
      const glow =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            radius * 1.065,
            48,
            48
          ),

          new THREE.MeshBasicMaterial({
            color: atmosphere,

            transparent: true,

            opacity: 0.19,

            side: THREE.BackSide,

            blending:
              THREE.AdditiveBlending,

            depthWrite: false,
          })
        );

      group.add(glow);


      /*
       * Larger secondary atmosphere.
       */
      const outerGlow =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            radius * 1.13,
            32,
            32
          ),

          new THREE.MeshBasicMaterial({
            color: atmosphere,

            transparent: true,

            opacity: 0.045,

            side: THREE.BackSide,

            blending:
              THREE.AdditiveBlending,

            depthWrite: false,
          })
        );

      group.add(outerGlow);

      scene.add(group);

      return group;
    };


    /*
     * Main Adrian-inspired planet.
     *
     * Increased from 30 → 45.
     */
    const mainPlanet =
      createPlanet(
        45,

        new THREE.Vector3(
          -110,
          -18,
          -285
        ),

        0x426b43,

        0xa7dc58
      );


    /*
     * Orange planet.
     *
     * Increased from 13 → 21.
     */
    const orangePlanet =
      createPlanet(
        21,

        new THREE.Vector3(
          135,
          44,
          -350
        ),

        0x87502d,

        0xffa24d
      );


    /*
     * Moon.
     *
     * Increased from 6 → 10.
     */
    const smallMoon =
      createPlanet(
        10,

        new THREE.Vector3(
          60,
          -44,
          -205
        ),

        0x72756d,

        0xd9e6c0
      );


    /* =========================================================
       PLANET LIGHTS
       ========================================================= */

    const sun =
      new THREE.DirectionalLight(
        0xffc56f,
        4.2
      );

    sun.position.set(
      -150,
      100,
      100
    );

    scene.add(sun);


    const greenLight =
      new THREE.PointLight(
        0x8dcc48,
        6.5,
        720
      );

    greenLight.position.set(
      -135,
      20,
      -145
    );

    scene.add(greenLight);


    const orangeLight =
      new THREE.PointLight(
        0xff6c27,
        4.8,
        700
      );

    orangeLight.position.set(
      135,
      -20,
      -205
    );

    scene.add(orangeLight);


    /*
     * Warm fill light.
     */
    const goldLight =
      new THREE.PointLight(
        0xffb84f,
        2.0,
        500
      );

    goldLight.position.set(
      35,
      80,
      -240
    );

    scene.add(goldLight);


    /* =========================================================
       ORBIT
       ========================================================= */

    const orbitGroup =
      new THREE.Group();

    const orbitCount = 1100;

    const orbitPositions =
      new Float32Array(
        orbitCount * 3
      );

    for (
      let i = 0;
      i < orbitCount;
      i++
    ) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      /*
       * Orbit enlarged around the
       * larger main planet.
       */
      const radius =
        46 +
        Math.random() * 42;

      orbitPositions[i * 3] =
        Math.cos(angle) *
        radius;

      orbitPositions[i * 3 + 1] =
        (Math.random() - 0.5) *
        5;

      orbitPositions[i * 3 + 2] =
        Math.sin(angle) *
        radius;
    }

    const orbitGeometry =
      new THREE.BufferGeometry();

    orbitGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        orbitPositions,
        3
      )
    );

    const orbitMaterial =
      new THREE.PointsMaterial({
        color: 0xffc85a,

        size: 0.95,

        transparent: true,

        opacity: 0.78,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,
      });

    const orbitParticles =
      new THREE.Points(
        orbitGeometry,
        orbitMaterial
      );

    orbitGroup.add(
      orbitParticles
    );

    orbitGroup.position.copy(
      mainPlanet.position
    );

    orbitGroup.rotation.x =
      0.42;

    scene.add(orbitGroup);


    /* =========================================================
       SHOOTING STARS
       ========================================================= */

    type ShootingStar = {
      line: THREE.Line;
      velocity: THREE.Vector3;
      age: number;
      lifetime: number;
    };

    const shootingStars:
      ShootingStar[] = [];

    const spawnShootingStar =
      () => {
        const start =
          new THREE.Vector3(
            THREE.MathUtils.randFloat(
              -220,
              220
            ),

            THREE.MathUtils.randFloat(
              35,
              140
            ),

            THREE.MathUtils.randFloat(
              -260,
              -60
            )
          );

        /*
         * Longer shooting-star trail.
         */
        const end =
          start.clone().add(
            new THREE.Vector3(
              -38,
              -24,
              -10
            )
          );

        const geometry =
          new THREE.BufferGeometry()
            .setFromPoints([
              start,
              end,
            ]);

        const material =
          new THREE.LineBasicMaterial({
            color:
              Math.random() > 0.45
                ? 0xffd17a
                : 0xb8ef85,

            transparent: true,

            opacity: 0,

            blending:
              THREE.AdditiveBlending,

            depthWrite: false,
          });

        const line =
          new THREE.Line(
            geometry,
            material
          );

        scene.add(line);

        shootingStars.push({
          line,

          velocity:
            new THREE.Vector3(
              -1.35,
              -0.78,
              -0.08
            ),

          age: 0,

          lifetime:
            1.2 +
            Math.random() * 1.8,
        });
      };


    /* =========================================================
       MOUSE
       ========================================================= */

    const mouseTarget =
      new THREE.Vector2();

    const mouse =
      new THREE.Vector2();

    const handlePointerMove =
      (event: PointerEvent) => {
        mouseTarget.x =
          (event.clientX /
            window.innerWidth) *
            2 -
          1;

        mouseTarget.y =
          -(
            (event.clientY /
              window.innerHeight) *
              2 -
            1
          );
      };

    window.addEventListener(
      'pointermove',
      handlePointerMove,
      {
        passive: true,
      }
    );


    /* =========================================================
       RESIZE
       ========================================================= */

    const handleResize =
      () => {
        camera.aspect =
          window.innerWidth /
          window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setPixelRatio(
          Math.min(
            window.devicePixelRatio,
            1.7
          )
        );

        renderer.setSize(
          window.innerWidth,
          window.innerHeight
        );
      };

    window.addEventListener(
      'resize',
      handleResize
    );


    /* =========================================================
       ANIMATION
       ========================================================= */

    const clock =
      new THREE.Clock();

    let animationFrame = 0;

    let lastShootingStar = 0;

    const animate = () => {
      if (disposed) return;

      animationFrame =
        requestAnimationFrame(
          animate
        );

      const elapsed =
        clock.getElapsedTime();


      /* -------------------------------------------------------
         Smooth mouse
         ------------------------------------------------------- */

      mouse.lerp(
        mouseTarget,
        0.035
      );


      /* -------------------------------------------------------
         Scroll
         ------------------------------------------------------- */

      const progress =
        clamp(
          scrollRef.current
        );


      /* -------------------------------------------------------
         Camera
         ------------------------------------------------------- */

      const targetX =
        mouse.x * 7.5;

      const targetY =
        mouse.y * 4.5;

      const targetZ =
        58 -
        progress * 115;

      camera.position.x +=
        (targetX -
          camera.position.x) *
        0.025;

      camera.position.y +=
        (targetY -
          camera.position.y) *
        0.025;

      camera.position.z +=
        (targetZ -
          camera.position.z) *
        0.018;

      const lookAt =
        new THREE.Vector3(
          mouse.x * 9,
          mouse.y * 5.5,
          -120 -
            progress * 90
        );

      camera.lookAt(
        lookAt
      );


      /* -------------------------------------------------------
         Stars
         ------------------------------------------------------- */

      stars.rotation.y =
        elapsed * 0.0035;

      stars.rotation.x =
        Math.sin(
          elapsed * 0.02
        ) * 0.014;


      /* -------------------------------------------------------
         Foreground dust
         ------------------------------------------------------- */

      dust.rotation.y =
        elapsed * 0.0018;

      dust.rotation.x =
        Math.sin(
          elapsed * 0.12
        ) * 0.008;

      dust.position.x =
        mouse.x * 3;

      dust.position.y =
        mouse.y * 2;


      /* -------------------------------------------------------
         Nebula movement
         ------------------------------------------------------- */

      greenCloud.rotation.y =
        elapsed * 0.004;

      orangeCloud.rotation.y =
        -elapsed * 0.003;

      goldCloud.rotation.y =
        elapsed * 0.002;

      greenCloud.position.x =
        -125 +
        mouse.x * 11;

      greenCloud.position.y =
        28 +
        mouse.y * 5;

      orangeCloud.position.x =
        135 -
        mouse.x * 14;

      orangeCloud.position.y =
        -25 -
        mouse.y * 6;

      goldCloud.position.x =
        5 +
        mouse.x * 6;

      goldCloud.position.y =
        75 +
        mouse.y * 4;


      /* -------------------------------------------------------
         Planets
         ------------------------------------------------------- */

      mainPlanet.position.x =
        -110 +
        mouse.x * 6;

      mainPlanet.position.y =
        -18 +
        mouse.y * 4;

      orangePlanet.position.x =
        135 -
        mouse.x * 9;

      orangePlanet.position.y =
        44 -
        mouse.y * 5;

      smallMoon.position.x =
        60 +
        mouse.x * 5;

      smallMoon.position.y =
        -44 +
        mouse.y * 3.5;


      /* -------------------------------------------------------
         Planet rotation
         ------------------------------------------------------- */

      mainPlanet.rotation.y =
        elapsed * 0.018;

      mainPlanet.rotation.x =
        Math.sin(
          elapsed * 0.07
        ) * 0.025;

      orangePlanet.rotation.y =
        -elapsed * 0.03;

      smallMoon.rotation.y =
        elapsed * 0.05;


      /* -------------------------------------------------------
         Orbit
         ------------------------------------------------------- */

      orbitGroup.rotation.y =
        elapsed * 0.075;

      orbitGroup.rotation.z =
        Math.sin(
          elapsed * 0.1
        ) * 0.025;


      /* -------------------------------------------------------
         Lights breathe
         ------------------------------------------------------- */

      greenLight.intensity =
        5.6 +
        Math.sin(
          elapsed * 0.45
        ) *
        0.8;

      orangeLight.intensity =
        4.1 +
        Math.sin(
          elapsed * 0.36 +
          1.4
        ) *
        0.65;

      goldLight.intensity =
        1.8 +
        Math.sin(
          elapsed * 0.28
        ) *
        0.35;


      /* -------------------------------------------------------
         Shooting stars
         ------------------------------------------------------- */

      if (
        elapsed -
          lastShootingStar >
        2.0 +
          Math.random() * 2.2
      ) {
        spawnShootingStar();

        lastShootingStar =
          elapsed;
      }

      for (
        let i =
          shootingStars.length -
          1;
        i >= 0;
        i--
      ) {
        const star =
          shootingStars[i];

        star.age += 0.016;

        star.line.position.add(
          star.velocity
        );

        const starProgress =
          star.age /
          star.lifetime;

        let opacity = 0;

        if (
          starProgress < 0.18
        ) {
          opacity =
            starProgress /
            0.18;
        } else {
          opacity =
            1 -
            (starProgress - 0.18) /
              0.82;
        }

        (
          star.line
            .material as
            THREE.LineBasicMaterial
        ).opacity =
          Math.max(
            0,
            opacity
          );

        if (
          star.age >=
          star.lifetime
        ) {
          scene.remove(
            star.line
          );

          star.line.geometry.dispose();

          (
            star.line
              .material as
              THREE.Material
          ).dispose();

          shootingStars.splice(
            i,
            1
          );
        }
      }


      /* -------------------------------------------------------
         Render
         ------------------------------------------------------- */

      renderer.render(
        scene,
        camera
      );
    };

    animate();


    /* =========================================================
       CLEANUP
       ========================================================= */

    return () => {
      disposed = true;

      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      starGeometry.dispose();
      starMaterial.dispose();

      dustGeometry.dispose();
      dustMaterial.dispose();

      [
        greenCloud,
        orangeCloud,
        goldCloud,
      ].forEach(
        (cloud) => {
          cloud.geometry.dispose();

          (
            cloud.material as
            THREE.Material
          ).dispose();
        }
      );

      [
        mainPlanet,
        orangePlanet,
        smallMoon,
      ].forEach(
        (planet) => {
          planet.traverse(
            (object) => {
              if (
                object instanceof
                THREE.Mesh
              ) {
                object.geometry.dispose();

                (
                  object.material as
                  THREE.Material
                ).dispose();
              }
            }
          );
        }
      );

      orbitGeometry.dispose();
      orbitMaterial.dispose();

      shootingStars.forEach(
        (star) => {
          star.line.geometry.dispose();

          (
            star.line
              .material as
              THREE.Material
          ).dispose();
        }
      );

      renderer.dispose();

      if (
        renderer.domElement
          .parentElement ===
        container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="adrian-environment"
      aria-hidden="true"
    />
  );
};

export default AdrianEnvironment;