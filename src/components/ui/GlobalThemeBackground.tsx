import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type ThemeId } from '../../config/theme';

interface GlobalThemeBackgroundProps {
  themeId?: ThemeId;
}

export type GlobalSpaceThemeConfig = {
  nebulaA: number;
  nebulaB: number;
  nebulaC: number;
  nebulaOpacity: number;
  starColor1: number;
  starColor2: number;
  starColor3: number;
  dustColor: number;
  rockColor: number;
  rockRimColor: number;
  shootingStarColor: [number, number, number];
};

const globalSpaceThemeConfigs: Record<
  ThemeId,
  GlobalSpaceThemeConfig
> = {
  /* ============================================================
     TAU CETI e — ADRIAN
     Green alien world with vibrant orange patches.
     ============================================================ */

  'tau-ceti': {
    // Golden Dune World: warm amber, solar gold, bronze stardust
    nebulaA: 0x9e681c,
    nebulaB: 0x3d2508,
    nebulaC: 0xe5a93c,
    nebulaOpacity: 0.22,
    starColor1: 0xffe4a0,
    starColor2: 0xe5a93c,
    starColor3: 0xffffff,
    dustColor: 0xd4a559,
    rockColor: 0x2e2015,
    rockRimColor: 0xe5a93c,
    shootingStarColor: [1.0, 0.85, 0.45],
  },

  /* ============================================================
     MILLER
     ============================================================ */

  miller: {
    nebulaA: 0x475569,
    nebulaB: 0x1e293b,
    nebulaC: 0x94a3b8,

    nebulaOpacity: 0.18,

    starColor1: 0xffffff,
    starColor2: 0xe2e8f0,
    starColor3: 0x94a3b8,

    dustColor: 0x94a3b8,

    rockColor: 0x1e293b,
    rockRimColor: 0xe2e8f0,

    shootingStarColor: [
      0.95,
      0.95,
      0.98,
    ],
  },

  /* ============================================================
     PANDORA
     ============================================================ */

  pandora: {
    nebulaA: 0x0052cc,
    nebulaB: 0x071b40,
    nebulaC: 0x00d2ff,

    nebulaOpacity: 0.25,

    starColor1: 0x00f0ff,
    starColor2: 0x38bdf8,
    starColor3: 0xffffff,

    dustColor: 0x7dd3fc,

    rockColor: 0x0f244a,
    rockRimColor: 0x00d2ff,

    shootingStarColor: [
      0.15,
      0.85,
      1.0,
    ],
  },

  /* ============================================================
     KEPLER
     ============================================================ */

  kepler: {
    nebulaA: 0x8a1825,
    nebulaB: 0x38090f,
    nebulaC: 0xff3344,

    nebulaOpacity: 0.22,

    starColor1: 0xff7a59,
    starColor2: 0xff3344,
    starColor3: 0xfff0f2,

    dustColor: 0xff808a,

    rockColor: 0x331015,
    rockRimColor: 0xff3344,

    shootingStarColor: [
      1.0,
      0.42,
      0.50,
    ],
  },
};

export const GlobalThemeBackground: React.FC<
  GlobalThemeBackgroundProps
