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

interface ThemeHeroSceneProps {
  themeId: Exclude<ThemeId, 'tau-ceti'>;
  scrollProgress?: number;
}

const ThemeHeroScene: React.FC<ThemeHeroSceneProps> = ({
  themeId,
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const mobile = window.innerWidth < 768;

    /* ============================================================
       SCENE
       ============================================================ */

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a12);

    /* ============================================================
       CAMERA — near edge-on view
       ============================================================ */

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    /* Almost perfectly edge-on — this is critical for the look */
    camera.position.set(0, 1.2, 32);
    camera.lookAt(0, 0, 0);

    /* ============================================================
       RENDERER
       ============================================================ */

    const renderer = new THREE.WebGLRenderer({
      antialias: !mobile,
      alpha: false,
      powerPreference: 'high-performance',
    });

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      mobile ? 1.25 : 2.0
    );

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.appendChild(renderer.domElement);

    /* ============================================================
       POST PROCESSING
       ============================================================ */

    const composer = new EffectComposer(renderer);

    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.15,
      0.85,
      0.35
    );

    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ============================================================
       ROOT
       ============================================================ */

    const root = new THREE.Group();
    scene.add(root);

    /* ============================================================
       INTERACTION STATE
       ============================================================ */

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      velocityX: 0,
      velocityY: 0,
      screenX: 0.5,
      screenY: 0.5,
      isDown: false,
      holdTime: 0,
    };

    const interaction = {
      energy: 0,
      targetEnergy: 0,
      proximity: 0,
      targetProximity: 0,
      hoverOnBH: 0,
      targetHoverOnBH: 0,
      flare: 0,
      targetFlare: 0,
      idleCharge: 0,
      idleTime: 0,
    };

    const updateHover = () => {
      const dx = pointer.screenX - 0.5;
      const dy = pointer.screenY - 0.5;
      const d = Math.sqrt(dx * dx + dy * dy);
      interaction.targetHoverOnBH = THREE.MathUtils.clamp(
        1 - d * 3.5,
        0,
        1
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);

      pointer.targetX = x;
      pointer.targetY = y;
      pointer.screenX = event.clientX / window.innerWidth;
      pointer.screenY = event.clientY / window.innerHeight;

      updateHover();

      const dist = Math.sqrt(x * x + y * y);

      interaction.targetProximity = THREE.MathUtils.clamp(
        1 - dist * 0.85,
        0,
        1
      );

      interaction.targetEnergy = THREE.MathUtils.clamp(
        Math.abs(x) * 0.15 +
          Math.abs(y) * 0.1 +
          interaction.targetProximity * 0.35 +
          interaction.targetHoverOnBH * 0.9,
        0,
        1
      );

      interaction.idleTime = 0;
    };

    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      interaction.targetEnergy = 0;
      interaction.targetProximity = 0;
      interaction.targetHoverOnBH = 0;
    };

    const onPointerDown = () => {
      pointer.isDown = true;
    };

    const onPointerUp = () => {
      pointer.isDown = false;
    };

    window.addEventListener('pointermove', onPointerMove, {
      passive: true,
    });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    /* ============================================================
       DISPOSABLES
       ============================================================ */

    const disposables: Array<{ dispose: () => void }> = [];

    const track = <T extends { dispose: () => void }>(item: T) => {
      disposables.push(item);
      return item;
    };

    /* ============================================================
       NOISE CHUNK (shared)
       ============================================================ */

    const noiseChunk = /* glsl */ `
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
        for (int i = 0; i < 7; i++) {
          v += a * noise(p);
          p = rot * p * 2.02;
          a *= 0.5;
        }
        return v;
      }

      /* Curl-like streak noise for the disk's flowing filaments */
      float streak(vec2 p, float t) {
        vec2 q = p;
        q.x += fbm(p * 0.6 + vec2(t * 0.06, 0.0)) * 2.2;
        q.y += fbm(p * 0.8 + vec2(0.0, t * 0.05)) * 1.1;
        return fbm(q * 2.4 + vec2(t * 0.18, 0.0));
      }
    `;

    /* ============================================================
       STAR FIELD — very faint, background only
       ============================================================ */

    const starCount = mobile ? 700 : 1600;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const starSize = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1200 + Math.random() * 3000;

      starPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i3 + 1] = r * Math.cos(phi);
      starPos[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const warm = Math.random();
      starCol[i3] = 0.85 + warm * 0.15;
      starCol[i3 + 1] = 0.88 + warm * 0.10;
      starCol[i3 + 2] = 0.95 + (1 - warm) * 0.05;

      starSize[i] = 0.5 + Math.random() * 1.4;
    }

    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSize, 1));

    const starMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute vec3 color;
          uniform float uTime;
          uniform float uPixelRatio;
          varying vec3 vColor;
          varying float vTwinkle;

          void main() {
            vColor = color;
            float phase = fract(dot(position.xy, vec2(12.9898, 78.233)));
            vTwinkle = 0.65 + 0.35 * sin(uTime * 0.7 + phase * 6.2831);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPixelRatio;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vTwinkle;

          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            float a = smoothstep(0.5, 0.05, d);
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor * vTwinkle, a * 0.5);
          }
        `,
      })
    );

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ============================================================
       BLACK HOLE SHADOW — perfect dark circle
       ============================================================ */

    const shadowGeo = track(new THREE.SphereGeometry(3.2, 128, 96));

    const shadowMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        depthWrite: true,
        depthTest: true,
      })
    );

    const blackHole = new THREE.Mesh(shadowGeo, shadowMat);
    blackHole.position.set(0, 0, 0);
    blackHole.scale.set(1, 1, 1);
    root.add(blackHole);

    /* ============================================================
       PHOTON RING / INNER HALO
       ------------------------------------------------------------
       The thin bright ring right at the shadow's edge.
       In the reference this is the brightest part of the image.
       ============================================================ */

    const photonGeo = track(
      new THREE.RingGeometry(3.15, 4.05, 1024, 8)
    );

    const photonMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uFlare: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uEnergy;
          uniform float uFlare;

          ${noiseChunk}

          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float a = atan(p.y, p.x);

            /* Sharp inner edge, soft outer — the ring hugs
               the shadow exactly */
            float innerEdge = smoothstep(0.0, 0.15, r);
            float outerEdge = 1.0 - smoothstep(0.4, 1.0, r);
            float ring = innerEdge * outerEdge;

            /* Fine turbulence for the plasma texture */
            float turb = fbm(vec2(
              a * 32.0 - uTime * 0.5,
              r * 60.0
            ));

            float density = ring * (0.85 + turb * 0.4);

            density *= 1.0 + uEnergy * 0.9 + uFlare * 2.5;

            /* Hot core: nearly white */
            vec3 col = mix(
              vec3(1.0, 0.62, 0.22),
              vec3(1.0, 0.98, 0.92),
              smoothstep(0.2, 0.85, turb)
            );

            col *= density * 1.6;

            gl_FragColor = vec4(col, density);
          }
        `,
      })
    );

    const photonRing = new THREE.Mesh(photonGeo, photonMat);
    photonRing.position.set(0, 0, 0);
    photonRing.renderOrder = 12;
    root.add(photonRing);

    /* ============================================================
       AMBIENT OUTER GLOW
       ------------------------------------------------------------
       The soft orange haze bleeding into the surrounding space.
       In the reference this extends way beyond the disk itself.
       ============================================================ */

    const ambientGeo = track(
      new THREE.SphereGeometry(22, 64, 48)
    );

    const ambientMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uFlare: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          uniform float uTime;
          uniform float uEnergy;
          uniform float uFlare;

          void main() {
            vec3 V = normalize(cameraPosition - vWorldPos);
            float NdotV = max(dot(normalize(vNormal), V), 0.0);

            float fres = pow(1.0 - NdotV, 3.5);

            vec3 col = vec3(0.85, 0.35, 0.10);

            float alpha = fres * 0.14 *
              (1.0 + uEnergy * 0.5 + uFlare * 1.2);

            gl_FragColor = vec4(col * alpha, alpha);
          }
        `,
      })
    );

    const ambientGlow = new THREE.Mesh(ambientGeo, ambientMat);
    ambientGlow.position.set(0, 0, 0);
    ambientGlow.renderOrder = 1;
    root.add(ambientGlow);

    /* ============================================================
       MAIN ACCRETION DISK
       ------------------------------------------------------------
       Nearly edge-on. The disk's near edge passes IN FRONT of
       the shadow at the bottom of the black hole.
       ============================================================ */

    const diskGeo = track(
      new THREE.RingGeometry(3.4, 80, 1024, 200)
    );

    const diskMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uEnergy: { value: 0 },
          uFlare: { value: 0 },
          uHover: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uScroll;
          uniform float uEnergy;
          uniform float uFlare;
          uniform float uHover;

          ${noiseChunk}

          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float a = atan(p.y, p.x);

            /* Disk mask — sharp inner edge near shadow,
               long outer tail */
            float innerMask = smoothstep(0.03, 0.06, r);
            float outerMask = 1.0 - smoothstep(0.55, 1.0, r);
            float diskMask = innerMask * outerMask;

            /* Three-octave streaks following the disk flow */
            vec2 polar = vec2(a * 4.0, r * 10.0 - uTime * 0.32);

            float largeStreak = streak(polar, uTime);
            float midStreak = fbm(polar * 2.8 + vec2(uTime * 0.18, 0.0));
            float fineStreak = fbm(polar * 8.0 + vec2(uTime * 0.12, 0.0));

            /* Doppler beaming — left side brighter (approaching) */
            float doppler = 0.35 + 0.9 * pow(
              0.5 + 0.5 * cos(a - 0.0),
              2.8
            );

            /* Inner hottest region */
            float innerHeat = 1.0 - smoothstep(0.02, 0.14, r);
            float midHeat = 1.0 - smoothstep(0.15, 0.5, r);

            float density =
              diskMask * (
                0.30 +
                largeStreak * 0.5 +
                midStreak * 0.35 +
                fineStreak * 0.22
              );

            density *= doppler;
            density *= (0.35 + midHeat * 0.65);
            density += innerHeat * diskMask * 0.85;

            density *= 1.0 + uEnergy * 0.4 + uFlare * 1.5 + uHover * 0.6;

            /* Physical blackbody temperature gradient */
            vec3 deepRed = vec3(0.28, 0.030, 0.005);
            vec3 red = vec3(0.65, 0.08, 0.012);
            vec3 orange = vec3(1.00, 0.42, 0.06);
            vec3 amber = vec3(1.00, 0.68, 0.22);
            vec3 gold = vec3(1.00, 0.85, 0.45);
            vec3 cream = vec3(1.00, 0.95, 0.78);
            vec3 white = vec3(1.00, 0.99, 0.95);

            vec3 col = mix(deepRed, red, largeStreak);
            col = mix(col, orange, midStreak);
            col = mix(col, amber, fineStreak);
            col = mix(col, gold, smoothstep(0.55, 0.85, largeStreak));
            col = mix(col, cream, smoothstep(0.75, 0.95, midStreak));

            /* Inner disc is white-hot */
            col = mix(col, white, innerHeat * 1.4);

            /* Bright veins */
            col += gold * pow(midStreak, 4.0) * 0.5;
            col += cream * pow(fineStreak, 6.0) * 0.35;

            col *= 1.0 + uEnergy * 0.3 + uFlare * 0.8 + uHover * 0.4;

            float alpha = clamp(
              density * 1.05,
              0.0,
              0.99
            );

            col *= alpha * 1.55;

            gl_FragColor = vec4(col, alpha);
          }
        `,
      })
    );

    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.set(0, 0, 0);
    /* Nearly flat — the camera does the tilting */
    disk.rotation.x = Math.PI * 0.5;
    disk.renderOrder = 5;
    root.add(disk);

    /* ============================================================
       TOP LENSED ARC
       ------------------------------------------------------------
       The far side of the disk bent up over the shadow.
       This is THE defining feature of the reference.
       ============================================================ */

    const topArcGeo = track(
      new THREE.RingGeometry(
        3.35,    /* inner — right at shadow edge */
        7.5,     /* outer */
        1024,
        128,
        0,       /* start angle */
        Math.PI  /* half circle — top only */
      )
    );

    const topArcMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uFlare: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uEnergy;
          uniform float uFlare;

          ${noiseChunk}

          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float a = atan(p.y, p.x);

            /* Thick at shadow, thins outward */
            float inner = smoothstep(0.05, 0.20, r);
            float outer = 1.0 - smoothstep(0.55, 0.98, r);
            float mask = inner * outer;

            vec2 polar = vec2(a * 6.0 - uTime * 0.24, r * 12.0);
            float gas = streak(polar, uTime);
            float detail = fbm(polar * 3.5);

            float alpha = mask * (0.25 + gas * 0.6 + detail * 0.3);
            alpha *= 0.85 + uEnergy * 0.4 + uFlare * 1.0;

            vec3 col = mix(
              vec3(0.55, 0.09, 0.012),
              vec3(1.00, 0.82, 0.45),
              gas
            );
            col = mix(col, vec3(1.0, 0.95, 0.78), smoothstep(0.55, 0.95, gas));

            col *= alpha * 1.6 * (1.0 + uFlare * 0.7);

            gl_FragColor = vec4(col, alpha);
          }
        `,
      })
    );

    const topArc = new THREE.Mesh(topArcGeo, topArcMat);
    topArc.position.set(0, 0, 0);
    topArc.renderOrder = 6;
    root.add(topArc);

    /* ============================================================
       BOTTOM LENSED ARC
       ------------------------------------------------------------
       The mirror below, dimmer than the top arc.
       ============================================================ */

    const botArcGeo = track(
      new THREE.RingGeometry(
        3.35,
        6.8,
        1024,
        128,
        Math.PI,
        Math.PI
      )
    );

    const botArcMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uFlare: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uEnergy;
          uniform float uFlare;

          ${noiseChunk}

          void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float a = atan(p.y, p.x);

            float inner = smoothstep(0.05, 0.20, r);
            float outer = 1.0 - smoothstep(0.52, 0.95, r);
            float mask = inner * outer;

            vec2 polar = vec2(a * 5.0 + uTime * 0.20, r * 10.0);
            float gas = streak(polar, uTime);
            float detail = fbm(polar * 3.0);

            float alpha = mask * (0.15 + gas * 0.45 + detail * 0.2);
            alpha *= 0.55 + uEnergy * 0.28 + uFlare * 0.8;

            vec3 col = mix(
              vec3(0.42, 0.055, 0.008),
              vec3(1.00, 0.62, 0.25),
              gas
            );

            col *= alpha * 1.4 * (1.0 + uFlare * 0.55);

            gl_FragColor = vec4(col, alpha);
          }
        `,
      })
    );

    const botArc = new THREE.Mesh(botArcGeo, botArcMat);
    botArc.position.set(0, 0, 0);
    botArc.renderOrder = 4;
    root.add(botArc);

    /* ============================================================
       PLASMA PARTICLES — dust in the disk
       ============================================================ */

    const particleCount = mobile ? 3000 : 6500;
    const particlePos = new Float32Array(particleCount * 3);
    const particleCol = new Float32Array(particleCount * 3);
    const particleSize = new Float32Array(particleCount);
    const particlePhase = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 3.5 + Math.pow(Math.random(), 1.5) * 60;
      const angle = Math.random() * Math.PI * 2;
      const thickness =
        (Math.random() - 0.5) * (0.06 + radius * 0.008);

      particlePos[i3] = Math.cos(angle) * radius;
      particlePos[i3 + 1] = thickness;
      particlePos[i3 + 2] = Math.sin(angle) * radius;

      const heat = THREE.MathUtils.clamp(1 - radius / 60, 0, 1);

      particleCol[i3] = 0.65 + heat * 0.35;
      particleCol[i3 + 1] = 0.10 + heat * 0.85;
      particleCol[i3 + 2] = 0.01 + heat * 0.85;

      particleSize[i] =
        (mobile ? 0.35 : 0.5) * (0.5 + Math.random() * 1.0);

      particlePhase[i] = Math.random() * Math.PI * 2;
    }

    const particleGeo = track(new THREE.BufferGeometry());
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePos, 3)
    );
    particleGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(particleCol, 3)
    );
    particleGeo.setAttribute(
      'aSize',
      new THREE.BufferAttribute(particleSize, 1)
    );
    particleGeo.setAttribute(
      'aPhase',
      new THREE.BufferAttribute(particlePhase, 1)
    );

    const particleMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uFlare: { value: 0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aPhase;
          attribute vec3 color;

          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uEnergy;
          uniform float uFlare;

          varying vec3 vColor;
          varying float vFlicker;

          void main() {
            vColor = color;
            float flicker = 0.55 + 0.45 * sin(uTime * 1.6 + aPhase);
            vFlicker = flicker * (1.0 + uEnergy * 0.5 + uFlare * 1.0);

            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPixelRatio;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vFlicker;

          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            float a = smoothstep(0.5, 0.0, d);
            a *= a;
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor * vFlicker, a * 0.65);
          }
        `,
      })
    );

    const gasParticles = new THREE.Points(particleGeo, particleMat);
    gasParticles.rotation.x = Math.PI * 0.5;
    gasParticles.renderOrder = 3;
    root.add(gasParticles);

    /* ============================================================
       LIGHTS
       ============================================================ */

    const bhLight = new THREE.PointLight(0xff8a32, 4.0, 60, 2);
    bhLight.position.set(0, 0, 0);
    root.add(bhLight);

    /* ============================================================
       RESIZE
       ============================================================ */

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    /* ============================================================
       ANIMATION
       ============================================================ */

    const clock = new THREE.Clock();
    let animationFrame = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      animationFrame = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const scroll = scrollRef.current;

      const prevX = pointer.x;
      const prevY = pointer.y;

      pointer.x += (pointer.targetX - pointer.x) * 0.05;
      pointer.y += (pointer.targetY - pointer.y) * 0.05;

      pointer.velocityX = pointer.x - prevX;
      pointer.velocityY = pointer.y - prevY;

      interaction.energy = THREE.MathUtils.lerp(
        interaction.energy,
        interaction.targetEnergy,
        0.04
      );
      interaction.proximity = THREE.MathUtils.lerp(
        interaction.proximity,
        interaction.targetProximity,
        0.05
      );
      interaction.hoverOnBH = THREE.MathUtils.lerp(
        interaction.hoverOnBH,
        interaction.targetHoverOnBH,
        0.06
      );

      /* Idle charge */
      interaction.idleTime += 1 / 60;
      if (interaction.idleTime > 1.5) {
        interaction.idleCharge = Math.min(
          interaction.idleCharge + 0.003,
          0.35
        );
      } else {
        interaction.idleCharge *= 0.95;
      }

      /* Click-hold flare */
      if (pointer.isDown) {
        pointer.holdTime += 1 / 60;
        interaction.targetFlare = Math.min(
          pointer.holdTime * 1.8,
          1.5
        );
      } else {
        pointer.holdTime = 0;
        interaction.targetFlare *= 0.92;
      }

      interaction.flare = THREE.MathUtils.lerp(
        interaction.flare,
        interaction.targetFlare,
        0.12
      );

      /* Camera — gentle parallax, big scroll dolly */
      const targetCamZ = 32 - scroll * 16;
      const targetCamX = pointer.x * 2.5;
      const targetCamY = 1.2 + pointer.y * 1.2 + scroll * 0.4;

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;

      if (!reducedMotion) {
        camera.position.z += Math.sin(elapsed * 0.16) * 0.05;
      }

      camera.lookAt(pointer.x * 0.5, pointer.y * 0.3, 0);

      /* Root parallax */
      root.rotation.y += (pointer.x * 0.035 - root.rotation.y) * 0.03;
      root.rotation.x += (-pointer.y * 0.02 - root.rotation.x) * 0.03;

      /* Disk rotation */
      if (!reducedMotion) {
        const spin =
          0.0016 +
          interaction.energy * 0.0035 +
          interaction.flare * 0.006 +
          interaction.idleCharge * 0.002;

        disk.rotation.z = elapsed * spin;
        gasParticles.rotation.z = elapsed * spin;

        topArc.rotation.z = elapsed * 0.0008;
        botArc.rotation.z = elapsed * 0.0006;

        photonRing.rotation.z = -elapsed * 0.0012;
      }

      /* Uniforms */
      const applyUniforms = (mat: THREE.ShaderMaterial) => {
        if (mat.uniforms.uTime) {
          mat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
        }
        if (mat.uniforms.uEnergy) {
          mat.uniforms.uEnergy.value =
            interaction.energy + interaction.idleCharge;
        }
        if (mat.uniforms.uFlare) {
          mat.uniforms.uFlare.value = interaction.flare;
        }
        if (mat.uniforms.uHover) {
          mat.uniforms.uHover.value = interaction.hoverOnBH;
        }
      };

      applyUniforms(diskMat);
      applyUniforms(topArcMat);
      applyUniforms(botArcMat);
      applyUniforms(photonMat);
      applyUniforms(particleMat);
      applyUniforms(ambientMat);

      if (diskMat.uniforms.uScroll) {
        diskMat.uniforms.uScroll.value = scroll;
      }

      if (starMat.uniforms.uTime) {
        starMat.uniforms.uTime.value = elapsed;
      }

      /* Light */
      bhLight.intensity =
        3.5 +
        interaction.energy * 2.5 +
        interaction.flare * 4.5 +
        interaction.hoverOnBH * 1.8;

      /* Stars drift */
      if (!reducedMotion) {
        stars.rotation.y += pointer.velocityX * 0.0004;
        stars.rotation.x += pointer.velocityY * 0.0003;
      }

      /* Bloom */
      bloom.strength =
        1.05 +
        interaction.energy * 0.4 +
        interaction.flare * 0.9 +
        interaction.hoverOnBH * 0.5;

      bloom.radius =
        0.85 +
        interaction.proximity * 0.2 +
        interaction.hoverOnBH * 0.15;

      /* Exposure */
      renderer.toneMappingExposure =
        1.05 +
        interaction.energy * 0.08 +
        interaction.flare * 0.12;

      /* Shadow micro pulse */
      const pulse = 1 + Math.sin(elapsed * 0.4) * 0.006;
      blackHole.scale.set(pulse, pulse, pulse);

      composer.render();
    };

    animate();

    /* ============================================================
       CLEANUP
       ============================================================ */

    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);

      disposables.forEach((item) => item.dispose());

      composer.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [themeId]);

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
        zIndex: 1,
      }}
    />
  );
};

export default ThemeHeroScene;