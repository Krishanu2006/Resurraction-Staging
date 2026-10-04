import React, {
  useEffect,
  useRef,
} from 'react';

import * as THREE from 'three';

interface TauCetiSceneProps {
  scrollProgress?: number;
}

/* ================================================================
 *
 * TAU CETI e — ADRIAN
 *
 * RESURRACTION CINEMATIC THREE.JS HERO
 *
 * The supplied Adrian reference image is used as the actual
 * planetary surface.
 *
 * Visual direction:
 *
 *     DEEP SPACE
 *          ↓
 *     GREEN PLANET
 *          ↓
 *     YELLOW CLOUDS
 *          ↓
 *     ORANGE STORMS
 *          ↓
 *     GREEN ATMOSPHERE
 *          ↓
 *     EXPLORER SILHOUETTE
 *
 * Interaction:
 *
 *     Mouse
 *       ↓
 *     Camera parallax
 *
 *     Scroll
 *       ↓
 *     Cinematic camera movement
 *
 * ================================================================ */

export const TauCetiScene: React.FC<
  TauCetiSceneProps
> = ({
  scrollProgress = 0,
}) => {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const scrollProgressRef =
    useRef(scrollProgress);

  /* ==============================================================
     KEEP SCROLL VALUE CURRENT
     ============================================================== */

  useEffect(() => {
    scrollProgressRef.current =
      scrollProgress;
  }, [scrollProgress]);

  /* ==============================================================
     THREE.JS
     ============================================================== */

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    /* ============================================================
       SCENE
       ============================================================ */

    const scene =
      new THREE.Scene();

    scene.background =
      new THREE.Color(
        '#010403'
      );

    /* ============================================================
       CAMERA
       ============================================================ */

    const camera =
      new THREE.PerspectiveCamera(
        42,
        1,
        0.1,
        200
      );

    camera.position.set(
      0,
      1.2,
      14
    );

    /* ============================================================
       RENDERER
       ============================================================ */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference:
          'high-performance',
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    renderer.setSize(
      Math.max(
        container.clientWidth,
        1
      ),
      Math.max(
        container.clientHeight,
        1
      )
    );

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
      1.12;

    renderer.shadowMap.enabled =
      true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.domElement.style.position =
      'absolute';

    renderer.domElement.style.inset =
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

    /* ============================================================
       MOUSE
       ============================================================ */

    const mouse = {
      x: 0,
      y: 0,
    };

    const smoothMouse = {
      x: 0,
      y: 0,
    };

    const handleMouseMove = (
      event: MouseEvent
    ) => {
      mouse.x =
        (event.clientX /
          window.innerWidth) *
          2 -
        1;

      mouse.y =
        -(
          (event.clientY /
            window.innerHeight) *
            2 -
          1
        );
    };

    window.addEventListener(
      'mousemove',
      handleMouseMove,
      {
        passive: true,
      }
    );

    /* ============================================================
       GLOBAL GROUPS
       ============================================================ */

    const planetSystem =
      new THREE.Group();

    const astronautSystem =
      new THREE.Group();

    const starSystem =
      new THREE.Group();

    const dustSystem =
      new THREE.Group();

    scene.add(
      planetSystem
    );

    scene.add(
      astronautSystem
    );

    scene.add(
      starSystem
    );

    scene.add(
      dustSystem
    );

    /* ============================================================
       PLANET POSITION
       ============================================================ */

    const PLANET_RADIUS =
      5.5;

    planetSystem.position.set(
      3.35,
      -2.15,
      -4.2
    );

    planetSystem.scale.set(
      1.12,
      1.12,
      1.12
    );

    /* ============================================================
       LOAD THE EXACT SUPPLIED PLANET IMAGE
       ============================================================ */

    const textureLoader =
      new THREE.TextureLoader();

    const planetTexture =
      textureLoader.load(
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

    /* ============================================================
       PLANET GEOMETRY
       ============================================================ */

    const planetGeometry =
      new THREE.SphereGeometry(
        PLANET_RADIUS,
        128,
        128
      );

    /* ============================================================
       PLANET VERTEX SHADER
       ============================================================ */

    const planetVertexShader = `
      varying vec3 vLocalPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {

        vLocalPosition =
          position;

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
    `;

    /* ============================================================
       PLANET FRAGMENT SHADER
       ============================================================ */

    const planetFragmentShader = `
      uniform sampler2D uPlanetTexture;

      varying vec3 vLocalPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {

        /*
         * Normalized sphere coordinates.
         */

        vec3 p =
          normalize(
            vLocalPosition
          );

        /*
         * The supplied reference is a front-facing image.
         *
         * We therefore project it onto the visible hemisphere
         * instead of wrapping it around the entire sphere.
         */

        if (p.z < -0.015) {
          discard;
        }

        /*
         * Convert the front hemisphere into image coordinates.
         */

        vec2 uv =
          vec2(
            p.x,
            p.y
          ) * 0.5 + 0.5;

        /*
         * The source image contains the planet inside a circular
         * region. Crop everything outside that region.
         *
         * This automatically removes:
         *
         * - Project Hail Mary title
         * - Tau Ceti / Adrian text
         * - black corners
         * - artist watermark
         */

        float radius =
          distance(
            uv,
            vec2(
              0.5,
              0.5
            )
          );

        float mask =
          1.0 -
          smoothstep(
            0.455,
            0.505,
            radius
          );

        if (mask < 0.015) {
          discard;
        }

        /*
         * Slightly enlarge the useful portion of the image.
         */

        uv =
          (uv - 0.5) *
          1.055 +
          0.5;

        /*
         * Keep UV coordinates valid.
         */

        uv =
          clamp(
            uv,
            0.001,
            0.999
          );

        /*
         * Sample the actual supplied planet image.
         */

        vec4 reference =
          texture2D(
            uPlanetTexture,
            uv
          );

        /*
         * --------------------------------------------------------
         * CINEMATIC LIGHT
         * --------------------------------------------------------
         */

        vec3 lightDirection =
          normalize(
            vec3(
              -0.55,
              0.42,
              1.0
            )
          );

        float diffuse =
          dot(
            normalize(vNormal),
            lightDirection
          );

        diffuse =
          smoothstep(
            -0.25,
            1.0,
            diffuse
          );

        /*
         * Preserve the strong colors from the reference.
         */

        float lighting =
          0.50 +
          diffuse *
          0.72;

        vec3 color =
          reference.rgb *
          lighting;

        /*
         * --------------------------------------------------------
         * SATURATION
         * --------------------------------------------------------
         *
         * The reference has strong green/yellow/orange colors.
         * Preserve those instead of washing them out.
         */

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
            vec3(luminance),
            color,
            1.16
          );

        /*
         * --------------------------------------------------------
         * ATMOSPHERIC EDGE
         * --------------------------------------------------------
         */

        vec3 viewDirection =
          normalize(
            cameraPosition -
            vWorldPosition
          );

        float fresnel =
          1.0 -
          max(
            dot(
              normalize(vNormal),
              viewDirection
            ),
            0.0
          );

        fresnel =
          pow(
            fresnel,
            3.6
          );

        vec3 greenAtmosphere =
          vec3(
            0.22,
            1.0,
            0.10
          );

        color +=
          greenAtmosphere *
          fresnel *
          0.18;

        /*
         * Slight warm edge contribution.
         */

        vec3 warmAtmosphere =
          vec3(
            1.0,
            0.28,
            0.035
          );

        color +=
          warmAtmosphere *
          fresnel *
          0.045;

        gl_FragColor =
          vec4(
            color,
            mask
          );
      }
    `;

    const planetMaterial =
      new THREE.ShaderMaterial({
        uniforms: {
          uPlanetTexture: {
            value:
              planetTexture,
          },
        },

        vertexShader:
          planetVertexShader,

        fragmentShader:
          planetFragmentShader,

        transparent: true,

        depthWrite: true,

        side:
          THREE.FrontSide,
      });

    const planet =
      new THREE.Mesh(
        planetGeometry,
        planetMaterial
      );

    planetSystem.add(
      planet
    );

    /*
     * Do NOT rotate the planet.
     *
     * The supplied reference image itself is the visual source.
     */

    planet.rotation.set(
      0,
      0,
      0
    );

    /* ============================================================
       ATMOSPHERIC GLOW
       ============================================================ */

    const atmosphereGeometry =
      new THREE.SphereGeometry(
        PLANET_RADIUS * 1.055,
        96,
        96
      );

    const atmosphereMaterial =
      new THREE.ShaderMaterial({
        transparent: true,

        side:
          THREE.BackSide,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,

        uniforms: {
          uGreen: {
            value:
              new THREE.Color(
                '#65ff32'
              ),
          },

          uYellow: {
            value:
              new THREE.Color(
                '#ffe94c'
              ),
          },
        },

        vertexShader: `
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

        fragmentShader: `
          uniform vec3 uGreen;
          uniform vec3 uYellow;

          varying vec3 vNormal;
          varying vec3 vWorldPosition;

          void main() {

            vec3 viewDirection =
              normalize(
                cameraPosition -
                vWorldPosition
              );

            float fresnel =
              1.0 -
              max(
                dot(
                  vNormal,
                  viewDirection
                ),
                0.0
              );

            fresnel =
              pow(
                fresnel,
                4.0
              );

            vec3 color =
              mix(
                uGreen,
                uYellow,
                0.20
              );

            gl_FragColor =
              vec4(
                color,
                fresnel *
                0.30
              );
          }
        `,
      });

    const atmosphere =
      new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial
      );

    planetSystem.add(
      atmosphere
    );

    /* ============================================================
       VERY SUBTLE PLANET DUST
       ============================================================ */

    const atmosphericCount =
      window.innerWidth < 700
        ? 350
        : 700;

    const atmosphericPositions =
      new Float32Array(
        atmosphericCount * 3
      );

    for (
      let i = 0;
      i < atmosphericCount;
      i++
    ) {
      const radius =
        THREE.MathUtils.randFloat(
          PLANET_RADIUS * 1.03,
          PLANET_RADIUS * 1.20
        );

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          THREE.MathUtils.randFloat(
            -1,
            1
          )
        );

      atmosphericPositions[
        i * 3
      ] =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      atmosphericPositions[
        i * 3 + 1
      ] =
        Math.cos(phi) *
        radius;

      atmosphericPositions[
        i * 3 + 2
      ] =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;
    }

    const atmosphericGeometry =
      new THREE.BufferGeometry();

    atmosphericGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        atmosphericPositions,
        3
      )
    );

    const atmosphericMaterial =
      new THREE.PointsMaterial({
        color:
          '#9cff42',

        size:
          0.025,

        transparent:
          true,

        opacity:
          0.18,

        depthWrite:
          false,

        blending:
          THREE.AdditiveBlending,

        sizeAttenuation:
          true,
      });

    const atmosphericParticles =
      new THREE.Points(
        atmosphericGeometry,
        atmosphericMaterial
      );

    planetSystem.add(
      atmosphericParticles
    );

    /* ============================================================
       STAR FIELD
       ============================================================ */

    const starCount =
      window.innerWidth < 700
        ? 850
        : 1800;

    const starPositions =
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

    for (
      let i = 0;
      i < starCount;
      i++
    ) {
      const radius =
        THREE.MathUtils.randFloat(
          35,
          100
        );

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          THREE.MathUtils.randFloat(
            -1,
            1
          )
        );

      starPositions[
        i * 3
      ] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      starPositions[
        i * 3 + 1
      ] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      starPositions[
        i * 3 + 2
      ] =
        radius *
        Math.cos(phi);

      const brightness =
        THREE.MathUtils.randFloat(
          0.55,
          1.0
        );

      /*
       * Mostly neutral stars with occasional subtle green/yellow
       * stars to support the Adrian palette.
       */

      const variant =
        Math.random();

      if (variant < 0.12) {
        starColors[
          i * 3
        ] =
          0.70 *
          brightness;

        starColors[
          i * 3 + 1
        ] =
          1.0 *
          brightness;

        starColors[
          i * 3 + 2
        ] =
          0.48 *
          brightness;
      } else if (
        variant < 0.22
      ) {
        starColors[
          i * 3
        ] =
          1.0 *
          brightness;

        starColors[
          i * 3 + 1
        ] =
          0.78 *
          brightness;

        starColors[
          i * 3 + 2
        ] =
          0.42 *
          brightness;
      } else {
        starColors[
          i * 3
        ] =
          brightness;

        starColors[
          i * 3 + 1
        ] =
          brightness;

        starColors[
          i * 3 + 2
        ] =
          brightness;
      }

      starSizes[i] =
        THREE.MathUtils.randFloat(
          0.30,
          1.65
        );
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

        vertexColors: true,

        blending:
          THREE.AdditiveBlending,

        vertexShader: `
          attribute float aSize;

          varying vec3 vColor;

          void main() {

            vColor =
              color;

            vec4 mvPosition =
              modelViewMatrix *
              vec4(
                position,
                1.0
              );

            gl_PointSize =
              aSize *
              (
                90.0 /
                -mvPosition.z
              );

            gl_Position =
              projectionMatrix *
              mvPosition;
          }
        `,

        fragmentShader: `
          varying vec3 vColor;

          void main() {

            vec2 point =
              gl_PointCoord -
              0.5;

            float distanceFromCenter =
              length(point);

            if (
              distanceFromCenter >
              0.5
            ) {
              discard;
            }

            float alpha =
              1.0 -
              smoothstep(
                0.10,
                0.50,
                distanceFromCenter
              );

            gl_FragColor =
              vec4(
                vColor,
                alpha *
                0.78
              );
          }
        `,
      });

    const stars =
      new THREE.Points(
        starGeometry,
        starMaterial
      );

    starSystem.add(
      stars
    );

    /* ============================================================
       DISTANT GREEN SPACE DUST
       ============================================================ */

    const dustCount =
      window.innerWidth < 700
        ? 350
        : 800;

    const dustPositions =
      new Float32Array(
        dustCount * 3
      );

    for (
      let i = 0;
      i < dustCount;
      i++
    ) {
      /*
       * Wide cinematic distribution.
       */

      dustPositions[
        i * 3
      ] =
        THREE.MathUtils.randFloat(
          -35,
          35
        );

      dustPositions[
        i * 3 + 1
      ] =
        THREE.MathUtils.randFloat(
          -15,
          18
        );

      dustPositions[
        i * 3 + 2
      ] =
        THREE.MathUtils.randFloat(
          -25,
          20
        );
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

    const dustMaterial =
      new THREE.PointsMaterial({
        color:
          '#62ff55',

        size:
          0.07,

        transparent:
          true,

        opacity:
          0.055,

        depthWrite:
          false,

        blending:
          THREE.AdditiveBlending,

        sizeAttenuation:
          true,
      });

    const dust =
      new THREE.Points(
        dustGeometry,
        dustMaterial
      );

    dustSystem.add(
      dust
    );

    /* ============================================================
       PLANET LIGHTING
       ============================================================ */

    const greenLight =
      new THREE.PointLight(
        '#9cff42',
        35,
        28,
        1.7
      );

    greenLight.position.set(
      -1,
      2,
      4
    );

    planetSystem.add(
      greenLight
    );

    const warmLight =
      new THREE.PointLight(
        '#ff701d',
        12,
        20,
        2
      );

    warmLight.position.set(
      -4,
      -2,
      2
    );

    planetSystem.add(
      warmLight
    );

    const ambientLight =
      new THREE.AmbientLight(
        '#6fae55',
        0.28
      );

    scene.add(
      ambientLight
    );

    /* ============================================================
       ASTRONAUT SYSTEM
       ============================================================ */

    const astronaut =
      new THREE.Group();

    astronautSystem.add(
      astronaut
    );

    /*
     * Positioned as a foreground explorer silhouette.
     */

    astronaut.position.set(
      -3.15,
      -2.15,
      1.35
    );

    astronaut.rotation.y =
      0.18;

    astronaut.scale.set(
      1.08,
      1.08,
      1.08
    );

    /* ============================================================
       ASTRONAUT MATERIALS
       ============================================================ */

    const suitMaterial =
      new THREE.MeshStandardMaterial({
        color:
          '#b8c2b8',

        roughness:
          0.88,

        metalness:
          0.08,
      });

    const darkSuitMaterial =
      new THREE.MeshStandardMaterial({
        color:
          '#182019',

        roughness:
          0.92,

        metalness:
          0.12,
      });

    const blackMaterial =
      new THREE.MeshStandardMaterial({
        color:
          '#050805',

        roughness:
          0.76,

        metalness:
          0.30,
      });

    const metalMaterial =
      new THREE.MeshStandardMaterial({
        color:
          '#727b72',

        roughness:
          0.48,

        metalness:
          0.75,
      });

    const visorMaterial =
      new THREE.MeshStandardMaterial({
        color:
          '#06100a',

        roughness:
          0.15,

        metalness:
          0.72,

        emissive:
          '#092611',

        emissiveIntensity:
          0.32,
      });

    /* ============================================================
       ASTRONAUT HELPER
       ============================================================ */

    const addAstronautMesh = (
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      parent: THREE.Object3D
    ) => {
      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );

      mesh.castShadow =
        true;

      mesh.receiveShadow =
        true;

      parent.add(
        mesh
      );

      return mesh;
    };

    /* ============================================================
       TORSO
       ============================================================ */

    const torsoGroup =
      new THREE.Group();

    astronaut.add(
      torsoGroup
    );

    torsoGroup.position.y =
      2.55;

    const torsoGeometry =
      new THREE.CapsuleGeometry(
        0.72,
        1.05,
        8,
        18
      );

    const torso =
      addAstronautMesh(
        torsoGeometry,
        suitMaterial,
        torsoGroup
      );

    torso.scale.z =
      0.70;

    torso.rotation.x =
      Math.PI *
      0.5;

    /* ============================================================
       CHEST UNIT
       ============================================================ */

    const chestGeometry =
      new THREE.BoxGeometry(
        0.78,
        0.60,
        0.18
      );

    const chest =
      addAstronautMesh(
        chestGeometry,
        darkSuitMaterial,
        torsoGroup
      );

    chest.position.set(
      0,
      0.12,
      0.54
    );

    /* ============================================================
       CHEST PANEL
       ============================================================ */

    const panelGeometry =
      new THREE.BoxGeometry(
        0.42,
        0.21,
        0.035
      );

    const panel =
      addAstronautMesh(
        panelGeometry,
        blackMaterial,
        torsoGroup
      );

    panel.position.set(
      0,
      0.19,
      0.66
    );

    /* ============================================================
       CHEST PANEL LIGHTS
       ============================================================ */

    const createPanelLight = (
      x: number,
      color: string
    ) => {
      const geometry =
        new THREE.SphereGeometry(
          0.024,
          12,
          12
        );

      const material =
        new THREE.MeshBasicMaterial({
          color,
        });

      const light =
        new THREE.Mesh(
          geometry,
          material
        );

      light.position.set(
        x,
        0.19,
        0.70
      );

      torsoGroup.add(
        light
      );
    };

    createPanelLight(
      -0.12,
      '#8cff36'
    );

    createPanelLight(
      0,
      '#ffe34a'
    );

    createPanelLight(
      0.12,
      '#ff7a1a'
    );

    /* ============================================================
       NECK
       ============================================================ */

    const neckGeometry =
      new THREE.CylinderGeometry(
        0.24,
        0.28,
        0.30,
        24
      );

    const neck =
      addAstronautMesh(
        neckGeometry,
        darkSuitMaterial,
        torsoGroup
      );

    neck.position.y =
      0.85;

    /* ============================================================
       HELMET
       ============================================================ */

    const helmetGroup =
      new THREE.Group();

    astronaut.add(
      helmetGroup
    );

    helmetGroup.position.set(
      0,
      4.12,
      0
    );

    const helmetGeometry =
      new THREE.SphereGeometry(
        0.68,
        48,
        32
      );

    const helmet =
      addAstronautMesh(
        helmetGeometry,
        suitMaterial,
        helmetGroup
      );

    helmet.scale.set(
      1,
      1.04,
      0.92
    );

    /* ============================================================
       VISOR
       ============================================================ */

    const visorGeometry =
      new THREE.SphereGeometry(
        0.48,
        48,
        32,
        0,
        Math.PI * 2,
        0.15,
        Math.PI * 0.72
      );

    const visor =
      addAstronautMesh(
        visorGeometry,
        visorMaterial,
        helmetGroup
      );

    visor.position.z =
      0.40;

    visor.scale.set(
      1,
      0.82,
      0.38
    );

    /* ============================================================
       HELMET RIM
       ============================================================ */

    const helmetRimGeometry =
      new THREE.TorusGeometry(
        0.61,
        0.075,
        16,
        64
      );

    const helmetRim =
      addAstronautMesh(
        helmetRimGeometry,
        darkSuitMaterial,
        helmetGroup
      );

    helmetRim.scale.y =
      0.94;

    /* ============================================================
       VISOR HIGHLIGHT
       ============================================================ */

    const visorHighlightGeometry =
      new THREE.TorusGeometry(
        0.30,
        0.020,
        10,
        48,
        Math.PI * 0.75
      );

    const visorHighlight =
      addAstronautMesh(
        visorHighlightGeometry,
        new THREE.MeshBasicMaterial({
          color:
            '#d7ff8c',

          transparent:
            true,

          opacity:
            0.34,
        }),
        helmetGroup
      );

    visorHighlight.position.set(
      -0.12,
      0.14,
      0.59
    );

    visorHighlight.rotation.x =
      Math.PI *
      0.48;

    visorHighlight.rotation.z =
      -0.32;

    /* ============================================================
       BACKPACK
       ============================================================ */

    const backpackGroup =
      new THREE.Group();

    astronaut.add(
      backpackGroup
    );

    backpackGroup.position.set(
      0,
      2.75,
      -0.46
    );

    const backpackGeometry =
      new THREE.BoxGeometry(
        0.72,
        1.48,
        0.34
      );

    const backpack =
      addAstronautMesh(
        backpackGeometry,
        darkSuitMaterial,
        backpackGroup
      );

    backpack.rotation.x =
      0.05;

    /* ============================================================
       BACKPACK TOP
       ============================================================ */

    const backpackTopGeometry =
      new THREE.BoxGeometry(
        0.58,
        0.32,
        0.26
      );

    const backpackTop =
      addAstronautMesh(
        backpackTopGeometry,
        blackMaterial,
        backpackGroup
      );

    backpackTop.position.y =
      0.72;

    /* ============================================================
       BACKPACK SIDE UNITS
       ============================================================ */

    for (
      const side of [-1, 1]
    ) {
      const sideGeometry =
        new THREE.BoxGeometry(
          0.18,
          0.72,
          0.30
        );

      const sideUnit =
        addAstronautMesh(
          sideGeometry,
          metalMaterial,
          backpackGroup
        );

      sideUnit.position.x =
        side *
        0.43;
    }

    /* ============================================================
       JOINT HELPER
       ============================================================ */

    const createJoint = (
      parent: THREE.Object3D,
      position: THREE.Vector3,
      size: number
    ) => {
      const geometry =
        new THREE.SphereGeometry(
          size,
          20,
          20
        );

      const joint =
        addAstronautMesh(
          geometry,
          blackMaterial,
          parent
        );

      joint.position.copy(
        position
      );
    };

    /* ============================================================
       SHOULDERS
       ============================================================ */

    createJoint(
      astronaut,
      new THREE.Vector3(
        -0.76,
        3.05,
        0
      ),
      0.20
    );

    createJoint(
      astronaut,
      new THREE.Vector3(
        0.76,
        3.05,
        0
      ),
      0.20
    );

    /* ============================================================
       ARM CREATOR
       ============================================================ */

    const createArm = (
      side: number
    ) => {
      const arm =
        new THREE.Group();

      astronaut.add(
        arm
      );

      arm.position.set(
        side * 0.78,
        3.02,
        0
      );

      arm.rotation.z =
        side *
        THREE.MathUtils.degToRad(
          12
        );

      const upperArmGeometry =
        new THREE.CapsuleGeometry(
          0.18,
          0.58,
          8,
          16
        );

      const upperArm =
        addAstronautMesh(
          upperArmGeometry,
          suitMaterial,
          arm
        );

      upperArm.position.y =
        -0.40;

      createJoint(
        arm,
        new THREE.Vector3(
          0,
          -0.78,
          0
        ),
        0.16
      );

      const forearmGeometry =
        new THREE.CapsuleGeometry(
          0.16,
          0.55,
          8,
          16
        );

      const forearm =
        addAstronautMesh(
          forearmGeometry,
          suitMaterial,
          arm
        );

      forearm.position.y =
        -1.10;

      const gloveGeometry =
        new THREE.SphereGeometry(
          0.19,
          20,
          20
        );

      const glove =
        addAstronautMesh(
          gloveGeometry,
          darkSuitMaterial,
          arm
        );

      glove.position.y =
        -1.55;

      return arm;
    };

    const leftArm =
      createArm(-1);

    const rightArm =
      createArm(1);

    /* ============================================================
       LEGS
       ============================================================ */

    const createLeg = (
      side: number
    ) => {
      const leg =
        new THREE.Group();

      astronaut.add(
        leg
      );

      leg.position.set(
        side * 0.37,
        1.42,
        0
      );

      const upperLegGeometry =
        new THREE.CapsuleGeometry(
          0.22,
          0.72,
          8,
          16
        );

      const upperLeg =
        addAstronautMesh(
          upperLegGeometry,
          suitMaterial,
          leg
        );

      upperLeg.position.y =
        -0.48;

      createJoint(
        leg,
        new THREE.Vector3(
          0,
          -0.95,
          0
        ),
        0.17
      );

      const lowerLegGeometry =
        new THREE.CapsuleGeometry(
          0.18,
          0.68,
          8,
          16
        );

      const lowerLeg =
        addAstronautMesh(
          lowerLegGeometry,
          suitMaterial,
          leg
        );

      lowerLeg.position.y =
        -1.30;

      const bootGeometry =
        new THREE.BoxGeometry(
          0.42,
          0.28,
          0.68
        );

      const boot =
        addAstronautMesh(
          bootGeometry,
          blackMaterial,
          leg
        );

      boot.position.set(
        0,
        -1.82,
        0.12
      );

      return leg;
    };

    const leftLeg =
      createLeg(-1);

    const rightLeg =
      createLeg(1);

    /* ============================================================
       ASTRONAUT LIGHT
       ============================================================ */

    const astronautLight =
      new THREE.PointLight(
        '#baff68',
        5,
        8,
        2
      );

    astronautLight.position.set(
      -2,
      2,
      2
    );

    astronautSystem.add(
      astronautLight
    );

    /* ============================================================
       CAMERA TARGET
       ============================================================ */

    const cameraTarget =
      new THREE.Vector3(
        1.9,
        -0.65,
        -3.7
      );

    /* ============================================================
       RESIZE
       ============================================================ */

    const handleResize = () => {
      const width =
        Math.max(
          container.clientWidth,
          1
        );

      const height =
        Math.max(
          container.clientHeight,
          1
        );

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );

      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          2
        )
      );
    };

    window.addEventListener(
      'resize',
      handleResize
    );

    handleResize();

    /* ============================================================
       REDUCED MOTION
       ============================================================ */

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

    /* ============================================================
       CLOCK
       ============================================================ */

    const clock =
      new THREE.Clock();

    let animationFrame =
      0;

    let destroyed =
      false;

    /* ============================================================
       ANIMATION
       ============================================================ */

    const animate = () => {
      if (destroyed) {
        return;
      }

      animationFrame =
        window.requestAnimationFrame(
          animate
        );

      const elapsed =
        clock.getElapsedTime();

      const progress =
        THREE.MathUtils.clamp(
          scrollProgressRef.current,
          0,
          1
        );

      /*
       * ----------------------------------------------------------
       * SMOOTH MOUSE
       * ----------------------------------------------------------
       */

      if (
        !reducedMotion.matches
      ) {
        smoothMouse.x +=
          (
            mouse.x -
            smoothMouse.x
          ) *
          0.045;

        smoothMouse.y +=
          (
            mouse.y -
            smoothMouse.y
          ) *
          0.045;
      } else {
        smoothMouse.x = 0;
        smoothMouse.y = 0;
      }

      /*
       * ----------------------------------------------------------
       * CAMERA PARALLAX
       * ----------------------------------------------------------
       */

      const mouseCameraX =
        smoothMouse.x *
        0.95;

      const mouseCameraY =
        smoothMouse.y *
        0.55;

      const scrollCameraX =
        progress *
        -0.75;

      const scrollCameraY =
        progress *
        0.30;

      const scrollCameraZ =
        progress *
        1.15;

      const targetX =
        mouseCameraX +
        scrollCameraX;

      const targetY =
        1.25 +
        mouseCameraY +
        scrollCameraY;

      const targetZ =
        14 -
        scrollCameraZ;

      camera.position.x +=
        (
          targetX -
          camera.position.x
        ) *
        0.035;

      camera.position.y +=
        (
          targetY -
          camera.position.y
        ) *
        0.035;

      camera.position.z +=
        (
          targetZ -
          camera.position.z
        ) *
        0.025;

      /*
       * ----------------------------------------------------------
       * CAMERA LOOK TARGET
       * ----------------------------------------------------------
       */

      cameraTarget.x =
        1.9 +
        smoothMouse.x *
        0.30;

      cameraTarget.y =
        -0.65 +
        smoothMouse.y *
        0.18;

      cameraTarget.z =
        -3.7;

      camera.lookAt(
        cameraTarget
      );

      /*
       * ----------------------------------------------------------
       * PLANET MICRO MOVEMENT
       * ----------------------------------------------------------
       *
       * Very subtle. The actual reference image remains visually
       * stable while the world responds to the mouse.
       */

      planetSystem.rotation.y =
        smoothMouse.x *
        0.018;

      planetSystem.rotation.x =
        -smoothMouse.y *
        0.012;

      /*
       * ----------------------------------------------------------
       * ATMOSPHERE
       * ----------------------------------------------------------
       */

      atmosphere.rotation.y =
        elapsed *
        0.003;

      /*
       * ----------------------------------------------------------
       * PARTICLES
       * ----------------------------------------------------------
       */

      atmosphericParticles.rotation.y =
        elapsed *
        0.008;

      stars.rotation.y =
        elapsed *
        0.0012;

      stars.rotation.x =
        Math.sin(
          elapsed *
          0.025
        ) *
        0.006;

      dust.rotation.y =
        elapsed *
        0.002;

      /*
       * ----------------------------------------------------------
       * ASTRONAUT PARALLAX
       * ----------------------------------------------------------
       */

      astronaut.position.x =
        -3.15 +
        smoothMouse.x *
        0.18;

      astronaut.position.y =
        -2.15 +
        smoothMouse.y *
        0.10;

      /*
       * Slight breathing movement.
       */

      if (
        !reducedMotion.matches
      ) {
        astronaut.position.y +=
          Math.sin(
            elapsed *
            0.72
          ) *
          0.012;
      }

      /*
       * Subtle arm response.
       */

      if (
        !reducedMotion.matches
      ) {
        leftArm.rotation.z =
          -0.12 +
          smoothMouse.y *
          0.025;

        rightArm.rotation.z =
          0.12 +
          smoothMouse.y *
          0.025;

        leftLeg.rotation.z =
          smoothMouse.x *
          0.012;

        rightLeg.rotation.z =
          smoothMouse.x *
          0.012;
      }

      /*
       * ----------------------------------------------------------
       * LIGHT MOVEMENT
       * ----------------------------------------------------------
       */

      greenLight.position.x =
        -1 +
        smoothMouse.x *
        1.2;

      greenLight.position.y =
        2 +
        smoothMouse.y *
        0.7;

      warmLight.position.x =
        -4 -
        smoothMouse.x *
        0.5;

      /*
       * ----------------------------------------------------------
       * RENDER
       * ----------------------------------------------------------
       */

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /* ============================================================
       CLEANUP
       ============================================================ */

    return () => {
      destroyed =
        true;

      window.cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      /*
       * Dispose geometries.
       */

      scene.traverse(
        (object) => {
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
            const materials =
              Array.isArray(
                mesh.material
              )
                ? mesh.material
                : [
                    mesh.material,
                  ];

            materials.forEach(
              (
                material
              ) => {
                material.dispose();

                const shaderMaterial =
                  material as THREE.ShaderMaterial;

                if (
                  shaderMaterial.uniforms
                ) {
                  Object.values(
                    shaderMaterial.uniforms
                  ).forEach(
                    (
                      uniform
                    ) => {
                      const value =
                        uniform.value;

                      if (
                        value instanceof
                        THREE.Texture
                      ) {
                        value.dispose();
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );

      planetTexture.dispose();

      renderer.dispose();

      if (
        renderer.domElement.parentNode ===
        container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  /* ==============================================================
     CONTAINER
     ============================================================== */

  return (
    <div
      ref={containerRef}
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

        pointerEvents:
          'none',

        background:
          '#010403',

        zIndex: 0,
      }}
    />
  );
};

export default TauCetiScene;