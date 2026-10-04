import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TauCetiSceneProps {
    scrollProgress?: number;
}

/* ================================================================
 *
 * TAU CETI e — ADRIAN
 * PROJECT HAIL MARY INSPIRED THREE.JS HERO
 *
 * Procedural cinematic alien planet + astronaut scene.
 *
 * Main visual language:
 *
 *      DEEP SPACE
 *          ↓
 *      GREEN ATMOSPHERE
 *          ↓
 *      YELLOW / GOLD LIGHT
 *          ↓
 *      ORANGE CLOUDS
 *          ↓
 *      DARK EXPLORER SILHOUETTE
 *
 * Interaction:
 *
 *   Mouse X/Y
 *      ↓
 *   Camera parallax
 *      ↓
 *   Astronaut movement
 *      ↓
 *   Planet atmospheric response
 *
 * Scroll:
 *
 *   subtle cinematic camera movement
 *
 * ================================================================ */

export const TauCetiScene: React.FC<TauCetiSceneProps> = ({
    scrollProgress = 0,
}) => {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    const scrollProgressRef =
        useRef(scrollProgress);

    /* ================================================================
       KEEP SCROLL VALUE CURRENT
       ================================================================ */

    useEffect(() => {
        scrollProgressRef.current =
            scrollProgress;
    }, [scrollProgress]);

    /* ================================================================
       THREE.JS INITIALIZATION
       ================================================================ */

    useEffect(() => {
        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        /* ================================================================
           SCENE
           ================================================================ */

        const scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                '#020603'
            );

        /* ================================================================
           CAMERA
           ================================================================ */

        const camera =
            new THREE.PerspectiveCamera(
                42,
                1,
                0.1,
                200
            );

        camera.position.set(
            0,
            1.4,
            14
        );

        camera.lookAt(
            0,
            1.0,
            0
        );

        /* ================================================================
           RENDERER
           ================================================================ */

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
            container.clientWidth,
            container.clientHeight
        );

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure =
            1.18;

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

        /* ================================================================
           MOUSE
           ================================================================ */

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

        /* ================================================================
           GLOBAL GROUPS
           ================================================================ */

        const planetSystem =
            new THREE.Group();

        const astronautSystem =
            new THREE.Group();

        const atmosphereSystem =
            new THREE.Group();

        const particleSystem =
            new THREE.Group();

        const distantStarSystem =
            new THREE.Group();

        scene.add(
            planetSystem
        );

        scene.add(
            astronautSystem
        );

        scene.add(
            atmosphereSystem
        );

        scene.add(
            particleSystem
        );

        scene.add(
            distantStarSystem
        );

        /* ================================================================
           PLANET POSITION
           ================================================================ */

        planetSystem.position.set(
            3.2,
            -2.6,
            -4.5
        );

        /*
         * Large planet creates cinematic scale.
         */

        const PLANET_RADIUS =
            5.5;

        /* ================================================================
           PLANET CORE
           ================================================================ */

        const planetGeometry =
            new THREE.SphereGeometry(
                PLANET_RADIUS,
                96,
                96
            );

        /*
         * Planet shader.
         *
         * Green / yellow / orange surface.
         *
         * Uses procedural noise-like functions
         * directly inside GLSL.
         */

        const planetVertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {

        vUv = uv;

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

        const planetFragmentShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      uniform float uTime;

      /*
       * ------------------------------------------------------------
       * HASH
       * ------------------------------------------------------------
       */

      float hash(
        vec3 p
      ) {
        p =
          fract(
            p *
            0.3183099
          );

        p *=
          17.0;

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

      /*
       * ------------------------------------------------------------
       * VALUE NOISE
       * ------------------------------------------------------------
       */

      float noise(
        vec3 p
      ) {

        vec3 i =
          floor(p);

        vec3 f =
          fract(p);

        f =
          f *
          f *
          (
            3.0 -
            2.0 *
            f
          );

        float n000 =
          hash(
            i +
            vec3(
              0.0,
              0.0,
              0.0
            )
          );

        float n100 =
          hash(
            i +
            vec3(
              1.0,
              0.0,
              0.0
            )
          );

        float n010 =
          hash(
            i +
            vec3(
              0.0,
              1.0,
              0.0
            )
          );

        float n110 =
          hash(
            i +
            vec3(
              1.0,
              1.0,
              0.0
            )
          );

        float n001 =
          hash(
            i +
            vec3(
              0.0,
              0.0,
              1.0
            )
          );

        float n101 =
          hash(
            i +
            vec3(
              1.0,
              0.0,
              1.0
            )
          );

        float n011 =
          hash(
            i +
            vec3(
              0.0,
              1.0,
              1.0
            )
          );

        float n111 =
          hash(
            i +
            vec3(
              1.0,
              1.0,
              1.0
            )
          );

        float x00 =
          mix(
            n000,
            n100,
            f.x
          );

        float x10 =
          mix(
            n010,
            n110,
            f.x
          );

        float x01 =
          mix(
            n001,
            n101,
            f.x
          );

        float x11 =
          mix(
            n011,
            n111,
            f.x
          );

        float y0 =
          mix(
            x00,
            x10,
            f.y
          );

        float y1 =
          mix(
            x01,
            x11,
            f.y
          );

        return mix(
          y0,
          y1,
          f.z
        );
      }

      /*
       * ------------------------------------------------------------
       * FBM
       * ------------------------------------------------------------
       */

      float fbm(
        vec3 p
      ) {

        float value =
          0.0;

        float amplitude =
          0.5;

        for (
          int i = 0;
          i < 5;
          i++
        ) {

          value +=
            noise(p) *
            amplitude;

          p *=
            2.0;

          amplitude *=
            0.5;
        }

        return value;
      }

      void main() {

        vec3 normal =
          normalize(
            vNormal
          );

        /*
         * Planetary coordinates.
         */

        vec3 p =
          normalize(
            vWorldPosition
          );

        /*
         * Multiple cloud-like noise layers.
         */

        float largeNoise =
          fbm(
            p * 2.0 +
            vec3(
              uTime * 0.006,
              0.0,
              uTime * 0.004
            )
          );

        float mediumNoise =
          fbm(
            p * 5.0 -
            vec3(
              uTime * 0.01,
              uTime * 0.006,
              0.0
            )
          );

        float fineNoise =
          fbm(
            p * 12.0 +
            vec3(
              0.0,
              uTime * 0.012,
              0.0
            )
          );

        float terrain =
          largeNoise *
          0.62 +
          mediumNoise *
          0.28 +
          fineNoise *
          0.10;

        /*
         * --------------------------------------------------------
         * ADRIAN PALETTE
         * --------------------------------------------------------
         */

        vec3 deepGreen =
          vec3(
            0.015,
            0.075,
            0.018
          );

        vec3 emerald =
          vec3(
            0.025,
            0.32,
            0.055
          );

        vec3 saturatedGreen =
          vec3(
            0.20,
            0.78,
            0.035
          );

        vec3 yellow =
          vec3(
            0.94,
            0.86,
            0.08
          );

        vec3 orange =
          vec3(
            1.0,
            0.35,
            0.035
          );

        /*
         * Color ramps.
         */

        vec3 color =
          mix(
            deepGreen,
            emerald,
            smoothstep(
              0.18,
              0.42,
              terrain
            )
          );

        color =
          mix(
            color,
            saturatedGreen,
            smoothstep(
              0.40,
              0.62,
              terrain
            )
          );

        color =
          mix(
            color,
            yellow,
            smoothstep(
              0.57,
              0.73,
              terrain
            )
          );

        color =
          mix(
            color,
            orange,
            smoothstep(
              0.70,
              0.92,
              terrain
            )
          );

        /*
         * --------------------------------------------------------
         * LIGHTING
         * --------------------------------------------------------
         */

        vec3 lightDirection =
          normalize(
            vec3(
              -0.7,
              0.55,
              1.0
            )
          );

        float light =
          dot(
            normal,
            lightDirection
          );

        light =
          smoothstep(
            -0.3,
            1.0,
            light
          );

        color *=
          0.38 +
          light *
          0.82;

        /*
         * Bright atmospheric side.
         */

        float rim =
          1.0 -
          max(
            dot(
              normal,
              vec3(
                0.0,
                0.0,
                1.0
              )
            ),
            0.0
          );

        rim =
          pow(
            rim,
            2.8
          );

        color +=
          vec3(
            0.16,
            0.42,
            0.025
          ) *
          rim *
          0.32;

        gl_FragColor =
          vec4(
            color,
            1.0
          );
      }
    `;

        const planetMaterial =
            new THREE.ShaderMaterial({
                uniforms: {
                    uTime: {
                        value: 0,
                    },
                },

                vertexShader:
                    planetVertexShader,

                fragmentShader:
                    planetFragmentShader,
            });

        const planet =
            new THREE.Mesh(
                planetGeometry,
                planetMaterial
            );

        planetSystem.add(
            planet
        );

        /* ================================================================
           PLANET CLOUD SHELL
           ================================================================ */

        const cloudGeometry =
            new THREE.SphereGeometry(
                PLANET_RADIUS * 1.015,
                96,
                96
            );

        const cloudMaterial =
            new THREE.MeshBasicMaterial({
                color:
                    '#9cff28',

                transparent:
                    true,

                opacity:
                    0.10,

                blending:
                    THREE.AdditiveBlending,

                side:
                    THREE.BackSide,

                depthWrite:
                    false,
            });

        const cloudShell =
            new THREE.Mesh(
                cloudGeometry,
                cloudMaterial
            );

        planetSystem.add(
            cloudShell
        );

        /* ================================================================
           PLANET ATMOSPHERIC SHELL
           ================================================================ */

        const atmosphereGeometry =
            new THREE.SphereGeometry(
                PLANET_RADIUS * 1.09,
                96,
                96
            );

        const atmosphereMaterial =
            new THREE.ShaderMaterial({
                transparent: true,

                side:
                    THREE.BackSide,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending,

                uniforms: {
                    uColorGreen: {
                        value:
                            new THREE.Color(
                                '#66ff33'
                            ),
                    },

                    uColorYellow: {
                        value:
                            new THREE.Color(
                                '#ffe84a'
                            ),
                    },

                    uTime: {
                        value: 0,
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
          varying vec3 vNormal;
          varying vec3 vWorldPosition;

          uniform vec3 uColorGreen;
          uniform vec3 uColorYellow;
          uniform float uTime;

          void main() {

            vec3 viewDirection =
              normalize(
                cameraPosition -
                vWorldPosition
              );

            float fresnel =
              pow(
                1.0 -
                max(
                  dot(
                    vNormal,
                    viewDirection
                  ),
                  0.0
                ),
                3.2
              );

            float wave =
              sin(
                vWorldPosition.y *
                2.4 +
                uTime *
                0.25
              ) *
              0.5 +
              0.5;

            vec3 color =
              mix(
                uColorGreen,
                uColorYellow,
                wave *
                0.35
              );

            float alpha =
              fresnel *
              0.72;

            gl_FragColor =
              vec4(
                color,
                alpha
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

        /* ================================================================
           PLANET ROTATION
           ================================================================ */

        planet.rotation.y =
            -0.45;

        /* ================================================================
           ATMOSPHERIC PARTICLE CLOUD
           ================================================================ */

        const atmosphericParticleCount =
            1200;

        const atmosphericPositions =
            new Float32Array(
                atmosphericParticleCount *
                3
            );

        for (
            let i = 0;
            i <
            atmosphericParticleCount;
            i++
        ) {
            const radius =
                THREE.MathUtils.randFloat(
                    PLANET_RADIUS * 1.05,
                    PLANET_RADIUS * 1.35
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

        const atmosphericParticleGeometry =
            new THREE.BufferGeometry();

        atmosphericParticleGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                atmosphericPositions,
                3
            )
        );

        const atmosphericParticleMaterial =
            new THREE.PointsMaterial({
                color:
                    '#9cff32',

                size:
                    0.035,

                transparent:
                    true,

                opacity:
                    0.28,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending,

                sizeAttenuation:
                    true,
            });

        const atmosphericParticles =
            new THREE.Points(
                atmosphericParticleGeometry,
                atmosphericParticleMaterial
            );

        planetSystem.add(
            atmosphericParticles
        );

        /* ================================================================
           STAR FIELD
           ================================================================ */

        const starCount =
            window.innerWidth < 700
                ? 900
                : 1800;

        const starPositions =
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
                    95
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

            starSizes[i] =
                THREE.MathUtils.randFloat(
                    0.3,
                    1.8
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
            'aSize',
            new THREE.BufferAttribute(
                starSizes,
                1
            )
        );

        const starMaterial =
            new THREE.PointsMaterial({
                color:
                    '#eaffd7',

                size:
                    0.045,

                transparent:
                    true,

                opacity:
                    0.68,

                depthWrite:
                    false,

                sizeAttenuation:
                    true,
            });

        const stars =
            new THREE.Points(
                starGeometry,
                starMaterial
            );

        distantStarSystem.add(
            stars
        );

        /* ================================================================
           DISTANT GREEN NEBULA PARTICLES
           ================================================================ */

        const nebulaCount =
            600;

        const nebulaPositions =
            new Float32Array(
                nebulaCount * 3
            );

        for (
            let i = 0;
            i < nebulaCount;
            i++
        ) {
            nebulaPositions[
                i * 3
            ] =
                THREE.MathUtils.randFloat(
                    -35,
                    35
                );

            nebulaPositions[
                i * 3 + 1
            ] =
                THREE.MathUtils.randFloat(
                    -15,
                    18
                );

            nebulaPositions[
                i * 3 + 2
            ] =
                THREE.MathUtils.randFloat(
                    -20,
                    10
                );
        }

        const nebulaGeometry =
            new THREE.BufferGeometry();

        nebulaGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                nebulaPositions,
                3
            )
        );

        const nebulaMaterial =
            new THREE.PointsMaterial({
                color:
                    '#39ff4a',

                size:
                    0.08,

                transparent:
                    true,

                opacity:
                    0.08,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false,
            });

        const nebula =
            new THREE.Points(
                nebulaGeometry,
                nebulaMaterial
            );

        particleSystem.add(
            nebula
        );

        /* ================================================================
           PLANET LIGHT
           ================================================================ */

        const planetLight =
            new THREE.PointLight(
                '#b6ff42',
                42,
                26,
                1.5
            );

        planetLight.position.set(
            0,
            1,
            0
        );

        planetSystem.add(
            planetLight
        );

        /* ================================================================
           ORANGE SECONDARY PLANET LIGHT
           ================================================================ */

        const orangePlanetLight =
            new THREE.PointLight(
                '#ff6a18',
                18,
                20,
                2
            );

        orangePlanetLight.position.set(
            -3,
            -2,
            1
        );

        planetSystem.add(
            orangePlanetLight
        );

        /* ================================================================
           ASTRONAUT
           ================================================================ */

        /*
         * The astronaut is intentionally constructed from primitives.
         *
         * This gives:
         *
         * - helmet
         * - visor
         * - torso
         * - chest unit
         * - backpack
         * - shoulders
         * - arms
         * - gloves
         * - legs
         * - boots
         * - oxygen hoses
         * - equipment
         *
         * The silhouette is inspired by a serious planetary explorer
         * rather than a cartoon astronaut.
         */

        const astronaut =
            new THREE.Group();

        astronautSystem.add(
            astronaut
        );

        /*
         * Place astronaut in front of planet.
         */

        astronaut.position.set(
            -3.0,
            -2.0,
            1.8
        );

        astronaut.rotation.y =
            0.22;

        astronaut.scale.set(
            1.15,
            1.15,
            1.15
        );

        /* ================================================================
           ASTRONAUT MATERIALS
           ================================================================ */

        const suitMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#c7d0c2',

                roughness:
                    0.82,

                metalness:
                    0.08,
            });

        const suitDarkMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#202720',

                roughness:
                    0.9,

                metalness:
                    0.12,
            });

        const blackMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#080c09',

                roughness:
                    0.72,

                metalness:
                    0.25,
            });

        const metalMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#777d76',

                roughness:
                    0.5,

                metalness:
                    0.72,
            });

        const visorMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#0a1610',

                roughness:
                    0.18,

                metalness:
                    0.65,

                emissive:
                    '#071c0e',

                emissiveIntensity:
                    0.35,
            });

        const orangeSuitMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#c96b19',

                roughness:
                    0.72,

                metalness:
                    0.12,
            });

        /* ================================================================
           HELPER
           ================================================================ */

        const addMesh = (
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

        /* ================================================================
           TORSO
           ================================================================ */

        const torsoGroup =
            new THREE.Group();

        astronaut.add(
            torsoGroup
        );

        torsoGroup.position.y =
            2.65;

        const torsoGeometry =
            new THREE.CapsuleGeometry(
                0.72,
                1.05,
                8,
                16
            );

        const torso =
            addMesh(
                torsoGeometry,
                suitMaterial,
                torsoGroup
            );

        torso.scale.z =
            0.72;

        torso.rotation.x =
            Math.PI * 0.5;

        /* ================================================================
           CHEST PLATE
           ================================================================ */

        const chestGeometry =
            new THREE.BoxGeometry(
                0.78,
                0.62,
                0.18
            );

        const chest =
            addMesh(
                chestGeometry,
                suitDarkMaterial,
                torsoGroup
            );

        chest.position.set(
            0,
            0.15,
            0.55
        );

        chest.rotation.x =
            -0.08;

        /* ================================================================
           CHEST CONTROL PANEL
           ================================================================ */

        const panelGeometry =
            new THREE.BoxGeometry(
                0.42,
                0.22,
                0.035
            );

        const panel =
            addMesh(
                panelGeometry,
                blackMaterial,
                torsoGroup
            );

        panel.position.set(
            0,
            0.20,
            0.66
        );

        /* ================================================================
           PANEL LIGHTS
           ================================================================ */

        const createPanelLight = (
            x: number,
            color: string
        ) => {
            const geometry =
                new THREE.SphereGeometry(
                    0.025,
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
                0.20,
                0.70
            );

            torsoGroup.add(
                light
            );

            return light;
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

        /* ================================================================
           NECK
           ================================================================ */

        const neckGeometry =
            new THREE.CylinderGeometry(
                0.24,
                0.28,
                0.30,
                24
            );

        addMesh(
            neckGeometry,
            suitDarkMaterial,
            torsoGroup
        ).position.y =
            0.88;

        /* ================================================================
           HELMET
           ================================================================ */

        const helmetGroup =
            new THREE.Group();

        astronaut.add(
            helmetGroup
        );

        helmetGroup.position.set(
            0,
            4.25,
            0
        );

        /* Helmet outer shell */

        const helmetGeometry =
            new THREE.SphereGeometry(
                0.68,
                48,
                32
            );

        const helmet =
            addMesh(
                helmetGeometry,
                suitMaterial,
                helmetGroup
            );

        helmet.scale.set(
            1,
            1.04,
            0.92
        );

        /* ================================================================
           VISOR
           ================================================================ */

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
            addMesh(
                visorGeometry,
                visorMaterial,
                helmetGroup
            );

        visor.position.z =
            0.40;

        visor.scale.set(
            1.0,
            0.82,
            0.38
        );

        visor.rotation.x =
            Math.PI * 0.02;

        /* ================================================================
           VISOR REFLECTION
           ================================================================ */

        const visorReflectionGeometry =
            new THREE.TorusGeometry(
                0.31,
                0.025,
                10,
                48,
                Math.PI * 0.75
            );

        const visorReflection =
            addMesh(
                visorReflectionGeometry,
                new THREE.MeshBasicMaterial({
                    color:
                        '#d8ff86',
                    transparent:
                        true,
                    opacity:
                        0.42,
                }),
                helmetGroup
            );

        visorReflection.position.set(
            -0.12,
            0.14,
            0.60
        );

        visorReflection.rotation.x =
            Math.PI * 0.48;

        visorReflection.rotation.z =
            -0.32;

        /* ================================================================
           HELMET RIM
           ================================================================ */

        const helmetRimGeometry =
            new THREE.TorusGeometry(
                0.61,
                0.075,
                16,
                64
            );

        const helmetRim =
            addMesh(
                helmetRimGeometry,
                suitDarkMaterial,
                helmetGroup
            );

        helmetRim.scale.y =
            0.94;

        /* ================================================================
           BACKPACK
           ================================================================ */

        const backpackGroup =
            new THREE.Group();

        astronaut.add(
            backpackGroup
        );

        backpackGroup.position.set(
            0,
            2.8,
            -0.46
        );

        const backpackGeometry =
            new THREE.BoxGeometry(
                0.72,
                1.48,
                0.34
            );

        const backpack =
            addMesh(
                backpackGeometry,
                suitDarkMaterial,
                backpackGroup
            );

        backpack.rotation.x =
            0.05;

        /* ================================================================
           BACKPACK TOP
           ================================================================ */

        const backpackTopGeometry =
            new THREE.BoxGeometry(
                0.58,
                0.32,
                0.26
            );

        addMesh(
            backpackTopGeometry,
            blackMaterial,
            backpackGroup
        ).position.y =
            0.72;

        /* ================================================================
           BACKPACK SIDE UNITS
           ================================================================ */

        for (
            let side of [-1, 1]
        ) {
            const sideUnitGeometry =
                new THREE.BoxGeometry(
                    0.18,
                    0.72,
                    0.30
                );

            const sideUnit =
                addMesh(
                    sideUnitGeometry,
                    metalMaterial,
                    backpackGroup
                );

            sideUnit.position.x =
                side * 0.43;
        }

        /* ================================================================
           SHOULDER JOINTS
           ================================================================ */

        const createJoint = (
            parent: THREE.Object3D,
            position: THREE.Vector3,
            scale = 0.20
        ) => {
            const geometry =
                new THREE.SphereGeometry(
                    scale,
                    20,
                    20
                );

            const joint =
                addMesh(
                    geometry,
                    blackMaterial,
                    parent
                );

            joint.position.copy(
                position
            );

            return joint;
        };

        createJoint(
            astronaut,
            new THREE.Vector3(
                -0.76,
                3.15,
                0
            ),
            0.20
        );

        createJoint(
            astronaut,
            new THREE.Vector3(
                0.76,
                3.15,
                0
            ),
            0.20
        );

        /* ================================================================
           ARM CREATOR
           ================================================================ */

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
                3.12,
                0
            );

            arm.rotation.z =
                side *
                THREE.MathUtils.degToRad(
                    14
                );

            /*
             * Upper arm.
             */

            const upperArmGeometry =
                new THREE.CapsuleGeometry(
                    0.18,
                    0.58,
                    8,
                    16
                );

            const upperArm =
                addMesh(
                    upperArmGeometry,
                    suitMaterial,
                    arm
                );

            upperArm.position.y =
                -0.40;

            /*
             * Elbow.
             */

            createJoint(
                arm,
                new THREE.Vector3(
                    0,
                    -0.78,
                    0
                ),
                0.16
            );

            /*
             * Forearm.
             */

            const forearmGeometry =
                new THREE.CapsuleGeometry(
                    0.16,
                    0.55,
                    8,
                    16
                );

            const forearm =
                addMesh(
                    forearmGeometry,
                    suitMaterial,
                    arm
                );

            forearm.position.y =
                -1.10;

            /*
             * Glove.
             */

            const gloveGeometry =
                new THREE.SphereGeometry(
                    0.20,
                    24,
                    24
                );

            const glove =
                addMesh(
                    gloveGeometry,
                    suitDarkMaterial,
                    arm
                );

            glove.position.y =
                -1.46;

            glove.scale.set(
                0.85,
                1.05,
                0.78
            );

            return arm;
        };

        const leftArm =
            createArm(-1);

        const rightArm =
            createArm(1);

        /* ================================================================
           HAND EQUIPMENT
           ================================================================ */

        const rightToolGeometry =
            new THREE.CylinderGeometry(
                0.045,
                0.045,
                0.62,
                12
            );

        const rightTool =
            addMesh(
                rightToolGeometry,
                metalMaterial,
                rightArm
            );

        rightTool.rotation.z =
            0.45;

        rightTool.position.set(
            0.12,
            -1.46,
            0.10
        );

        /* ================================================================
           WAIST
           ================================================================ */

        const waistGeometry =
            new THREE.CylinderGeometry(
                0.53,
                0.58,
                0.32,
                24
            );

        const waist =
            addMesh(
                waistGeometry,
                suitDarkMaterial,
                astronaut
            );

        waist.position.y =
            1.95;

        /* ================================================================
           HIP JOINTS
           ================================================================ */

        createJoint(
            astronaut,
            new THREE.Vector3(
                -0.36,
                1.72,
                0
            ),
            0.19
        );

        createJoint(
            astronaut,
            new THREE.Vector3(
                0.36,
                1.72,
                0
            ),
            0.19
        );

        /* ================================================================
           LEG CREATOR
           ================================================================ */

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
                1.75,
                0
            );

            /*
             * Thigh.
             */

            const thighGeometry =
                new THREE.CapsuleGeometry(
                    0.22,
                    0.70,
                    8,
                    16
                );

            const thigh =
                addMesh(
                    thighGeometry,
                    suitMaterial,
                    leg
                );

            thigh.position.y =
                -0.50;

            /*
             * Knee.
             */

            createJoint(
                leg,
                new THREE.Vector3(
                    0,
                    -0.92,
                    0
                ),
                0.18
            );

            /*
             * Lower leg.
             */

            const shinGeometry =
                new THREE.CapsuleGeometry(
                    0.19,
                    0.66,
                    8,
                    16
                );

            const shin =
                addMesh(
                    shinGeometry,
                    suitMaterial,
                    leg
                );

            shin.position.y =
                -1.32;

            /*
             * Boot.
             */

            const bootGeometry =
                new THREE.BoxGeometry(
                    0.38,
                    0.26,
                    0.65
                );

            const boot =
                addMesh(
                    bootGeometry,
                    suitDarkMaterial,
                    leg
                );

            boot.position.set(
                0,
                -1.78,
                0.10
            );

            boot.rotation.x =
                -0.08;

            return leg;
        };

        const leftLeg =
            createLeg(-1);

        const rightLeg =
            createLeg(1);

        /* ================================================================
           ORANGE IDENTIFICATION STRIP
           ================================================================ */

        const shoulderStripeGeometry =
            new THREE.BoxGeometry(
                0.12,
                0.42,
                0.03
            );

        const shoulderStripe =
            addMesh(
                shoulderStripeGeometry,
                orangeSuitMaterial,
                astronaut
            );

        shoulderStripe.position.set(
            -0.82,
            3.18,
            0.16
        );

        shoulderStripe.rotation.z =
            0.12;

        /* ================================================================
           LIFE SUPPORT HOSES
           ================================================================ */

        const createHose = (
            points: THREE.Vector3[],
            color: string
        ) => {
            const curve =
                new THREE.CatmullRomCurve3(
                    points
                );

            const geometry =
                new THREE.TubeGeometry(
                    curve,
                    32,
                    0.045,
                    10,
                    false
                );

            const material =
                new THREE.MeshStandardMaterial({
                    color,
                    roughness:
                        0.7,
                    metalness:
                        0.25,
                });

            const hose =
                new THREE.Mesh(
                    geometry,
                    material
                );

            hose.castShadow =
                true;

            hose.receiveShadow =
                true;

            astronaut.add(
                hose
            );

            return hose;
        };

        createHose(
            [
                new THREE.Vector3(
                    -0.30,
                    3.90,
                    -0.35
                ),

                new THREE.Vector3(
                    -0.70,
                    3.65,
                    -0.48
                ),

                new THREE.Vector3(
                    -0.62,
                    3.00,
                    -0.56
                ),
            ],
            '#101510'
        );

        createHose(
            [
                new THREE.Vector3(
                    0.30,
                    3.90,
                    -0.35
                ),

                new THREE.Vector3(
                    0.72,
                    3.62,
                    -0.46
                ),

                new THREE.Vector3(
                    0.62,
                    3.05,
                    -0.56
                ),
            ],
            '#101510'
        );

        /* ================================================================
           ASTRONAUT HEAD LIGHT
           ================================================================ */

        const helmetLight =
            new THREE.PointLight(
                '#dfff9c',
                1.6,
                4
            );

        helmetLight.position.set(
            0,
            4.25,
            0.8
        );

        astronaut.add(
            helmetLight
        );

        /* ================================================================
           ASTRONAUT RIM LIGHT
           ================================================================ */

        const astronautRimLight =
            new THREE.PointLight(
                '#9dff3f',
                12,
                9,
                2
            );

        astronautRimLight.position.set(
            2,
            3,
            2
        );

        scene.add(
            astronautRimLight
        );

        /* ================================================================
           ORANGE FILL LIGHT
           ================================================================ */

        const astronautOrangeLight =
            new THREE.PointLight(
                '#ff741d',
                8,
                7,
                2
            );

        astronautOrangeLight.position.set(
            -4,
            0,
            2
        );

        scene.add(
            astronautOrangeLight
        );

        /* ================================================================
           GROUND / ROCK PLATFORM
           ================================================================ */

        const groundGroup =
            new THREE.Group();

        groundGroup.position.set(
            -1.5,
            -3.9,
            0.5
        );

        scene.add(
            groundGroup
        );

        /* ================================================================
           ROCK MATERIAL
           ================================================================ */

        const rockMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    '#111812',

                roughness:
                    0.96,

                metalness:
                    0.02,
            });

        /* ================================================================
           LARGE ROCKS
           ================================================================ */

        for (
            let i = 0;
            i < 13;
            i++
        ) {
            const size =
                THREE.MathUtils.randFloat(
                    0.35,
                    1.3
                );

            const geometry =
                new THREE.DodecahedronGeometry(
                    size,
                    1
                );

            const rock =
                addMesh(
                    geometry,
                    rockMaterial,
                    groundGroup
                );

            rock.position.set(
                THREE.MathUtils.randFloat(
                    -7,
                    5
                ),

                THREE.MathUtils.randFloat(
                    -0.2,
                    0.55
                ),

                THREE.MathUtils.randFloat(
                    -1,
                    3
                )
            );

            rock.rotation.set(
                Math.random() *
                Math.PI,

                Math.random() *
                Math.PI,

                Math.random() *
                Math.PI
            );

            rock.scale.y =
                THREE.MathUtils.randFloat(
                    0.35,
                    0.85
                );
        }

        /* ================================================================
           FOREGROUND ROCK PLANE
           ================================================================ */

        const foregroundGroundGeometry =
            new THREE.PlaneGeometry(
                22,
                12,
                1,
                1
            );

        const foregroundGround =
            addMesh(
                foregroundGroundGeometry,
                new THREE.MeshStandardMaterial({
                    color:
                        '#060a07',
                    roughness:
                        1,
                }),
                groundGroup
            );

        foregroundGround.rotation.x =
            -Math.PI / 2;

        foregroundGround.position.y =
            -0.65;

        foregroundGround.position.z =
            1.4;

        /* ================================================================
           GREEN ATMOSPHERIC DUST
           ================================================================ */

        const dustCount =
            900;

        const dustPositions =
            new Float32Array(
                dustCount * 3
            );

        for (
            let i = 0;
            i < dustCount;
            i++
        ) {
            dustPositions[
                i * 3
            ] =
                THREE.MathUtils.randFloat(
                    -14,
                    14
                );

            dustPositions[
                i * 3 + 1
            ] =
                THREE.MathUtils.randFloat(
                    -4,
                    8
                );

            dustPositions[
                i * 3 + 2
            ] =
                THREE.MathUtils.randFloat(
                    -3,
                    5
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
                    '#7fff32',

                size:
                    0.025,

                transparent:
                    true,

                opacity:
                    0.20,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending,
            });

        const dust =
            new THREE.Points(
                dustGeometry,
                dustMaterial
            );

        particleSystem.add(
            dust
        );

        /* ================================================================
           WARM YELLOW DUST
           ================================================================ */

        const yellowDustCount =
            350;

        const yellowDustPositions =
            new Float32Array(
                yellowDustCount * 3
            );

        for (
            let i = 0;
            i <
            yellowDustCount;
            i++
        ) {
            yellowDustPositions[
                i * 3
            ] =
                THREE.MathUtils.randFloat(
                    -13,
                    13
                );

            yellowDustPositions[
                i * 3 + 1
            ] =
                THREE.MathUtils.randFloat(
                    -2,
                    7
                );

            yellowDustPositions[
                i * 3 + 2
            ] =
                THREE.MathUtils.randFloat(
                    -2,
                    4
                );
        }

        const yellowDustGeometry =
            new THREE.BufferGeometry();

        yellowDustGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
                yellowDustPositions,
                3
            )
        );

        const yellowDustMaterial =
            new THREE.PointsMaterial({
                color:
                    '#ffe84a',

                size:
                    0.020,

                transparent:
                    true,

                opacity:
                    0.14,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending,
            });

        const yellowDust =
            new THREE.Points(
                yellowDustGeometry,
                yellowDustMaterial
            );

        particleSystem.add(
            yellowDust
        );

        /* ================================================================
           LIGHTING — SPACE
           ================================================================ */

        const ambientLight =
            new THREE.AmbientLight(
                '#4d6849',
                0.48
            );

        scene.add(
            ambientLight
        );

        /* ================================================================
           KEY GREEN LIGHT
           ================================================================ */

        const keyLight =
            new THREE.DirectionalLight(
                '#c8ff65',
                2.2
            );

        keyLight.position.set(
            -4,
            7,
            8
        );

        keyLight.castShadow =
            true;

        keyLight.shadow.mapSize.width =
            1024;

        keyLight.shadow.mapSize.height =
            1024;

        scene.add(
            keyLight
        );

        /* ================================================================
           WARM ORANGE LIGHT
           ================================================================ */

        const warmLight =
            new THREE.DirectionalLight(
                '#ff7b24',
                1.1
            );

        warmLight.position.set(
            6,
            -2,
            5
        );

        scene.add(
            warmLight
        );

        /* ================================================================
           CINEMATIC GREEN BACKLIGHT
           ================================================================ */

        const backLight =
            new THREE.SpotLight(
                '#78ff32',
                20,
                25,
                Math.PI / 5,
                0.7,
                1.5
            );

        backLight.position.set(
            4,
            4,
            -4
        );

        backLight.target =
            astronaut;

        scene.add(
            backLight
        );

        /* ================================================================
           SUBTLE ORANGE LIGHT ON GROUND
           ================================================================ */

        const groundOrangeLight =
            new THREE.PointLight(
                '#ff5b16',
                9,
                12,
                2
            );

        groundOrangeLight.position.set(
            -4,
            -2.5,
            2
        );

        scene.add(
            groundOrangeLight
        );

        /* ================================================================
           CINEMATIC DARK FOREGROUND
           ================================================================ */

        const vignetteGeometry =
            new THREE.PlaneGeometry(
                2,
                2
            );

        const vignetteMaterial =
            new THREE.ShaderMaterial({
                transparent:
                    true,

                depthWrite:
                    false,

                depthTest:
                    false,

                uniforms: {},

                vertexShader: `
          varying vec2 vUv;

          void main() {

            vUv = uv;

            gl_Position =
              vec4(
                position,
                1.0
              );
          }
        `,

                fragmentShader: `
          varying vec2 vUv;

          void main() {

            float d =
              distance(
                vUv,
                vec2(
                  0.5,
                  0.52
                )
              );

            float vignette =
              smoothstep(
                0.82,
                0.25,
                d
              );

            float alpha =
              0.40 -
              vignette *
              0.40;

            gl_FragColor =
              vec4(
                0.0,
                0.0,
                0.0,
                alpha
              );
          }
        `,
            });

        const vignette =
            new THREE.Mesh(
                vignetteGeometry,
                vignetteMaterial
            );

        vignette.position.z =
            20;

        scene.add(
            vignette
        );

        /* ================================================================
           RESIZE
           ================================================================ */

        const handleResize =
            () => {
                if (!container) {
                    return;
                }

                const width =
                    container.clientWidth;

                const height =
                    container.clientHeight;

                if (
                    width <= 0 ||
                    height <= 0
                ) {
                    return;
                }

                camera.aspect =
                    width /
                    height;

                camera.updateProjectionMatrix();

                renderer.setPixelRatio(
                    Math.min(
                        window.devicePixelRatio,
                        2
                    )
                );

                renderer.setSize(
                    width,
                    height,
                    false
                );
            };

        window.addEventListener(
            'resize',
            handleResize
        );

        handleResize();

        /* ================================================================
           ANIMATION
           ================================================================ */

        const clock =
            new THREE.Clock();

        let animationFrame =
            0;

        const animate = () => {
            animationFrame =
                window.requestAnimationFrame(
                    animate
                );

            const elapsed =
                clock.getElapsedTime();

            /* ============================================================
               SMOOTH POINTER
               ============================================================ */

            smoothMouse.x +=
                (
                    mouse.x -
                    smoothMouse.x
                ) * 0.035;

            smoothMouse.y +=
                (
                    mouse.y -
                    smoothMouse.y
                ) * 0.035;

            /* ============================================================
               SCROLL
               ============================================================ */

            const progress =
                scrollProgressRef.current;

            /* ============================================================
               CAMERA PARALLAX
               ============================================================ */

            const cameraStrength =
                window.innerWidth < 700
                    ? 0.42
                    : 0.78;

            const targetCameraX =
                smoothMouse.x *
                cameraStrength;

            const targetCameraY =
                smoothMouse.y *
                cameraStrength;

            camera.position.x +=
                (
                    targetCameraX -
                    camera.position.x
                ) *
                0.035;

            camera.position.y +=
                (
                    1.4 +
                    targetCameraY -
                    camera.position.y
                ) *
                0.035;

            /* ============================================================
               CINEMATIC CAMERA Z
               ============================================================ */

            const targetZ =
                14 -
                progress *
                1.4;

            camera.position.z +=
                (
                    targetZ -
                    camera.position.z
                ) *
                0.025;

            /* ============================================================
               CAMERA TILT
               ============================================================ */

            camera.rotation.z +=
                (
                    smoothMouse.x *
                    -0.012 -
                    camera.rotation.z
                ) *
                0.025;

            /* ============================================================
               PLANET ROTATION
               ============================================================ */

            planet.rotation.y =
                -0.45 +
                elapsed *
                0.018;

            cloudShell.rotation.y =
                elapsed *
                0.026;

            atmosphere.rotation.y =
                -elapsed *
                0.008;

            atmosphericParticles.rotation.y =
                elapsed *
                0.022;

            /* ============================================================
               PLANET POINTER PARALLAX
               ============================================================ */

            planetSystem.position.x =
                3.2 +
                smoothMouse.x *
                0.42;

            planetSystem.position.y =
                -2.6 +
                smoothMouse.y *
                0.24;

            /* ============================================================
               ATMOSPHERIC RESPONSE
               ============================================================ */

            planetMaterial.uniforms.uTime.value =
                elapsed;

            atmosphereMaterial.uniforms.uTime.value =
                elapsed;

            /*
             * Slowly pulse atmospheric intensity.
             */

            cloudMaterial.opacity =
                0.085 +
                Math.sin(
                    elapsed *
                    0.45
                ) *
                0.018;

            /* ============================================================
               PLANET LIGHT PULSE
               ============================================================ */

            planetLight.intensity =
                40 +
                Math.sin(
                    elapsed *
                    0.7
                ) *
                3;

            orangePlanetLight.intensity =
                17 +
                Math.sin(
                    elapsed *
                    0.53
                ) *
                2;

            /* ============================================================
               ASTRONAUT PARALLAX
               ============================================================ */

            astronautSystem.position.x =
                smoothMouse.x *
                0.32;

            astronautSystem.position.y =
                smoothMouse.y *
                0.18;

            /*
             * Tiny cinematic body movement.
             */

            astronaut.rotation.y =
                0.22 +
                smoothMouse.x *
                0.035;

            astronaut.rotation.z =
                smoothMouse.x *
                -0.008;

            astronaut.position.y =
                -2.0 +
                Math.sin(
                    elapsed *
                    0.45
                ) *
                0.025;

            /* ============================================================
               ASTRONAUT HEAD RESPONSE
               ============================================================ */

            helmetGroup.rotation.y =
                smoothMouse.x *
                0.045;

            helmetGroup.rotation.x =
                smoothMouse.y *
                -0.025;

            /* ============================================================
               ARMS — SUBTLE FLOAT
               ============================================================ */

            leftArm.rotation.z =
                -0.24 +
                Math.sin(
                    elapsed *
                    0.55
                ) *
                0.008;

            rightArm.rotation.z =
                0.24 +
                Math.sin(
                    elapsed *
                    0.55 +
                    1.2
                ) *
                0.008;

            /* ============================================================
               LEGS — MICRO MOVEMENT
               ============================================================ */

            leftLeg.rotation.x =
                Math.sin(
                    elapsed *
                    0.35
                ) *
                0.004;

            rightLeg.rotation.x =
                Math.sin(
                    elapsed *
                    0.35 +
                    1.2
                ) *
                0.004;

            /* ============================================================
               VISOR LIGHT
               ============================================================ */

            helmetLight.intensity =
                1.45 +
                Math.sin(
                    elapsed *
                    1.5
                ) *
                0.15;

            /* ============================================================
               PARTICLES
               ============================================================ */

            dust.rotation.y =
                elapsed *
                0.006;

            dust.rotation.x =
                smoothMouse.y *
                0.025;

            yellowDust.rotation.y =
                -elapsed *
                0.004;

            yellowDust.rotation.x =
                smoothMouse.x *
                0.02;

            nebula.rotation.y =
                elapsed *
                0.0015;

            stars.rotation.y =
                elapsed *
                0.0008;

            stars.rotation.x =
                smoothMouse.y *
                0.012;

            /* ============================================================
               ORANGE LIGHT MOVEMENT
               ============================================================ */

            groundOrangeLight.position.x =
                -4 +
                Math.sin(
                    elapsed *
                    0.18
                ) *
                0.8;

            groundOrangeLight.position.z =
                2 +
                Math.cos(
                    elapsed *
                    0.22
                ) *
                0.4;

            /* ============================================================
               BACKLIGHT MOVEMENT
               ============================================================ */

            backLight.position.x =
                4 +
                Math.sin(
                    elapsed *
                    0.15
                ) *
                1.2;

            backLight.position.y =
                4 +
                Math.cos(
                    elapsed *
                    0.13
                ) *
                0.7;

            /* ============================================================
               RENDER
               ============================================================ */

            renderer.render(
                scene,
                camera
            );
        };

        animate();

        /* ================================================================
           CLEANUP
           ================================================================ */

        return () => {
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

            /* ------------------------------------------------------------
               GEOMETRIES
               ------------------------------------------------------------ */

            planetGeometry.dispose();

            cloudGeometry.dispose();

            atmosphereGeometry.dispose();

            atmosphericParticleGeometry.dispose();

            starGeometry.dispose();

            nebulaGeometry.dispose();

            dustGeometry.dispose();

            yellowDustGeometry.dispose();

            foregroundGroundGeometry.dispose();

            vignetteGeometry.dispose();

            /* ------------------------------------------------------------
               MATERIALS
               ------------------------------------------------------------ */

            planetMaterial.dispose();

            cloudMaterial.dispose();

            atmosphereMaterial.dispose();

            atmosphericParticleMaterial.dispose();

            starMaterial.dispose();

            nebulaMaterial.dispose();

            dustMaterial.dispose();

            yellowDustMaterial.dispose();

            vignetteMaterial.dispose();

            suitMaterial.dispose();

            suitDarkMaterial.dispose();

            blackMaterial.dispose();

            metalMaterial.dispose();

            visorMaterial.dispose();

            orangeSuitMaterial.dispose();

            /* ------------------------------------------------------------
               RENDERER
               ------------------------------------------------------------ */

            renderer.dispose();

            if (
                container.contains(
                    renderer.domElement
                )
            ) {
                container.removeChild(
                    renderer.domElement
                );
            }
        };
    }, []);

    /* ================================================================
       CONTAINER
       ================================================================ */

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0,
                background:
                    '#020603',
            }}
        />
    );
};

export default TauCetiScene;