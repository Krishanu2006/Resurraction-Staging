import React, {
  useEffect,
  useRef,
} from 'react';

import * as THREE from 'three';

import { type ThemeId } from '../../config/theme';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';


interface SpaceSceneProps {
  scrollProgress?: number;
  themeId?: ThemeId;
}

const clamp = (
  value: number,
  min = 0,
  max = 1
) =>
  Math.max(
    min,
    Math.min(max, value)
  );

const lerp = (
  a: number,
  b: number,
  t: number
) =>
  a + (b - a) * t;

const smoothstep = (
  t: number
) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

const SpaceScene: React.FC<
  SpaceSceneProps
> = ({
  scrollProgress = 0,
}) => {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const scrollRef =
    useRef(scrollProgress);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isDown: false,
    dragX: 0,
    dragY: 0,
    dragStartX: 0,
    dragStartY: 0,
  });

  const interactionRef =
    useRef({
      focus:
        null as THREE.Object3D | null,
      focusStrength: 0,
    });

  useEffect(() => {
    scrollRef.current =
      scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) return;

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const isMobile =
      window.innerWidth < 768;

    /* ============================================================
     * SCENE
     * ============================================================ */

    const scene =
      new THREE.Scene();

    scene.background =
      new THREE.Color(
        0x010207
      );

    scene.fog =
      new THREE.FogExp2(
        0x010207,
        0.00045
      );

    /* ============================================================
     * CAMERA
     * ============================================================ */

    const camera =
      new THREE.PerspectiveCamera(
        48,
        window.innerWidth /
          window.innerHeight,
        0.1,
        3000
      );

    camera.position.set(
      0,
      0,
      8
    );

    /* ============================================================
     * RENDERER
     * ============================================================ */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference:
          'high-performance',
      });

    const pixelRatio =
      Math.min(
        window.devicePixelRatio ||
          1,
        isMobile
          ? 1.25
          : 1.75
      );

    renderer.setPixelRatio(
      pixelRatio
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      1.05;

    container.appendChild(
      renderer.domElement
    );

    /* ============================================================
     * POST PROCESSING
     * ============================================================ */

    const composer =
      new EffectComposer(
        renderer
      );

    const renderPass =
      new RenderPass(
        scene,
        camera
      );

    composer.addPass(
      renderPass
    );

    const bloom =
      new UnrealBloomPass(
        new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ),
        0.72,
        0.75,
        0.12
      );

    composer.addPass(
      bloom
    );

    composer.addPass(
      new OutputPass()
    );

    /* ============================================================
     * STAR FIELD
     * ============================================================ */

    const STELLAR_COLORS = [
      0x9bb0ff,
      0xaabfff,
      0xcad7ff,
      0xf8f7ff,
      0xfff4ea,
      0xffd2a1,
      0xffb56c,
    ];

    const pickStarColor =
      () => {
        const r =
          Math.random();

        if (r < 0.04)
          return STELLAR_COLORS[0];

        if (r < 0.14)
          return STELLAR_COLORS[1];

        if (r < 0.32)
          return STELLAR_COLORS[2];

        if (r < 0.50)
          return STELLAR_COLORS[3];

        if (r < 0.68)
          return STELLAR_COLORS[4];

        if (r < 0.85)
          return STELLAR_COLORS[5];

        return STELLAR_COLORS[6];
      };

    const starGroup =
      new THREE.Group();

    scene.add(
      starGroup
    );

    interface StarLayer {
      points: THREE.Points;
      material: THREE.ShaderMaterial;
      geometry: THREE.BufferGeometry;
    }

    const starLayers:
      StarLayer[] = [];

    const createStarLayer = (
      count: number,
      spread: number,
      size: number,
      twinkle: number,
      milkyWayBias: number,
      brightness: number
    ) => {
      const positions =
        new Float32Array(
          count * 3
        );

      const colors =
        new Float32Array(
          count * 3
        );

      const phases =
        new Float32Array(
          count
        );

      const sizes =
        new Float32Array(
          count
        );

      const tmpColor =
        new THREE.Color();

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const i3 =
          i * 3;

        let x =
          (Math.random() -
            0.5) *
          spread;

        let y =
          (Math.random() -
            0.5) *
          spread;

        let z =
          -Math.random() *
          spread;

        if (
          Math.random() <
          milkyWayBias
        ) {
          y =
            (Math.random() -
              0.5) *
            spread *
            0.18;

          z =
            -Math.random() *
              spread *
              0.4 -
            60;
        } else {
          y *= 0.72;
        }

        positions[i3] =
          x;

        positions[i3 + 1] =
          y;

        positions[i3 + 2] =
          z;

        tmpColor.setHex(
          pickStarColor()
        );

        const b =
          (0.7 +
            Math.random() *
              0.4) *
          brightness;

        colors[i3] =
          tmpColor.r * b;

        colors[i3 + 1] =
          tmpColor.g * b;

        colors[i3 + 2] =
          tmpColor.b * b;

        phases[i] =
          Math.random() *
          Math.PI *
          2;

        sizes[i] =
          size *
          (0.55 +
            Math.random() *
              0.85);
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
        'aPhase',
        new THREE.BufferAttribute(
          phases,
          1
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
            uTime: {
              value: 0,
            },

            uPixelRatio: {
              value:
                pixelRatio,
            },

            uTwinkle: {
              value:
                twinkle,
            },
          },

          vertexShader:
            /* glsl */ `
              attribute float aPhase;
              attribute float aSize;
              attribute vec3 color;

              uniform float uTime;
              uniform float uPixelRatio;
              uniform float uTwinkle;

              varying vec3 vColor;
              varying float vTwinkle;

              void main() {
                vColor = color;

                float tw =
                  sin(
                    uTime *
                    1.5 +
                    aPhase *
                    6.2831
                  ) *
                  0.5 +
                  0.5;

                vTwinkle =
                  mix(
                    1.0,
                    0.55 +
                    tw *
                    0.75,
                    uTwinkle
                  );

                vec4 mv =
                  modelViewMatrix *
                  vec4(
                    position,
                    1.0
                  );

                gl_Position =
                  projectionMatrix *
                  mv;

                gl_PointSize =
                  aSize *
                  uPixelRatio;
              }
            `,

          fragmentShader:
            /* glsl */ `
              varying vec3 vColor;
              varying float vTwinkle;

              void main() {
                vec2 c =
                  gl_PointCoord -
                  0.5;

                float d =
                  length(c);

                float core =
                  smoothstep(
                    0.5,
                    0.02,
                    d
                  );

                float halo =
                  smoothstep(
                    0.5,
                    0.18,
                    d
                  ) *
                  0.28;

                float alpha =
                  pow(
                    core,
                    1.35
                  ) +
                  halo;

                if (
                  alpha <
                  0.01
                ) {
                  discard;
                }

                vec3 col =
                  vColor *
                  vTwinkle;

                gl_FragColor =
                  vec4(
                    col,
                    alpha
                  );
              }
            `,
        });

      const points =
        new THREE.Points(
          geometry,
          material
        );

      starGroup.add(
        points
      );

      starLayers.push({
        points,
        material,
        geometry,
      });
    };

    createStarLayer(
      isMobile
        ? 1500
        : 2600,
      850,
      1.3,
      0.35,
      0.30,
      1.0
    );

    createStarLayer(
      isMobile
        ? 800
        : 1300,
      600,
      2.0,
      0.55,
      0.40,
      1.05
    );

    createStarLayer(
      isMobile
        ? 400
        : 650,
      400,
      3.0,
      0.75,
      0.50,
      1.10
    );

    /* ============================================================
     * COLORED STAR CLUSTERS
     * ============================================================ */

    const createStarCluster = (
      count: number,
      radius: number,
      color: number,
      opacity: number
    ) => {
      const positions =
        new Float32Array(
          count * 3
        );

      const sizes =
        new Float32Array(
          count
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const i3 =
          i * 3;

        const angle =
          Math.random() *
          Math.PI *
          2;

        const distance =
          Math.pow(
            Math.random(),
            0.65
          ) *
          radius;

        positions[i3] =
          Math.cos(angle) *
          distance;

        positions[i3 + 1] =
          (Math.random() -
            0.5) *
          radius *
          0.45;

        positions[i3 + 2] =
          -80 -
          Math.random() *
            160;

        sizes[i] =
          0.7 +
          Math.random() *
            0.9;
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
            uColor: {
              value:
                new THREE.Color(
                  color
                ),
            },

            uOpacity: {
              value:
                opacity,
            },

            uPixelRatio: {
              value:
                pixelRatio,
            },
          },

          vertexShader:
            /* glsl */ `
              attribute float aSize;

              uniform float uPixelRatio;

              void main() {
                vec4 mv =
                  modelViewMatrix *
                  vec4(
                    position,
                    1.0
                  );

                gl_Position =
                  projectionMatrix *
                  mv;

                gl_PointSize =
                  aSize *
                  uPixelRatio *
                  1.9;
              }
            `,

          fragmentShader:
            /* glsl */ `
              uniform vec3 uColor;
              uniform float uOpacity;

              void main() {
                vec2 c =
                  gl_PointCoord -
                  0.5;

                float d =
                  length(c);

                float a =
                  smoothstep(
                    0.5,
                    0.05,
                    d
                  );

                a *= a;

                if (
                  a <
                  0.01
                ) {
                  discard;
                }

                gl_FragColor =
                  vec4(
                    uColor,
                    a *
                    uOpacity
                  );
              }
            `,
        });

      const points =
        new THREE.Points(
          geometry,
          material
        );

      scene.add(
        points
      );

      return {
        points,
        material,
      };
    };

    const greenCluster =
      createStarCluster(
        700,
        120,
        0x7cff9b,
        0.16
      );

    const yellowCluster =
      createStarCluster(
        450,
        100,
        0xffdf6b,
        0.14
      );

    const orangeCluster =
      createStarCluster(
        300,
        80,
        0xff9a45,
        0.12
      );

    /* ============================================================
     * PROCEDURAL NEBULA
     * ============================================================ */

    const createNebulaMaterial =
      (
        opacity: number
      ) =>
        new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending:
            THREE.AdditiveBlending,

          uniforms: {
            uTime: {
              value: 0,
            },

            uOpacity: {
              value:
                opacity,
            },

            uMouse: {
              value:
                new THREE.Vector2(
                  0,
                  0
                ),
            },
          },

          vertexShader:
            /* glsl */ `
              varying vec2 vUv;

              void main() {
                vUv = uv;

                vec4 mv =
                  modelViewMatrix *
                  vec4(
                    position,
                    1.0
                  );

                gl_Position =
                  projectionMatrix *
                  mv;
              }
            `,

          fragmentShader:
            /* glsl */ `
              varying vec2 vUv;

              uniform float uTime;
              uniform float uOpacity;
              uniform vec2 uMouse;

              float hash(
                vec2 p
              ) {
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

              float noise(
                vec2 p
              ) {
                vec2 i =
                  floor(p);

                vec2 f =
                  fract(p);

                f =
                  f *
                  f *
                  (
                    3.0 -
                    2.0 *
                    f
                  );

                return mix(
                  mix(
                    hash(i),
                    hash(
                      i +
                      vec2(
                        1.0,
                        0.0
                      )
                    ),
                    f.x
                  ),

                  mix(
                    hash(
                      i +
                      vec2(
                        0.0,
                        1.0
                      )
                    ),

                    hash(
                      i +
                      vec2(
                        1.0,
                        1.0
                      )
                    ),

                    f.x
                  ),

                  f.y
                );
              }

              float fbm(
                vec2 p
              ) {
                float v =
                  0.0;

                float a =
                  0.5;

                mat2 rot =
                  mat2(
                    0.8,
                    0.6,
                    -0.6,
                    0.8
                  );

                for (
                  int i = 0;
                  i < 6;
                  i++
                ) {
                  v +=
                    a *
                    noise(p);

                  p =
                    rot *
                    p *
                    2.02;

                  a *=
                    0.5;
                }

                return v;
              }

              float warpedFbm(
                vec2 p,
                float t
              ) {
                vec2 q =
                  vec2(
                    fbm(
                      p +
                      vec2(
                        0.0,
                        t *
                        0.05
                      )
                    ),

                    fbm(
                      p +
                      vec2(
                        5.2,
                        1.3
                      )
                    )
                  );

                vec2 r =
                  vec2(
                    fbm(
                      p +
                      4.0 *
                      q +
                      vec2(
                        1.7,
                        9.2
                      ) +
                      t *
                      0.03
                    ),

                    fbm(
                      p +
                      4.0 *
                      q +
                      vec2(
                        8.3,
                        2.8
                      ) -
                      t *
                      0.04
                    )
                  );

                return fbm(
                  p +
                  4.0 *
                  r
                );
              }

              void main() {
                vec2 uv =
                  vUv -
                  0.5;

                uv.x *=
                  1.65;

                uv +=
                  uMouse *
                  0.02;

                float d =
                  length(uv);

                vec2 stretched =
                  uv;

                stretched.y *=
                  1.35;

                float n =
                  warpedFbm(
                    stretched *
                    2.6,
                    uTime
                  );

                float cloud =
                  smoothstep(
                    0.80,
                    0.05,
                    d
                  );

                cloud *=
                  smoothstep(
                    0.28,
                    0.75,
                    n
                  );

                vec3 green =
                  vec3(
                    0.10,
                    0.65,
                    0.31
                  );

                vec3 yellow =
                  vec3(
                    0.95,
                    0.72,
                    0.18
                  );

                vec3 orange =
                  vec3(
                    0.95,
                    0.28,
                    0.08
                  );

                float greenMask =
                  smoothstep(
                    0.15,
                    0.65,
                    n
                  );

                float orangeMask =
                  smoothstep(
                    0.72,
                    0.92,
                    n
                  );

                vec3 color =
                  mix(
                    green,
                    yellow,
                    greenMask
                  );

                color =
                  mix(
                    color,
                    orange,
                    orangeMask
                  );

                color +=
                  vec3(
                    0.04,
                    0.07,
                    0.14
                  ) *
                  smoothstep(
                    0.55,
                    0.9,
                    d
                  );

                float edge =
                  smoothstep(
                    0.85,
                    0.15,
                    d
                  );

                float alpha =
                  cloud *
                  edge *
                  uOpacity;

                gl_FragColor =
                  vec4(
                    color,
                    alpha
                  );
              }
            `,
        });

    const nebulaMaterial =
      createNebulaMaterial(
        0.32
      );

    const nebula =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          900,
          520
        ),
        nebulaMaterial
      );

    nebula.position.set(
      0,
      15,
      -260
    );

    nebula.rotation.z =
      -0.16;

    scene.add(
      nebula
    );

    const backMaterial =
      createNebulaMaterial(
        0.18
      );

    const nebulaBack =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          900,
          520
        ),
        backMaterial
      );

    nebulaBack.position.set(
      -100,
      -35,
      -520
    );

    nebulaBack.scale.set(
      1.5,
      1.15,
      1
    );

    nebulaBack.rotation.z =
      0.22;

    scene.add(
      nebulaBack
    );

    /* ============================================================
     * TAU CETI e — ADRIAN
     * ============================================================ */

    const planetGroup =
      new THREE.Group();

    const planetTexture =
      new THREE.TextureLoader().load(
        '/assets/hero/tau-ceti-adrian.jpg'
      );

    planetTexture.colorSpace =
      THREE.SRGBColorSpace;

    planetTexture.minFilter =
      THREE.LinearMipmapLinearFilter;

    planetTexture.magFilter =
      THREE.LinearFilter;

    planetTexture.anisotropy =
      renderer.capabilities.getMaxAnisotropy();

    const planetUniforms = {
      uPlanetTexture: {
        value:
          planetTexture,
      },

      uHoverBoost: {
        value: 0,
      },
    };

    const planetMaterial =
      new THREE.ShaderMaterial({
        uniforms:
          planetUniforms,

        transparent:
          true,

        depthWrite:
          true,

        side:
          THREE.FrontSide,

        vertexShader:
          /* glsl */ `
            varying vec3 vNormal;
            varying vec3 vWorldPos;
            varying vec3 vObjPos;

            void main() {
              vNormal =
                normalize(
                  normalMatrix *
                  normal
                );

              vObjPos =
                position;

              vec4 world =
                modelMatrix *
                vec4(
                  position,
                  1.0
                );

              vWorldPos =
                world.xyz;

              gl_Position =
                projectionMatrix *
                viewMatrix *
                world;
            }
          `,

        fragmentShader:
          /* glsl */ `
            uniform sampler2D uPlanetTexture;
            uniform float uHoverBoost;

            varying vec3 vNormal;
            varying vec3 vWorldPos;
            varying vec3 vObjPos;

            void main() {

              vec3 p =
                normalize(
                  vObjPos
                );

              if (
                p.z <
                -0.02
              ) {
                discard;
              }

              vec2 uv =
                p.xy *
                0.5 +
                0.5;

              float distanceFromCenter =
                distance(
                  uv,
                  vec2(
                    0.5
                  )
                );

              float planetMask =
                1.0 -
                smoothstep(
                  0.455,
                  0.505,
                  distanceFromCenter
                );

              if (
                planetMask <
                0.01
              ) {
                discard;
              }

              uv =
                (
                  uv -
                  0.5
                ) *
                1.05 +
                0.5;

              uv =
                clamp(
                  uv,
                  0.001,
                  0.999
                );

              vec4 reference =
                texture2D(
                  uPlanetTexture,
                  uv
                );

              vec3 N =
                normalize(
                  vNormal
                );

              vec3 V =
                normalize(
                  cameraPosition -
                  vWorldPos
                );

              vec3 L =
                normalize(
                  vec3(
                    -0.6,
                    0.5,
                    1.0
                  )
                );

              float NdotL =
                dot(
                  N,
                  L
                );

              float lit =
                smoothstep(
                  -0.25,
                  1.0,
                  NdotL
                );

              float lighting =
                0.52 +
                lit *
                0.70;

              vec3 color =
                reference.rgb *
                lighting;

              float luminance =
                dot(
                  color,
                  vec3(
                    0.2126,
                    0.7152,
                    0.0722
                  )
                );

              color =
                mix(
                  vec3(
                    luminance
                  ),
                  color,
                  1.18
                );

              float fresnel =
                1.0 -
                max(
                  dot(
                    N,
                    V
                  ),
                  0.0
                );

              fresnel =
                pow(
                  fresnel,
                  3.8
                );

              color +=
                vec3(
                  0.18,
                  1.0,
                  0.08
                ) *
                fresnel *
                (
                  0.18 +
                  uHoverBoost *
                  0.08
                );

              color +=
                vec3(
                  1.0,
                  0.28,
                  0.035
                ) *
                fresnel *
                0.035;

              gl_FragColor =
                vec4(
                  color,
                  planetMask
                );
            }
          `,
      });

    const planet =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          24,
          128,
          96
        ),
        planetMaterial
      );

    planetGroup.add(
      planet
    );

    const atmosphereMaterial =
      new THREE.ShaderMaterial({
        transparent:
          true,

        side:
          THREE.BackSide,

        blending:
          THREE.AdditiveBlending,

        depthWrite:
          false,

        uniforms: {
          glowColor: {
            value:
              new THREE.Color(
                0x9cff80
              ),
          },

          uBoost: {
            value: 0,
          },
        },

        vertexShader:
          /* glsl */ `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
              vNormal =
                normalize(
                  normalMatrix *
                  normal
                );

              vec4 worldPosition =
                modelMatrix *
                vec4(
                  position,
                  1.0
                );

              vWorldPosition =
                worldPosition.xyz;

              gl_Position =
                projectionMatrix *
                viewMatrix *
                worldPosition;
            }
          `,

        fragmentShader:
          /* glsl */ `
            uniform vec3 glowColor;
            uniform float uBoost;

            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {

              vec3 viewDir =
                normalize(
                  cameraPosition -
                  vWorldPosition
                );

              float intensity =
                pow(
                  1.0 -
                  max(
                    dot(
                      vNormal,
                      viewDir
                    ),
                    0.0
                  ),
                  3.8
                );

              gl_FragColor =
                vec4(
                  glowColor,
                  intensity *
                  (
                    0.30 +
                    uBoost *
                    0.18
                  )
                );
            }
          `,
      });

    const atmosphere =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          25.5,
          96,
          64
        ),
        atmosphereMaterial
      );

    planetGroup.add(
      atmosphere
    );

    planetGroup.position.set(
      115,
      -35,
      -420
    );

    planetGroup.rotation.y =
      -0.5;

    planetGroup.scale.setScalar(
      0.72
    );

    scene.add(
      planetGroup
    );

    /* ------------------------------------------------------------
     * SCENE LIGHTING
     * ------------------------------------------------------------ */

    const sunLight =
      new THREE.DirectionalLight(
        0xffd89a,
        2.5
      );

    sunLight.position.set(
      -180,
      120,
      80
    );

    scene.add(
      sunLight
    );

    scene.add(
      new THREE.AmbientLight(
        0x23382d,
        0.25
      )
    );

    /* ============================================================
     * SPACE DUST
     * ============================================================ */

    const dustCount =
      isMobile
        ? 700
        : 1400;

    const dustPositions =
      new Float32Array(
        dustCount * 3
      );

    const dustSizes =
      new Float32Array(
        dustCount
      );

    for (
      let i = 0;
      i < dustCount;
      i++
    ) {
      const i3 =
        i * 3;

      dustPositions[i3] =
        (
          Math.random() -
          0.5
        ) *
        280;

      dustPositions[i3 + 1] =
        (
          Math.random() -
          0.5
        ) *
        180;

      dustPositions[i3 + 2] =
        -Math.random() *
        800;

      dustSizes[i] =
        0.35 +
        Math.random() *
          0.55;
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
              pixelRatio,
          },

          uOpacity: {
            value:
              0.20,
          },
        },

        vertexShader:
          /* glsl */ `
            attribute float aSize;

            uniform float uPixelRatio;

            void main() {
              vec4 mv =
                modelViewMatrix *
                vec4(
                  position,
                  1.0
                );

              gl_Position =
                projectionMatrix *
                mv;

              gl_PointSize =
                aSize *
                uPixelRatio *
                1.5;
            }
          `,

        fragmentShader:
          /* glsl */ `
            uniform float uOpacity;

            void main() {
              vec2 c =
                gl_PointCoord -
                0.5;

              float d =
                length(c);

              float a =
                smoothstep(
                  0.5,
                  0.0,
                  d
                );

              if (
                a <
                0.01
              ) {
                discard;
              }

              gl_FragColor =
                vec4(
                  vec3(
                    0.72,
                    0.78,
                    0.72
                  ),
                  a *
                  uOpacity
                );
            }
          `,
      });

    const dust =
      new THREE.Points(
        dustGeometry,
        dustMaterial
      );

    scene.add(
      dust
    );

    /* ============================================================
     * SHOOTING STARS
     * ============================================================ */

    const shootingStarGroup =
      new THREE.Group();

    scene.add(
      shootingStarGroup
    );

    interface ShootingStar {
      line: THREE.Line;
      material: THREE.LineBasicMaterial;
      life: number;
      delay: number;
      active: boolean;
      speed: number;
      dir: THREE.Vector3;
    }

    const shootingStars:
      ShootingStar[] = [];

    const createShootingStar =
      () => {
        const segmentCount =
          24;

        const positions =
          new Float32Array(
            segmentCount * 3
          );

        const geometry =
          new THREE.BufferGeometry();

        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(
            positions,
            3
          )
        );

        const colors =
          new Float32Array(
            segmentCount * 3
          );

        for (
          let i = 0;
          i < segmentCount;
          i++
        ) {
          const t =
            i /
            (
              segmentCount -
              1
            );

          const fade =
            1.0 -
            t;

          colors[i * 3] =
            1.0 *
            fade;

          colors[i * 3 + 1] =
            0.9 *
            fade;

          colors[i * 3 + 2] =
            0.66 *
            fade;
        }

        geometry.setAttribute(
          'color',
          new THREE.BufferAttribute(
            colors,
            3
          )
        );

        const material =
          new THREE.LineBasicMaterial({
            vertexColors:
              true,

            transparent:
              true,

            opacity:
              0,

            blending:
              THREE.AdditiveBlending,

            depthWrite:
              false,
          });

        const line =
          new THREE.Line(
            geometry,
            material
          );

        line.visible =
          false;

        shootingStarGroup.add(
          line
        );

        shootingStars.push({
          line,
          material,
          life: 0,
          delay:
            Math.random() *
              8 +
            3,

          active:
            false,

          speed:
            0.8 +
            Math.random() *
              0.7,

          dir:
            new THREE.Vector3(
              1,
              -0.25,
              0
            ).normalize(),
        });
      };

    const shootingStarCount =
      isMobile
        ? 2
        : 4;

    for (
      let i = 0;
      i <
      shootingStarCount;
      i++
    ) {
      createShootingStar();
    }

    /* ============================================================
     * POINTER / DRAG
     * ============================================================ */

    const m =
      mouseRef.current;

    const updatePointer =
      (
        cx: number,
        cy: number
      ) => {
        m.targetX =
          (
            cx /
            window.innerWidth
          ) *
            2 -
          1;

        m.targetY =
          (
            cy /
            window.innerHeight
          ) *
            2 -
          1;
      };

    const handlePointerMove =
      (
        event: PointerEvent
      ) => {
        updatePointer(
          event.clientX,
          event.clientY
        );

        if (
          m.isDown
        ) {
          m.dragX =
            (
              event.clientX -
              m.dragStartX
            ) /
            window.innerWidth;

          m.dragY =
            (
              event.clientY -
              m.dragStartY
            ) /
            window.innerHeight;
        }
      };

    const handlePointerDown =
      (
        event: PointerEvent
      ) => {
        m.isDown =
          true;

        m.dragStartX =
          event.clientX;

        m.dragStartY =
          event.clientY;

        m.dragX =
          0;

        m.dragY =
          0;
      };

    const handlePointerUp =
      () => {
        m.isDown =
          false;

        m.dragX *=
          0.4;

        m.dragY *=
          0.4;
      };

    const handleDoubleClick =
      () => {
        const targets:
          THREE.Object3D[] =
          [
            planetGroup,
            nebula,
            nebulaBack,
          ];

        interactionRef.current.focus =
          targets[
            Math.floor(
              Math.random() *
                targets.length
            )
          ];
      };

    const handleKeyDown =
      (
        event: KeyboardEvent
      ) => {
        if (
          event.code ===
          'ArrowLeft'
        ) {
          m.targetX -=
            0.1;
        }

        if (
          event.code ===
          'ArrowRight'
        ) {
          m.targetX +=
            0.1;
        }

        if (
          event.code ===
          'ArrowUp'
        ) {
          m.targetY -=
            0.1;
        }

        if (
          event.code ===
          'ArrowDown'
        ) {
          m.targetY +=
            0.1;
        }
      };

    window.addEventListener(
      'pointermove',
      handlePointerMove,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'pointerdown',
      handlePointerDown,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'pointerup',
      handlePointerUp,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'pointercancel',
      handlePointerUp,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'dblclick',
      handleDoubleClick
    );

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    /* ============================================================
     * RESIZE
     * ============================================================ */

    const handleResize =
      () => {
        const width =
          window.innerWidth;

        const height =
          window.innerHeight;

        camera.aspect =
          width /
          height;

        camera.updateProjectionMatrix();

        const ratio =
          Math.min(
            window.devicePixelRatio ||
              1,
            width < 768
              ? 1.25
              : 1.75
          );

        renderer.setPixelRatio(
          ratio
        );

        renderer.setSize(
          width,
          height
        );

        composer.setSize(
          width,
          height
        );

        starLayers.forEach(
          (
            layer
          ) => {
            layer.material
              .uniforms
              .uPixelRatio
              .value =
              ratio;
          }
        );

        dustMaterial
          .uniforms
          .uPixelRatio
          .value =
          ratio;
      };

    window.addEventListener(
      'resize',
      handleResize
    );

    /* ============================================================
     * VISIBILITY
     * ============================================================ */

    let isVisible =
      true;

    const observer =
      new IntersectionObserver(
        (
          entries
        ) => {
          isVisible =
            entries[0]
              ?.isIntersecting ??
            true;
        },
        {
          threshold:
            0,
        }
      );

    observer.observe(
      container
    );

    /* ============================================================
     * ANIMATION
     * ============================================================ */

    const clock =
      new THREE.Clock();

    let animationFrame =
      0;

    let cameraX =
      0;

    let cameraY =
      0;

    let lastScroll =
      scrollRef.current;

    let smoothScroll =
      scrollRef.current;

    const raycaster =
      new THREE.Raycaster();

    const pointerVec =
      new THREE.Vector2();

    const animate =
      () => {
        animationFrame =
          requestAnimationFrame(
            animate
          );

        if (
          !isVisible
        ) {
          return;
        }

        const elapsed =
          clock.getElapsedTime();

        const dt =
          Math.min(
            clock.getDelta(),
            0.05
          );

        /* ---------------- Pointer ---------------- */

        m.x =
          lerp(
            m.x,
            m.targetX,
            0.08
          );

        m.y =
          lerp(
            m.y,
            m.targetY,
            0.08
          );

        const dragOffsetX =
          m.dragX *
          4.0;

        const dragOffsetY =
          m.dragY *
          3.0;

        m.dragX *=
          0.94;

        m.dragY *=
          0.94;

        /* ---------------- Scroll ---------------- */

        const scroll =
          clamp(
            scrollRef.current
          );

        const scrollDelta =
          scroll -
          lastScroll;

        lastScroll =
          scroll;

        smoothScroll =
          lerp(
            smoothScroll,
            scroll,
            0.06
          );

        /* ---------------- Focus ---------------- */

        const ir =
          interactionRef.current;

        if (
          ir.focus
        ) {
          ir.focusStrength =
            lerp(
              ir.focusStrength,
              0.15,
              0.02
            );
        } else {
          ir.focusStrength =
            lerp(
              ir.focusStrength,
              0,
              0.02
            );
        }

        /* ---------------- Camera ---------------- */

        const targetCameraX =
          m.x *
            1.8 +
          dragOffsetX;

        const targetCameraY =
          -m.y *
            1.25 +
          dragOffsetY;

        const damping =
          reducedMotion
            ? 1
            : 0.05;

        cameraX =
          lerp(
            cameraX,
            targetCameraX,
            damping
          );

        cameraY =
          lerp(
            cameraY,
            targetCameraY,
            damping
          );

        const travel =
          smoothScroll *
          260;

        camera.position.x =
          cameraX;

        camera.position.y =
          cameraY;

        camera.position.z =
          8 -
          travel;

        camera.rotation.z =
          lerp(
            camera.rotation.z,
            -m.x *
              0.018 -
              m.dragX *
                0.05,
            0.04
          );

        camera.rotation.x =
          lerp(
            camera.rotation.x,
            m.y *
              0.012 -
              m.dragY *
                0.05,
            0.04
          );

        /* ---------------- Stars ---------------- */

        starLayers.forEach(
          (
            layer,
            index
          ) => {
            const depth =
              index +
              1;

            layer.material
              .uniforms
              .uTime
              .value =
              elapsed;

            layer.points.rotation.y =
              lerp(
                layer.points
                  .rotation.y,
                m.x *
                  0.025 *
                  depth,
                0.025
              );

            layer.points.rotation.x =
              lerp(
                layer.points
                  .rotation.x,
                m.y *
                  0.015 *
                  depth,
                0.025
              );

            layer.points.position.z =
              Math.sin(
                elapsed *
                  (
                    0.015 +
                    index *
                      0.008
                  )
              ) *
              2;
          }
        );

        /* ---------------- Clusters ---------------- */

        greenCluster.points.rotation.y =
          lerp(
            greenCluster.points
              .rotation.y,
            m.x *
              0.018,
            0.02
          );

        yellowCluster.points.rotation.y =
          lerp(
            yellowCluster.points
              .rotation.y,
            m.x *
              -0.012,
            0.02
          );

        orangeCluster.points.rotation.y =
          lerp(
            orangeCluster.points
              .rotation.y,
            m.x *
              0.008,
            0.02
          );

        /* ---------------- Nebulae ---------------- */

        nebulaMaterial
          .uniforms
          .uTime
          .value =
          elapsed;

        nebulaMaterial
          .uniforms
          .uMouse
          .value.set(
            m.x,
            m.y
          );

        backMaterial
          .uniforms
          .uTime
          .value =
          elapsed *
          0.65;

        backMaterial
          .uniforms
          .uMouse
          .value.set(
            m.x *
              0.5,
            m.y *
              0.5
          );

        nebula.position.x =
          lerp(
            nebula.position.x,
            m.x *
              16,
            0.02
          );

        nebula.position.y =
          lerp(
            nebula.position.y,
            15 -
              m.y *
                8,
            0.02
          );

        nebulaBack.position.x =
          lerp(
            nebulaBack
              .position.x,
            -100 +
              m.x *
                8,
            0.015
          );

        nebulaBack.position.y =
          lerp(
            nebulaBack
              .position.y,
            -35 -
              m.y *
                6,
            0.015
          );

        /* ========================================================
         * TAU CETI / ADRIAN PLANET
         * ======================================================== */

        planet.rotation.y =
          Math.sin(
            elapsed *
              0.025
          ) *
          0.004;

        planet.rotation.z =
          Math.sin(
            elapsed *
              0.035
          ) *
          0.002;

        atmosphere.rotation.copy(
          planet.rotation
        );

        /* ---------------- Planet Hover ---------------- */

        pointerVec.set(
          m.x,
          -m.y
        );

        raycaster.setFromCamera(
          pointerVec,
          camera
        );

        const hits =
          raycaster.intersectObject(
            planet,
            false
          );

        const hoverTarget =
          hits.length >
          0
            ? 1
            : 0;

        planetUniforms
          .uHoverBoost
          .value =
          lerp(
            planetUniforms
              .uHoverBoost
              .value,
            hoverTarget,
            0.08
          );

        atmosphereMaterial
          .uniforms
          .uBoost
          .value =
          planetUniforms
            .uHoverBoost
            .value;

        /* ---------------- Dust ---------------- */

        dust.rotation.y =
          elapsed *
          0.002;

        dust.rotation.x =
          m.y *
          0.012;

        if (
          Math.abs(
            scrollDelta
          ) >
          0.0001
        ) {
          dust.position.z +=
            scrollDelta *
            80;
        }

        /* ---------------- Shooting stars ---------------- */

        shootingStars.forEach(
          (
            star
          ) => {
            if (
              reducedMotion
            ) {
              return;
            }

            if (
              !star.active
            ) {
              star.delay -=
                dt;

              if (
                star.delay <=
                0
              ) {
                star.active =
                  true;

                star.life =
                  0;

                star.line.visible =
                  true;

                star.line.position.set(
                  (
                    Math.random() -
                    0.5
                  ) *
                    140,

                  (
                    Math.random() -
                    0.5
                  ) *
                    80,

                  -100 -
                    Math.random() *
                      140
                );

                const angle =
                  -0.3 -
                  Math.random() *
                    0.3;

                star.dir.set(
                  Math.cos(
                    angle
                  ),
                  Math.sin(
                    angle
                  ),
                  0
                ).normalize();
              }

              return;
            }

            star.life +=
              dt *
              star.speed;

            const lifeT =
              Math.min(
                star.life,
                1
              );

            star.line.position.x +=
              star.dir.x *
              1.6 *
              star.speed;

            star.line.position.y +=
              star.dir.y *
              1.6 *
              star.speed;

            const positions =
              star.line
                .geometry
                .attributes
                .position
                .array as Float32Array;

            const segCount =
              positions.length /
              3;

            const tailLength =
              20;

            for (
              let i = 0;
              i <
              segCount;
              i++
            ) {
              const t =
                i /
                (
                  segCount -
                  1
                );

              const back =
                t *
                tailLength;

              positions[
                i * 3
              ] =
                -star.dir.x *
                back;

              positions[
                i * 3 + 1
              ] =
                -star.dir.y *
                back;

              positions[
                i * 3 + 2
              ] =
                0;
            }

            (
              star.line
                .geometry
                .attributes
                .position as THREE.BufferAttribute
            ).needsUpdate =
              true;

            star.material.opacity =
              Math.sin(
                lifeT *
                  Math.PI
              ) *
              0.95;

            if (
              star.life >=
              1
            ) {
              star.active =
                false;

              star.line.visible =
                false;

              star.delay =
                4 +
                Math.random() *
                  8;
            }
          }
        );

        /* ---------------- Bloom ---------------- */

        bloom.strength =
          0.58 +
          Math.sin(
            elapsed *
              0.35
          ) *
            0.045 +
          smoothstep(
            scroll
          ) *
            0.16;

        renderer.toneMappingExposure =
          1.0 +
          smoothstep(
            scroll
          ) *
            0.10;

        composer.render();
      };

    animate();

    /* ============================================================
     * CLEANUP
     * ============================================================ */

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      observer.disconnect();

      window.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      window.removeEventListener(
        'pointerdown',
        handlePointerDown
      );

      window.removeEventListener(
        'pointerup',
        handlePointerUp
      );

      window.removeEventListener(
        'pointercancel',
        handlePointerUp
      );

      window.removeEventListener(
        'dblclick',
        handleDoubleClick
      );

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      scene.traverse(
        (
          object
        ) => {
          const mesh =
            object as THREE.Mesh;

          if (
            mesh.geometry
          ) {
            mesh.geometry.dispose();
          }

          if (
            mesh.material
          ) {
            if (
              Array.isArray(
                mesh.material
              )
            ) {
              mesh.material.forEach(
                (
                  material
                ) =>
                  material.dispose()
              );
            } else {
              mesh.material.dispose();
            }
          }
        }
      );

      planetTexture.dispose();

      renderer.dispose();

      composer.dispose();

      if (
        renderer
          .domElement
          .parentNode
      ) {
        renderer
          .domElement
          .parentNode
          .removeChild(
            renderer.domElement
          );
      }
    };
  }, []);

  return (
    <div
      ref={
        containerRef
      }
      aria-hidden="true"
      style={{
        position:
          'absolute',

        inset: 0,

        width:
          '100%',

        height:
          '100%',

        overflow:
          'hidden',

        background:
          '#010207',

        pointerEvents:
          'auto',
      }}
    />
  );
};

export default SpaceScene;