> = ({ themeId }) => {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const themeRef =
    useRef<ThemeId>(
      themeId || 'tau-ceti'
    );

  /*
   * IMPORTANT:
   * Start hidden so Hero remains untouched.
   */
  const [inActiveArea, setInActiveArea] =
    useState(false);

  /* ============================================================
     KEEP THEME SYNCED
     ============================================================ */

  useEffect(() => {
    if (themeId) {
      themeRef.current = themeId;
      return;
    }

    const root =
      document.documentElement;

    const currentAttr =
      (root.getAttribute(
        'data-theme'
      ) as ThemeId) ||
      'tau-ceti';

    themeRef.current =
      currentAttr;

    const observer =
      new MutationObserver(() => {
        const updatedAttr =
          (root.getAttribute(
            'data-theme'
          ) as ThemeId) ||
          'tau-ceti';

        themeRef.current =
          updatedAttr;
      });

    observer.observe(root, {
      attributes: true,
      attributeFilter: [
        'data-theme',
      ],
    });

    return () =>
      observer.disconnect();
  }, [themeId]);

  /* ============================================================
     ACTIVATE AFTER HERO
     ============================================================ */

  useEffect(() => {
    let frameId = 0;

    const checkPosition = () => {
      const aboutEl =
        document.getElementById(
          'about'
        );

      /*
       * If About hasn't mounted yet,
       * keep the background hidden.
       *
       * This guarantees Hero does not
       * receive the global background.
       */
      if (!aboutEl) {
        setInActiveArea(false);
        return;
      }

      const rect =
        aboutEl.getBoundingClientRect();

      /*
       * Show the background once About
       * enters the viewport.
       *
       * A small early threshold makes
       * the fade-in smooth.
       */
      const shouldShow =
        rect.top <=
        window.innerHeight * 0.85;

      setInActiveArea(
        shouldShow
      );
    };

    const handleScroll = () => {
      frameId =
        requestAnimationFrame(
          checkPosition
        );
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'resize',
      checkPosition
    );

    checkPosition();

    const timer1 =
      window.setTimeout(
        checkPosition,
        300
      );

    const timer2 =
      window.setTimeout(
        checkPosition,
        1000
      );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        checkPosition
      );

      cancelAnimationFrame(
        frameId
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  /* ============================================================
     THREE.JS BACKGROUND
     ============================================================ */

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      console.warn(
        '[GlobalThemeBackground] container ref is null'
      );

      return;
    }

    const isMobile =
      window.innerWidth < 768;

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const initialThemeId =
      themeRef.current;

    const initialConfig =
      globalSpaceThemeConfigs[
        initialThemeId
      ] ||
      globalSpaceThemeConfigs[
        'tau-ceti'
      ];

    /* ==========================================================
       SCENE
       ========================================================== */

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        52,
        window.innerWidth /
          window.innerHeight,
        1,
        800
      );

    camera.position.set(
      0,
      0,
      95
    );

    /* ==========================================================
       RENDERER
       ========================================================== */

    const renderer =
      new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference:
          'high-performance',
        stencil: false,
        depth: false,
      });

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      )
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    /*
     * Force the canvas itself to occupy
     * the entire viewport.
     */
    renderer.domElement.style.position =
      'absolute';

    renderer.domElement.style.left =
      '0';

    renderer.domElement.style.top =
      '0';

    renderer.domElement.style.width =
      '100%';

    renderer.domElement.style.height =
      '100%';

    renderer.domElement.style.display =
      'block';

    renderer.domElement.style.pointerEvents =
      'none';

    container.appendChild(
      renderer.domElement
    );

    /* ==========================================================
       1. PROCEDURAL NEBULA
       ========================================================== */

    const nebulaUniforms = {
      uTime: {
        value: 0,
      },

      uMouse: {
        value:
          new THREE.Vector2(
            0,
            0
          ),
      },

      uColorA: {
        value:
          new THREE.Color(
            initialConfig.nebulaA
          ),
      },

      uColorB: {
        value:
          new THREE.Color(
            initialConfig.nebulaB
          ),
      },

      uColorC: {
        value:
          new THREE.Color(
            initialConfig.nebulaC
          ),
      },

      uPatchColor: {
        value:
          new THREE.Color(
            initialThemeId ===
            'tau-ceti'
              ? 0xff6a00
              : initialConfig.nebulaC
          ),
      },

      uOpacity: {
        value:
          initialConfig.nebulaOpacity,
      },
    };

    const nebulaMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        uniforms:
          nebulaUniforms,

        vertexShader:
          /* glsl */ `
          varying vec2 vUv;

          void main() {
            vUv = uv;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
          }
        `,

        fragmentShader:
          /* glsl */ `
          varying vec2 vUv;

          uniform float uTime;
          uniform vec2 uMouse;

          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform vec3 uColorC;
          uniform vec3 uPatchColor;

          uniform float uOpacity;

          float hash(vec2 p) {
            return fract(
              sin(
                dot(
                  p,
                  vec2(
                    127.1,
                    311.7
                  )
                )
              ) *
              43758.5453123
            );
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);

            f =
              f *
              f *
              (3.0 - 2.0 * f);

            return mix(
              mix(
                hash(i),
                hash(
                  i +
                  vec2(1.0, 0.0)
                ),
                f.x
              ),

              mix(
                hash(
                  i +
                  vec2(0.0, 1.0)
                ),
                hash(
                  i +
                  vec2(1.0, 1.0)
                ),
                f.x
              ),

              f.y
            );
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;

            mat2 rot =
              mat2(
                0.8,
                0.6,
                -0.6,
                0.8
              );

            for (
              int i = 0;
              i < 4;
              i++
            ) {
              v +=
                a *
                noise(p);

              p =
                rot *
                p *
                2.02;

              a *= 0.5;
            }

            return v;
          }

          void main() {

            vec2 uv =
              (vUv - 0.5) *
              1.8;

            uv +=
              uMouse *
              0.04;

            /*
             * GREEN BASE
             */

            float n1 =
              fbm(
                uv * 1.4 +
                vec2(
                  uTime * 0.015,
                  uTime * 0.012
                )
              );

            float n2 =
              fbm(
                uv * 2.4 -
                vec2(
                  uTime * 0.012,
                  -uTime * 0.015
                ) +
                n1 * 0.5
              );

            /*
             * LARGE ORANGE PATCHES
             */

            float n3 =
              fbm(
                uv * 0.9 +
                vec2(
                  uTime * 0.008,
                  -uTime * 0.006
                ) +
                n1 * 0.15
              );

            float patchField =
              n2 * 0.65 +
              n3 * 0.35;

            float smallPatch =
              smoothstep(
                0.50,
                0.72,
                patchField
              );

            float largePatch =
              smoothstep(
                0.42,
                0.62,
                patchField
              ) *
              0.75;

            float orangePatches =
              max(
                smallPatch,
                largePatch
              );

            float flicker =
              0.55 +
              0.45 *
              sin(
                uTime * 0.28 +
                patchField * 12.0
              );

            orangePatches *=
              flicker;

            /*
             * VIGNETTE
             */

            float d =
              length(uv);

            float vignette =
              smoothstep(
                1.35,
                0.15,
                d
              );

            vec3 col =
              mix(
                uColorA,
                uColorB,
                smoothstep(
                  0.2,
                  0.65,
                  n1
                )
              );

            col =
              mix(
                col,
                uColorC,
                smoothstep(
                  0.4,
                  0.85,
                  n2
                )
              );

            /*
             * VIBRANT ORANGE
             */

            col =
              mix(
                col,
                col +
                  uPatchColor *
                  0.85,
                orangePatches *
                  0.75
              );

            float alpha =
              smoothstep(
                0.22,
                0.72,
                n2
              ) *
              vignette *
              uOpacity;

            gl_FragColor =
              vec4(
                col,
                alpha
              );
          }
        `,
      });

    const nebulaMesh =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          320,
          200
        ),
        nebulaMaterial
      );

    nebulaMesh.position.set(
      0,
      0,
      -85
    );

    scene.add(
      nebulaMesh
    );

    /* ==========================================================
       2. STARFIELD
       ========================================================== */

    const starCount =
      isMobile
        ? 220
        : 440;

    const starPositions =
      new Float32Array(
        starCount * 3
      );

    const starVelocities =
      new Float32Array(
        starCount * 3
      );

    const starColors =
      new Float32Array(
        starCount * 3
      );

    const starSizes =
      new Float32Array(
        starCount
      );

    const starPhases =
      new Float32Array(
        starCount
      );

    const starSpeeds =
      new Float32Array(
        starCount
      );

    const tempColor =
      new THREE.Color();

    const c1 =
      new THREE.Color(
        initialConfig.starColor1
      );

    const c2 =
      new THREE.Color(
        initialConfig.starColor2
      );

    const c3 =
      new THREE.Color(
        initialConfig.starColor3
      );

    const boundsX =
      isMobile
        ? 100
        : 165;

    const boundsY =
      isMobile
        ? 75
        : 115;

    const boundsZFar =
      -160;

    const boundsZNear =
      45;

    for (
      let i = 0;
      i < starCount;
      i++
    ) {
      const i3 =
        i * 3;

      const x =
        (Math.random() - 0.5) *
        boundsX *
        2;

      const y =
        (Math.random() - 0.5) *
        boundsY *
        2;

      const z =
        boundsZFar +
        Math.random() *
          (
            boundsZNear -
            boundsZFar
          );

      starPositions[i3] =
        x;

      starPositions[i3 + 1] =
        y;

      starPositions[i3 + 2] =
        z;

      starVelocities[i3] =
        (Math.random() - 0.5) *
        0.04;

      starVelocities[i3 + 1] =
        (Math.random() - 0.5) *
        0.03;

      starVelocities[i3 + 2] =
        0.05 +
        Math.random() *
          0.09;

      const random =
        Math.random();

      if (random < 0.45) {
        tempColor.copy(c1);
      } else if (random < 0.8) {
        tempColor.copy(c2);
      } else {
        tempColor.copy(c3);
      }

      starColors[i3] =
        tempColor.r;

      starColors[i3 + 1] =
        tempColor.g;

      starColors[i3 + 2] =
        tempColor.b;

      const foreground =
        z > -30;

      starSizes[i] =
        (
          foreground
            ? 2.5 +
              Math.random() *
                3.0
            : 1.2 +
              Math.random() *
                1.8
        ) *
        Math.min(
          window.devicePixelRatio ||
            1,
          1.5
        );

      starPhases[i] =
        Math.random() *
        Math.PI *
        2;

      starSpeeds[i] =
        0.6 +
        Math.random() *
          1.5;
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
      'color',
      new THREE.BufferAttribute(
        starColors,
        3
      )
    );

    starGeometry.setAttribute(
      'size',
      new THREE.BufferAttribute(
        starSizes,
        1
      )
    );

    starGeometry.setAttribute(
      'aPhase',
      new THREE.BufferAttribute(
        starPhases,
        1
      )
    );

    starGeometry.setAttribute(
      'aSpeed',
      new THREE.BufferAttribute(
        starSpeeds,
        1
      )
    );

    const starMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        vertexColors: true,

        uniforms: {
          uTime: {
            value: 0,
          },
        },

        vertexShader:
          /* glsl */ `
          attribute float size;
          attribute float aPhase;
          attribute float aSpeed;

          varying vec3 vColor;
          varying float vTwinkle;

          uniform float uTime;

          void main() {

            vColor =
              color;

            vTwinkle =
              sin(
                uTime *
                aSpeed +
                aPhase
              ) *
              0.35 +
              0.65;

            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                position,
                1.0
              );

            gl_Position =
              projectionMatrix *
              mvPosition;

            gl_PointSize =
              size *
              (
                150.0 /
                -mvPosition.z
              );
          }
        `,

        fragmentShader:
          /* glsl */ `
          varying vec3 vColor;
          varying float vTwinkle;

          void main() {

            vec2 coord =
              gl_PointCoord -
              vec2(0.5);

            float dist =
              length(coord);

            if (
              dist >
              0.5
            ) {
              discard;
            }

            float alpha =
              smoothstep(
                0.5,
                0.04,
                dist
              ) *
              vTwinkle;

            gl_FragColor =
              vec4(
                vColor,
                alpha * 0.9
              );
          }
        `,
      });

    const starPoints =
      new THREE.Points(
        starGeometry,
        starMaterial
      );

    scene.add(
      starPoints
    );

    /* ==========================================================
       3. ASTEROIDS
       ========================================================== */

    const rockCount =
      isMobile
        ? 8
        : 15;

    const rockGeometry =
      new THREE.DodecahedronGeometry(
        1.8,
        1
      );

    const rockUniforms = {
      uRockColor: {
        value:
          new THREE.Color(
            initialConfig.rockColor
          ),
      },

      uRimColor: {
        value:
          new THREE.Color(
            initialConfig.rockRimColor
          ),
      },

      uLightPos: {
        value:
          new THREE.Vector3(
            -40,
            50,
            40
          ),
      },
    };

    const rockMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        uniforms:
          rockUniforms,

        vertexShader:
          /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          void main() {

            vNormal =
              normalize(
                normalMatrix *
                normal
              );

            vec4 worldPos =
              modelMatrix *
              vec4(
                position,
                1.0
              );

            vWorldPos =
              worldPos.xyz;

            gl_Position =
              projectionMatrix *
              viewMatrix *
              worldPos;
          }
        `,

        fragmentShader:
          /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          uniform vec3 uRockColor;
          uniform vec3 uRimColor;
          uniform vec3 uLightPos;

          void main() {

            vec3 N =
              normalize(
                vNormal
              );

            vec3 L =
              normalize(
                uLightPos -
                vWorldPos
              );

            vec3 V =
              normalize(
                cameraPosition -
                vWorldPos
              );

            float diff =
              max(
                dot(N, L),
                0.0
              );

            float rim =
              pow(
                1.0 -
                max(
                  dot(N, V),
                  0.0
                ),
                2.8
              );

            vec3 col =
              uRockColor *
              (
                0.25 +
                diff * 0.75
              );

            col +=
              uRimColor *
              rim *
              0.85;

            gl_FragColor =
              vec4(
                col,
                0.72
              );
          }
        `,
      });

    const rockInstanced =
      new THREE.InstancedMesh(
        rockGeometry,
        rockMaterial,
        rockCount
      );

    const dummy =
      new THREE.Object3D();

    type RockData = {
      pos: THREE.Vector3;
      rot: THREE.Euler;
      rotSpeed: THREE.Vector3;
      driftSpeed: THREE.Vector3;
      scale: number;
    };

    const rocksData:
      RockData[] = [];

    for (
      let i = 0;
      i < rockCount;
      i++
    ) {
      const rockPos =
        new THREE.Vector3(
          (Math.random() - 0.5) *
            boundsX *
            1.8,

          (Math.random() - 0.5) *
            boundsY *
            1.8,

          -90 +
            Math.random() *
              80
        );

      const scale =
        0.6 +
        Math.random() *
          1.4;

      dummy.position.copy(
        rockPos
      );

      dummy.scale.setScalar(
        scale
      );

      dummy.rotation.set(
        Math.random() *
          Math.PI,

        Math.random() *
          Math.PI,

        Math.random() *
          Math.PI
      );

      dummy.updateMatrix();

      rockInstanced.setMatrixAt(
        i,
        dummy.matrix
      );

      rocksData.push({
        pos: rockPos,

        rot:
          dummy.rotation.clone(),

        rotSpeed:
          new THREE.Vector3(
            (Math.random() - 0.5) *
              0.008,

            (Math.random() - 0.5) *
              0.008,

            (Math.random() - 0.5) *
              0.005
          ),

        driftSpeed:
          new THREE.Vector3(
            (Math.random() - 0.5) *
              0.02,

            (Math.random() - 0.5) *
              0.02,

            0.015 +
              Math.random() *
                0.03
          ),

        scale,
      });
    }

    rockInstanced.instanceMatrix.needsUpdate =
      true;

    scene.add(
      rockInstanced
    );

    /* ==========================================================
       4. SHOOTING STARS
       ========================================================== */

    const meteorCount = 3;

    const meteorPositions =
      new Float32Array(
        meteorCount *
          2 *
          3
      );

    const meteorColors =
      new Float32Array(
        meteorCount *
          2 *
          3
      );

    const meteorGeometry =
      new THREE.BufferGeometry();

    meteorGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        meteorPositions,
        3
      )
    );

    meteorGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(
        meteorColors,
        3
      )
    );

    const meteorMaterial =
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
      });

    const meteorsMesh =
      new THREE.LineSegments(
        meteorGeometry,
        meteorMaterial
      );

    scene.add(
      meteorsMesh
    );

    type Meteor = {
      head: THREE.Vector3;
      dir: THREE.Vector3;
      speed: number;
      length: number;
      life: number;
      active: boolean;
      delay: number;
    };

    const meteors:
      Meteor[] = [];

    for (
      let i = 0;
      i < meteorCount;
      i++
    ) {
      meteors.push({
        head:
          new THREE.Vector3(),

        dir:
          new THREE.Vector3(
            -1,
            -0.4,
            0
          ).normalize(),

        speed:
          1.8 +
          Math.random() *
            1.2,

        length:
          22 +
          Math.random() *
            18,

        life: 0,

        active: false,

        delay:
          2 +
          Math.random() *
            6,
      });
    }

    /* ==========================================================
       5. AURORA
       ========================================================== */

    const auroraUniforms = {
      uTime: {
        value: 0,
      },

      uColorA: {
        value:
          new THREE.Color(
            initialConfig.nebulaA
          ),
      },

      uColorC: {
        value:
          new THREE.Color(
            initialConfig.nebulaC
          ),
      },
    };

    const auroraMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        blending:
          THREE.AdditiveBlending,

        depthWrite: false,

        side:
          THREE.DoubleSide,

        uniforms:
          auroraUniforms,

        vertexShader:
          /* glsl */ `
          varying vec2 vUv;

          uniform float uTime;

          void main() {

            vUv = uv;

            vec3 pos =
              position;

            float wave =
              sin(
                pos.x *
                0.04 +
                uTime *
                0.6
              ) *
              4.5 +

              sin(
                pos.x *
                0.09 -
                uTime *
                0.4
              ) *
              2.5;

            pos.y +=
              wave;

            pos.z +=
              sin(
                pos.x *
                0.07 +
                uTime *
                0.35
              ) *
              3.0;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                pos,
                1.0
              );
          }
        `,

        fragmentShader:
          /* glsl */ `
          varying vec2 vUv;

          uniform vec3 uColorA;
          uniform vec3 uColorC;

          void main() {

            float stripe =
              abs(
                sin(
                  vUv.x *
                  3.14159
                )
              );

            float alpha =
              smoothstep(
                0.0,
                0.4,
                stripe
              ) *

              smoothstep(
                1.0,
                0.55,
                vUv.y
              ) *
              0.28;

            vec3 col =
              mix(
                uColorA,
                uColorC,
                vUv.x
              );

            gl_FragColor =
              vec4(
                col,
                alpha
              );
          }
        `,
      });

    const auroraMeshes:
      THREE.Mesh[] = [];

    for (
      let i = 0;
      i <
      (isMobile ? 1 : 2);
      i++
    ) {
      const geometry =
        new THREE.PlaneGeometry(
          280,
          28,
          60,
          6
        );

      const mesh =
        new THREE.Mesh(
          geometry,
          auroraMaterial
        );

      mesh.position.set(
        0,
        20 +
          i * 22,
        -70 -
          i * 12
      );

      mesh.rotation.x =
        -0.15 +
        i * 0.08;

      scene.add(mesh);

      auroraMeshes.push(
        mesh
      );
    }

    /* ==========================================================
       6. PLANETS
       ========================================================== */

    const planetUniforms = {
      uBaseColor: {
        value:
          new THREE.Color(
            initialConfig.nebulaB
          ),
      },

      uAtmosphereColor: {
        value:
          new THREE.Color(
            initialConfig.nebulaC
          ),
      },

      uGlowColor: {
        value:
          new THREE.Color(
            initialConfig.starColor2
          ),
      },

      uPatchColor: {
        value:
          new THREE.Color(
            initialThemeId ===
            'tau-ceti'
              ? 0xff6a00
              : initialConfig.starColor2
          ),
      },

      uLightPos: {
        value:
          new THREE.Vector3(
            50,
            40,
            60
          ),
      },

      uTime: {
        value: 0,
      },
    };

    const planetMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        depthWrite: false,

        uniforms:
          planetUniforms,

        vertexShader:
          /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying vec3 vViewDir;

          void main() {

            vNormal =
              normalize(
                normalMatrix *
                normal
              );

            vec4 worldPos =
              modelMatrix *
              vec4(
                position,
                1.0
              );

            vWorldPos =
              worldPos.xyz;

            vec4 mvPos =
              modelViewMatrix *
              vec4(
                position,
                1.0
              );

            vViewDir =
              normalize(
                -mvPos.xyz
              );

            gl_Position =
              projectionMatrix *
              mvPos;
          }
        `,

        fragmentShader:
          /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying vec3 vViewDir;

          uniform vec3 uBaseColor;
          uniform vec3 uAtmosphereColor;
          uniform vec3 uGlowColor;
          uniform vec3 uPatchColor;

          uniform vec3 uLightPos;
          uniform float uTime;

          float hash3(vec3 p) {

            p =
              fract(
                p *
                0.3183099 +
                vec3(
                  0.1,
                  0.2,
                  0.3
                )
              );

            p *= 17.0;

            return fract(
              p.x *
              p.y *
              p.z *
              (
                p.x +
                p.y +
                p.z
              )
            );
          }

          float noise3(vec3 p) {

            vec3 i =
              floor(p);

            vec3 f =
              fract(p);

            f =
              f *
              f *
              (3.0 - 2.0 * f);

            return mix(

              mix(
                mix(
                  hash3(i),
                  hash3(
                    i +
                    vec3(
                      1,
                      0,
                      0
                    )
                  ),
                  f.x
                ),

                mix(
                  hash3(
                    i +
                    vec3(
                      0,
                      1,
                      0
                    )
                  ),

                  hash3(
                    i +
                    vec3(
                      1,
                      1,
                      0
                    )
                  ),

                  f.x
                ),

                f.y
              ),

              mix(
                mix(
                  hash3(
                    i +
                    vec3(
                      0,
                      0,
                      1
                    )
                  ),

                  hash3(
                    i +
                    vec3(
                      1,
                      0,
                      1
                    )
                  ),

                  f.x
                ),

                mix(
                  hash3(
                    i +
                    vec3(
                      0,
                      1,
                      1
                    )
                  ),

                  hash3(
                    i +
                    vec3(
                      1,
                      1,
                      1
                    )
                  ),

                  f.x
                ),

                f.y
              ),

              f.z
            );
          }

          float fbm3(vec3 p) {

            float v = 0.0;
            float a = 0.5;

            for (
              int i = 0;
              i < 4;
              i++
            ) {

              v +=
                a *
                noise3(p);

              p *=
                2.05;

              a *=
                0.5;
            }

            return v;
          }

          void main() {

            vec3 N =
              normalize(
                vNormal
              );

            vec3 V =
              normalize(
                vViewDir
              );

            vec3 L =
              normalize(
                uLightPos -
                vWorldPos
              );

            float diff =
              max(
                dot(N, L),
                0.0
              );

            float shadow =
              smoothstep(
                -0.2,
                0.4,
                dot(N, L)
              );

            float rim =
              pow(
                1.0 -
                max(
                  dot(N, V),
                  0.0
                ),
                3.0
              );

            float outerGlow =
              pow(
                1.0 -
                max(
                  dot(N, V),
                  0.0
                ),
                1.8
              );

            vec3 patchCoord =
              vWorldPos *
              0.06 +
              vec3(
                uTime *
                  0.004,
                0.0,
                uTime *
                  0.006
              );

            float patchNoise =
              fbm3(
                patchCoord
              );

            float patchMask =
              smoothstep(
                0.48,
                0.68,
                patchNoise
              ) *
              0.85;

            float breathe =
              0.65 +
              0.35 *
              sin(
                uTime *
                  0.22 +
                patchNoise *
                  8.0
              );

            patchMask *=
              breathe;

            vec3 planetBody =
              mix(
                uBaseColor *
                  0.15,

                uBaseColor *
                  0.85,

                diff *
                  shadow
              );

            planetBody =
              mix(
                planetBody,

                planetBody +
                  uPatchColor *
                  0.9,

                patchMask
              );

            vec3 col =
              planetBody +

              uAtmosphereColor *
                rim *
                1.6 +

              uGlowColor *
                outerGlow *
                0.35;

            float edgeAlpha =
              smoothstep(
                0.0,
                0.15,
                dot(N, V)
              );

            float alpha =
              (
                0.55 +
                rim * 0.45
              ) *
              edgeAlpha;

            gl_FragColor =
              vec4(
                col,
                alpha *
                  0.88
              );
          }
        `,
      });

    /*
     * LARGE PLANET
     */
    const planet1Mesh =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          32,
          32,
          32
        ),
        planetMaterial
      );

    planet1Mesh.position.set(
      -30,
      -22,
      -85
    );

    scene.add(
      planet1Mesh
    );

    /*
     * MEDIUM PLANET
     */
    const planet2Mesh =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          22,
          28,
          28
        ),
        planetMaterial
      );

    planet2Mesh.position.set(
      38,
      14,
      -95
    );

    scene.add(
      planet2Mesh
    );

    /*
     * SMALL PLANET
     */
    const planet3Mesh =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          14,
          24,
          24
        ),
        planetMaterial
      );

    planet3Mesh.position.set(
      32,
      -32,
      -110
    );

    scene.add(
      planet3Mesh
    );

    /* ==========================================================
       MOUSE
       ========================================================== */

    const mouse = {
      x: 0,
      y: 0,
      worldX: 0,
      worldY: 0,
      hasMoved: false,
    };

    const handlePointerMove = (
      event:
        | MouseEvent
        | TouchEvent
    ) => {

      let clientX = 0;
      let clientY = 0;

      if (
        'touches' in event &&
        event.touches.length
      ) {
        clientX =
          event.touches[0]
            .clientX;

        clientY =
          event.touches[0]
            .clientY;

      } else if (
        'clientX' in event
      ) {
        clientX =
          event.clientX;

        clientY =
          event.clientY;
      }

      mouse.x =
        (
          clientX /
          window.innerWidth
        ) *
          2 -
        1;

      mouse.y =
        -(
          (
            clientY /
            window.innerHeight
          ) *
            2 -
          1
        );

      mouse.worldX =
        mouse.x *
        45;

      mouse.worldY =
        mouse.y *
        35;

      mouse.hasMoved =
        true;
    };

    const handlePointerOver =
      () => {
        mouse.hasMoved =
          true;
      };

    const handlePointerOut =
      () => {
        mouse.hasMoved =
          false;
      };

    window.addEventListener(
      'mousemove',
      handlePointerMove
    );

    window.addEventListener(
      'touchmove',
      handlePointerMove,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'mouseover',
      handlePointerOver
    );

    window.addEventListener(
      'mouseout',
      handlePointerOut
    );

    /* ==========================================================
       SCROLL
       ========================================================== */

    let scrollVelocity =
      0;

    let lastScrollY =
      window.scrollY;

    const handleScroll =
      () => {

        const currentY =
          window.scrollY;

        scrollVelocity =
          currentY -
          lastScrollY;

        lastScrollY =
          currentY;
      };

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    /* ==========================================================
       RESIZE
       ========================================================== */

    const handleResize =
      () => {

        const width =
          window.innerWidth;

        const height =
          window.innerHeight;

        camera.aspect =
          width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
          width,
          height
        );
      };

    window.addEventListener(
      'resize',
      handleResize
    );

    /* ==========================================================
       ANIMATION
       ========================================================== */

    const clock =
      new THREE.Clock();

    let animationId = 0;
    let isRunning = true;
    let elapsed = 0;

    const currentNebulaA =
      new THREE.Color(
        initialConfig.nebulaA
      );

    const currentNebulaB =
      new THREE.Color(
        initialConfig.nebulaB
      );

    const currentNebulaC =
      new THREE.Color(
        initialConfig.nebulaC
      );

    const currentRock =
      new THREE.Color(
        initialConfig.rockColor
      );

    const currentRockRim =
      new THREE.Color(
        initialConfig.rockRimColor
      );

    const currentC1 =
      new THREE.Color(
        initialConfig.starColor1
      );

    const currentC2 =
      new THREE.Color(
        initialConfig.starColor2
      );

    const currentC3 =
      new THREE.Color(
        initialConfig.starColor3
      );

    const animate =
      () => {

        if (!isRunning) {
          return;
        }

        animationId =
          requestAnimationFrame(
            animate
          );

        const delta =
          Math.min(
            clock.getDelta(),
            0.05
          );

        elapsed +=
          delta;

        const activeTheme =
          themeRef.current;

        const targetConfig =
          globalSpaceThemeConfigs[
            activeTheme
          ] ||
          globalSpaceThemeConfigs[
            'tau-ceti'
          ];

        const themeLerp =
          Math.min(
            delta * 2.5,
            1
          );

        /* ======================================================
           THEME COLORS
           ====================================================== */

        currentC1.lerp(
          new THREE.Color(
            targetConfig.starColor1
          ),
          themeLerp
        );

        currentC2.lerp(
          new THREE.Color(
            targetConfig.starColor2
          ),
          themeLerp
        );

        currentC3.lerp(
          new THREE.Color(
            targetConfig.starColor3
          ),
          themeLerp
        );

        currentNebulaA.lerp(
          new THREE.Color(
            targetConfig.nebulaA
          ),
          themeLerp
        );

        currentNebulaB.lerp(
          new THREE.Color(
            targetConfig.nebulaB
          ),
          themeLerp
        );

        currentNebulaC.lerp(
          new THREE.Color(
            targetConfig.nebulaC
          ),
          themeLerp
        );

        currentRock.lerp(
          new THREE.Color(
            targetConfig.rockColor
          ),
          themeLerp
        );

        currentRockRim.lerp(
          new THREE.Color(
            targetConfig.rockRimColor
          ),
          themeLerp
        );

        /* ======================================================
           NEBULA
           ====================================================== */

        nebulaUniforms
          .uTime
          .value =
          elapsed;

        nebulaUniforms
          .uMouse
          .value.set(
            mouse.x,
            mouse.y
          );

        nebulaUniforms
          .uColorA
          .value.copy(
            currentNebulaA
          );

        nebulaUniforms
          .uColorB
          .value.copy(
            currentNebulaB
          );

        nebulaUniforms
          .uColorC
          .value.copy(
            currentNebulaC
          );

        nebulaUniforms
          .uPatchColor
          .value.set(
            activeTheme ===
            'tau-ceti'
              ? 0xff6a00
              : targetConfig.nebulaC
          );

        nebulaUniforms
          .uOpacity
          .value =
          THREE.MathUtils.lerp(
            nebulaUniforms
              .uOpacity
              .value,

            targetConfig
              .nebulaOpacity,

            themeLerp
          );

        /* ======================================================
           ASTEROIDS
           ====================================================== */

        rockUniforms
          .uRockColor
          .value.copy(
            currentRock
          );

        rockUniforms
          .uRimColor
          .value.copy(
            currentRockRim
          );

        rockUniforms
          .uLightPos
          .value.set(
            mouse.x * 40 -
              20,

            mouse.y * 30 +
              40,

            50
          );

        /* ======================================================
           STARS
           ====================================================== */

        starMaterial
          .uniforms
          .uTime
          .value =
          elapsed;

        const starPositionAttribute =
          starGeometry
            .attributes
            .position as THREE.BufferAttribute;

        const starColorAttribute =
          starGeometry
            .attributes
            .color as THREE.BufferAttribute;

        const starPositionArray =
          starPositionAttribute
            .array as Float32Array;

        const starColorArray =
          starColorAttribute
            .array as Float32Array;

        scrollVelocity *=
          0.92;

        const interactionRadius =
          isMobile
            ? 30
            : 45;

        const interactionRadiusSq =
          interactionRadius *
          interactionRadius;

        for (
          let i = 0;
          i < starCount;
          i++
        ) {

          const i3 =
            i * 3;

          if (
            !reducedMotion
          ) {

            starPositionArray[
              i3
            ] +=
              starVelocities[
                i3
              ];

            starPositionArray[
              i3 + 1
            ] +=
              starVelocities[
                i3 + 1
              ] -
              scrollVelocity *
                0.08;

            starPositionArray[
              i3 + 2
            ] +=
              starVelocities[
                i3 + 2
              ] +
              Math.abs(
                scrollVelocity
              ) *
                0.06;

            if (
              starPositionArray[
                i3 + 2
              ] >
              boundsZNear
            ) {

              starPositionArray[
                i3 + 2
              ] =
                boundsZFar;

              starPositionArray[
                i3
              ] =
                (
                  Math.random() -
                  0.5
                ) *
                boundsX *
                2;

              starPositionArray[
                i3 + 1
              ] =
                (
                  Math.random() -
                  0.5
                ) *
                boundsY *
                2;
            }

            if (
              starPositionArray[
                i3
              ] >
              boundsX
            ) {
              starPositionArray[
                i3
              ] =
                -boundsX;
            }

            if (
              starPositionArray[
                i3
              ] <
              -boundsX
            ) {
              starPositionArray[
                i3
              ] =
                boundsX;
            }

            if (
              starPositionArray[
                i3 + 1
              ] >
              boundsY
            ) {
              starPositionArray[
                i3 + 1
              ] =
                -boundsY;
            }

            if (
              starPositionArray[
                i3 + 1
              ] <
              -boundsY
            ) {
              starPositionArray[
                i3 + 1
              ] =
                boundsY;
            }

            if (
              mouse.hasMoved
            ) {

              const dx =
                starPositionArray[
                  i3
                ] -
                mouse.worldX;

              const dy =
                starPositionArray[
                  i3 + 1
                ] -
                mouse.worldY;

              const distanceSq =
                dx * dx +
                dy * dy;

              if (
                distanceSq <
                  interactionRadiusSq &&
                distanceSq >
                  0.01
              ) {

                const distance =
                  Math.sqrt(
                    distanceSq
                  );

                const force =
                  (
                    1 -
                    distance /
                      interactionRadius
                  ) *
                  0.85;

                starPositionArray[
                  i3
                ] +=
                  (
                    dx /
                    distance
                  ) *
                  force;

                starPositionArray[
                  i3 + 1
                ] +=
                  (
                    dy /
                    distance
                  ) *
                  force;
              }
            }
          }

          const colorIndex =
            i % 3;

          const targetColor =
            colorIndex === 0
              ? currentC1
              : colorIndex === 1
              ? currentC2
              : currentC3;

          starColorArray[
            i3
          ] =
            targetColor.r;

          starColorArray[
            i3 + 1
          ] =
            targetColor.g;

          starColorArray[
            i3 + 2
          ] =
            targetColor.b;
        }

        starPositionAttribute
          .needsUpdate =
          true;

        starColorAttribute
          .needsUpdate =
          true;

        /* ======================================================
           ASTEROIDS
           ====================================================== */

        if (
          !reducedMotion
        ) {

          for (
            let i = 0;
            i < rockCount;
            i++
          ) {

            const rock =
              rocksData[i];

            rock.rot.x +=
              rock.rotSpeed.x;

            rock.rot.y +=
              rock.rotSpeed.y;

            rock.rot.z +=
              rock.rotSpeed.z;

            rock.pos.add(
              rock.driftSpeed
            );

            if (
              rock.pos.z >
              20
            ) {
              rock.pos.z =
                -100;
            }

            if (
              rock.pos.x >
              boundsX * 1.2
            ) {
              rock.pos.x =
                -boundsX * 1.2;
            }

            if (
              rock.pos.x <
              -boundsX * 1.2
            ) {
              rock.pos.x =
                boundsX * 1.2;
            }

            if (
              rock.pos.y >
              boundsY * 1.2
            ) {
              rock.pos.y =
                -boundsY * 1.2;
            }

            if (
              rock.pos.y <
              -boundsY * 1.2
            ) {
              rock.pos.y =
                boundsY * 1.2;
            }

            dummy.position.copy(
              rock.pos
            );

            dummy.rotation.copy(
              rock.rot
            );

            dummy.scale.setScalar(
              rock.scale
            );

            dummy.updateMatrix();

            rockInstanced.setMatrixAt(
              i,
              dummy.matrix
            );
          }

          rockInstanced
            .instanceMatrix
            .needsUpdate =
            true;
        }

        /* ======================================================
           SHOOTING STARS
           ====================================================== */

        const meteorPositionAttribute =
          meteorGeometry
            .attributes
            .position as THREE.BufferAttribute;

        const meteorColorAttribute =
          meteorGeometry
            .attributes
            .color as THREE.BufferAttribute;

        const meteorPositionArray =
          meteorPositionAttribute
            .array as Float32Array;

        const meteorColorArray =
          meteorColorAttribute
            .array as Float32Array;

        const shootingColor =
          targetConfig
            .shootingStarColor;

        for (
          let i = 0;
          i < meteorCount;
          i++
        ) {

          const meteor =
            meteors[i];

          const index =
            i * 6;

          if (
            !meteor.active
          ) {

            meteor.delay -=
              delta;

            if (
              meteor.delay <=
                0 &&
              !reducedMotion
            ) {

              meteor.active =
                true;

              meteor.life =
                0;

              meteor.head.set(

                (
                  Math.random() -
                  0.2
                ) *
                  boundsX *
                  1.5,

                (
                  Math.random() +
                  0.2
                ) *
                  boundsY *
                  1.2,

                -50 -
                  Math.random() *
                    60
              );

              const angle =
                -0.35 -
                Math.random() *
                  0.35;

              meteor.dir.set(
                Math.cos(angle),
                Math.sin(angle),
                0
              ).normalize();

            } else {

              for (
                let j = 0;
                j < 6;
                j++
              ) {
                meteorPositionArray[
                  index + j
                ] = 0;
              }

              continue;
            }
          }

          meteor.life +=
            delta * 1.4;

          meteor.head.addScaledVector(
            meteor.dir,
            meteor.speed
          );

          const tail =
            meteor.head
              .clone()
              .addScaledVector(
                meteor.dir,
                -meteor.length
              );

          const fade =
            Math.sin(
              Math.min(
                meteor.life,
                1
              ) *
                Math.PI
            );

          meteorPositionArray[
            index
          ] =
            meteor.head.x;

          meteorPositionArray[
            index + 1
          ] =
            meteor.head.y;

          meteorPositionArray[
            index + 2
          ] =
            meteor.head.z;

          meteorPositionArray[
            index + 3
          ] =
            tail.x;

          meteorPositionArray[
            index + 4
          ] =
            tail.y;

          meteorPositionArray[
            index + 5
          ] =
            tail.z;

          meteorColorArray[
            index
          ] =
            shootingColor[0] *
            fade;

          meteorColorArray[
            index + 1
          ] =
            shootingColor[1] *
            fade;

          meteorColorArray[
            index + 2
          ] =
            shootingColor[2] *
            fade;

          meteorColorArray[
            index + 3
          ] =
            shootingColor[0] *
            fade *
            0.15;

          meteorColorArray[
            index + 4
          ] =
            shootingColor[1] *
            fade *
            0.15;

          meteorColorArray[
            index + 5
          ] =
            shootingColor[2] *
            fade *
            0.15;

          if (
            meteor.life >=
            1
          ) {

            meteor.active =
              false;

            meteor.delay =
              3 +
              Math.random() *
                7;
          }
        }

        meteorPositionAttribute
          .needsUpdate =
          true;

        meteorColorAttribute
          .needsUpdate =
          true;

        /* ======================================================
           AURORA
           ====================================================== */

        auroraUniforms
          .uTime
          .value =
          elapsed;

        auroraUniforms
          .uColorA
          .value.copy(
            currentNebulaA
          );

        auroraUniforms
          .uColorC
          .value.copy(
            currentNebulaC
          );

        /* ======================================================
           PLANETS
           ====================================================== */

        planetUniforms
          .uBaseColor
          .value.copy(
            currentNebulaB
          );

        planetUniforms
          .uAtmosphereColor
          .value.copy(
            currentNebulaC
          );

        planetUniforms
          .uGlowColor
          .value.copy(
            currentC2
          );

        planetUniforms
          .uPatchColor
          .value.set(
            activeTheme ===
            'tau-ceti'
              ? 0xff6a00
              : targetConfig.starColor2
          );

        planetUniforms
          .uTime
          .value =
          elapsed;

        /*
         * Tau Ceti planets are intentionally STATIC.
         *
         * Other themes retain their old rotation.
         */
        if (
          !reducedMotion &&
          activeTheme !==
            'tau-ceti'
        ) {

          planet1Mesh.rotation.y =
            elapsed *
            0.015;

          planet2Mesh.rotation.y =
            -elapsed *
            0.02;

          planet3Mesh.rotation.y =
            elapsed *
            0.025;
        }

        /* ======================================================
           RENDER
           ====================================================== */

        renderer.render(
          scene,
          camera
        );
      };

    animate();

    /* ==========================================================
       CLEANUP
       ========================================================== */

    return () => {

      isRunning =
        false;

      cancelAnimationFrame(
        animationId
      );

      window.removeEventListener(
        'mousemove',
        handlePointerMove
      );

      window.removeEventListener(
        'touchmove',
        handlePointerMove
      );

      window.removeEventListener(
        'mouseover',
        handlePointerOver
      );

      window.removeEventListener(
        'mouseout',
        handlePointerOut
      );

      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      nebulaMesh
        .geometry
        .dispose();

      nebulaMaterial.dispose();

      starGeometry.dispose();
      starMaterial.dispose();

      rockGeometry.dispose();
      rockMaterial.dispose();

      meteorGeometry.dispose();
      meteorMaterial.dispose();

      auroraMeshes.forEach(
        (mesh) => {
          mesh.geometry.dispose();
        }
      );

      auroraMaterial.dispose();

      planet1Mesh
        .geometry
        .dispose();

      planet2Mesh
        .geometry
        .dispose();

      planet3Mesh
        .geometry
        .dispose();

      planetMaterial.dispose();

      renderer.dispose();

      if (
        renderer.domElement &&
        renderer.domElement.parentNode
      ) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  /* ============================================================
     CONTAINER
     ============================================================ */

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="global-space-bg"
      style={{
        position: 'fixed',

        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        width: '100vw',
        height: '100vh',

        pointerEvents: 'none',

        /*
         * Keep it behind website content.
         */
        zIndex: 0,

        /*
         * Hero = 0
         * About onward = 1
         */
        opacity:
          inActiveArea
            ? 1
            : 0,

        transition:
          'opacity 900ms cubic-bezier(0.16, 1, 0.3, 1)',

        willChange:
          'opacity',

        overflow:
          'hidden',

        isolation:
          'isolate',
      }}
    />
  );
};

export default GlobalThemeBackground;