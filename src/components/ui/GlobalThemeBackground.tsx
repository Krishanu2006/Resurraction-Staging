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

const globalSpaceThemeConfigs: Record<ThemeId, GlobalSpaceThemeConfig> = {
  'tau-ceti': {
    // Orange & Green World: vibrant orange nebula, emerald stardust, bio-green aura
    nebulaA: 0x22c55e,
    nebulaB: 0x0f1a0c,
    nebulaC: 0xf97316,
    nebulaOpacity: 0.24,
    starColor1: 0x4ade80,
    starColor2: 0xf97316,
    starColor3: 0xffffff,
    dustColor: 0x84cc16,
    rockColor: 0x182415,
    rockRimColor: 0xf97316,
    shootingStarColor: [1.0, 0.48, 0.1],
  },
  miller: {
    // Monochrome Tidal World: pure steel gray, silver mist, graphite void (NO blue!)
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
    shootingStarColor: [0.95, 0.95, 0.98],
  },
  pandora: {
    // Bioluminescent Ocean & Sky: electric cyan-blue, royal sapphire, glowing aqua
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
    shootingStarColor: [0.15, 0.85, 1.0],
  },
  kepler: {
    // Red Grass World: rich crimson red, ruby hydrogen, vermilion dusk
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
    shootingStarColor: [1.0, 0.42, 0.50],
  },
};

export const GlobalThemeBackground: React.FC<GlobalThemeBackgroundProps> = ({
  themeId,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<ThemeId>(themeId || 'tau-ceti');
  const [inActiveArea, setInActiveArea] = useState(false);

  /*
   * Keep theme synced with prop or html data-theme
   */
  useEffect(() => {
    if (themeId) {
      themeRef.current = themeId;
      return;
    }
    const root = document.documentElement;
    const currentAttr = (root.getAttribute('data-theme') as ThemeId) || 'tau-ceti';
    themeRef.current = currentAttr;

    const observer = new MutationObserver(() => {
      const updatedAttr = (root.getAttribute('data-theme') as ThemeId) || 'tau-ceti';
      themeRef.current = updatedAttr;
    });

    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [themeId]);

  /*
   * Observe scroll to activate from About section downwards
   * Hero is excluded.
   */
  useEffect(() => {
    const checkPosition = () => {
      const aboutEl = document.getElementById('about');
      if (!aboutEl) return;
      const rect = aboutEl.getBoundingClientRect();
      const isAboutOrBelow = rect.top <= window.innerHeight * 1.05;
      setInActiveArea(isAboutOrBelow);
    };

    window.addEventListener('scroll', checkPosition, { passive: true });
    window.addEventListener('resize', checkPosition, { passive: true });
    checkPosition();

    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, []);

  /*
   * Three.js Deep Space Interactive Canvas
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const initialThemeId = themeRef.current;
    const initialConfig =
      globalSpaceThemeConfigs[initialThemeId] || globalSpaceThemeConfigs['tau-ceti'];

    /* ============================================================
     * SCENE & CAMERA
     * ============================================================ */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      1,
      800
    );
    camera.position.set(0, 0, 95);

    /* ============================================================
     * RENDERER (Ultra Lightweight: 1 Draw Call per layer, no bloom overhead)
     * ============================================================ */
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'low-power',
      stencil: false,
      depth: false,
    });
    renderer.setClearColor(0x000000, 0);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    /* ============================================================
     * 1. PROCEDURAL NEBULA GAS CLOUD (Volumetric Deep Space Glow)
     * ============================================================ */
    const nebulaUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(initialConfig.nebulaA) },
      uColorB: { value: new THREE.Color(initialConfig.nebulaB) },
      uColorC: { value: new THREE.Color(initialConfig.nebulaC) },
      uOpacity: { value: initialConfig.nebulaOpacity },
    };

    const nebulaMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: nebulaUniforms,
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
        uniform vec2 uMouse;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform float uOpacity;

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
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = rot * p * 2.02;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = (vUv - 0.5) * 1.8;
          uv += uMouse * 0.04;

          float n1 = fbm(uv * 1.4 + vec2(uTime * 0.015, uTime * 0.012));
          float n2 = fbm(uv * 2.4 - vec2(uTime * 0.012, -uTime * 0.015) + n1 * 0.5);

          float d = length(uv);
          float vignette = smoothstep(1.35, 0.15, d);

          vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.65, n1));
          col = mix(col, uColorC, smoothstep(0.4, 0.85, n2));

          float alpha = smoothstep(0.22, 0.72, n2) * vignette * uOpacity;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const nebulaMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 200),
      nebulaMaterial
    );
    nebulaMesh.position.set(0, 0, -85);
    scene.add(nebulaMesh);

    /* ============================================================
     * 2. MULTI-LAYER STARFIELD & DRIFTING COSMIC DUST
     * ============================================================ */
    const starCount = isMobile ? 220 : 440;
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);
    const starSpeeds = new Float32Array(starCount);

    const tmpColor = new THREE.Color();
    const c1 = new THREE.Color(initialConfig.starColor1);
    const c2 = new THREE.Color(initialConfig.starColor2);
    const c3 = new THREE.Color(initialConfig.starColor3);

    const boundsX = isMobile ? 100 : 165;
    const boundsY = isMobile ? 75 : 115;
    const boundsZFar = -160;
    const boundsZNear = 45;

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * boundsX * 2;
      const y = (Math.random() - 0.5) * boundsY * 2;
      const z = boundsZFar + Math.random() * (boundsZNear - boundsZFar);

      starPositions[i3] = x;
      starPositions[i3 + 1] = y;
      starPositions[i3 + 2] = z;

      // Slow drift with z-movement giving deep space flight sensation
      starVelocities[i3] = (Math.random() - 0.5) * 0.04;
      starVelocities[i3 + 1] = (Math.random() - 0.5) * 0.03;
      starVelocities[i3 + 2] = 0.05 + Math.random() * 0.09;

      const r = Math.random();
      if (r < 0.45) {
        tmpColor.copy(c1);
      } else if (r < 0.8) {
        tmpColor.copy(c2);
      } else {
        tmpColor.copy(c3);
      }

      starColors[i3] = tmpColor.r;
      starColors[i3 + 1] = tmpColor.g;
      starColors[i3 + 2] = tmpColor.b;

      // Foreground particles are slightly larger dust motes
      const isForeground = z > -30;
      starSizes[i] = (isForeground ? 2.5 + Math.random() * 3.0 : 1.2 + Math.random() * 1.8) * pixelRatio;
      starPhases[i] = Math.random() * Math.PI * 2;
      starSpeeds[i] = 0.6 + Math.random() * 1.5;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
    starGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(starSpeeds, 1));

    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float size;
        attribute float aPhase;
        attribute float aSpeed;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;

        void main() {
          vColor = color;
          vTwinkle = sin(uTime * aSpeed + aPhase) * 0.35 + 0.65;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (150.0 / -mvPosition.z);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.04, dist) * vTwinkle;
          gl_FragColor = vec4(vColor, alpha * 0.9);
        }
      `,
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    /* ============================================================
     * 3. DRIFTING LOW-POLY COSMIC ASTEROID FRAGMENTS (Instanced)
     * ============================================================ */
    const rockCount = isMobile ? 8 : 15;
    const rockGeometry = new THREE.DodecahedronGeometry(1.8, 1);

    const rockUniforms = {
      uRockColor: { value: new THREE.Color(initialConfig.rockColor) },
      uRimColor: { value: new THREE.Color(initialConfig.rockRimColor) },
      uLightPos: { value: new THREE.Vector3(-40, 50, 40) },
    };

    const rockMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: rockUniforms,
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        uniform vec3 uRockColor;
        uniform vec3 uRimColor;
        uniform vec3 uLightPos;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 L = normalize(uLightPos - vWorldPos);
          vec3 V = normalize(cameraPosition - vWorldPos);

          float diff = max(dot(N, L), 0.0);
          float rim = pow(1.0 - max(dot(N, V), 0.0), 2.8);

          vec3 col = uRockColor * (0.25 + diff * 0.75);
          col += uRimColor * rim * 0.85;

          gl_FragColor = vec4(col, 0.72);
        }
      `,
    });

    const rockInstanced = new THREE.InstancedMesh(rockGeometry, rockMaterial, rockCount);
    const dummy = new THREE.Object3D();

    type RockData = {
      pos: THREE.Vector3;
      rot: THREE.Euler;
      rotSpeed: THREE.Vector3;
      driftSpeed: THREE.Vector3;
      scale: number;
    };

    const rocksData: RockData[] = [];

    for (let i = 0; i < rockCount; i++) {
      const rockPos = new THREE.Vector3(
        (Math.random() - 0.5) * boundsX * 1.8,
        (Math.random() - 0.5) * boundsY * 1.8,
        -90 + Math.random() * 80
      );
      const scale = 0.6 + Math.random() * 1.4;
      dummy.position.copy(rockPos);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.updateMatrix();
      rockInstanced.setMatrixAt(i, dummy.matrix);

      rocksData.push({
        pos: rockPos,
        rot: dummy.rotation.clone(),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.005
        ),
        driftSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          0.015 + Math.random() * 0.03
        ),
        scale,
      });
    }

    rockInstanced.instanceMatrix.needsUpdate = true;
    scene.add(rockInstanced);

    /* ============================================================
     * 4. THEMED SHOOTING STARS / MICRO-METEORS
     * ============================================================ */
    const meteorCount = 3;
    const meteorPositions = new Float32Array(meteorCount * 2 * 3);
    const meteorColors = new Float32Array(meteorCount * 2 * 3);

    const meteorGeometry = new THREE.BufferGeometry();
    meteorGeometry.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));
    meteorGeometry.setAttribute('color', new THREE.BufferAttribute(meteorColors, 3));

    const meteorMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const meteorsMesh = new THREE.LineSegments(meteorGeometry, meteorMaterial);
    scene.add(meteorsMesh);

    type Meteor = {
      head: THREE.Vector3;
      dir: THREE.Vector3;
      speed: number;
      length: number;
      life: number;
      active: boolean;
      delay: number;
    };

    const meteors: Meteor[] = [];
    for (let i = 0; i < meteorCount; i++) {
      meteors.push({
        head: new THREE.Vector3(),
        dir: new THREE.Vector3(-1, -0.4, 0).normalize(),
        speed: 1.8 + Math.random() * 1.2,
        length: 22 + Math.random() * 18,
        life: 0,
        active: false,
        delay: 2 + Math.random() * 6,
      });
    }

    /* ============================================================
     * 5. AURORA WISPS — flowing light curtains via vertex shader
     * ============================================================ */
    const auroraUniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(initialConfig.nebulaA) },
      uColorC: { value: new THREE.Color(initialConfig.nebulaC) },
    };

    const auroraMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: auroraUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave = sin(pos.x * 0.04 + uTime * 0.6) * 4.5
                     + sin(pos.x * 0.09 - uTime * 0.4) * 2.5;
          pos.y += wave;
          pos.z += sin(pos.x * 0.07 + uTime * 0.35) * 3.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform vec3 uColorA;
        uniform vec3 uColorC;
        uniform float uTime;
        void main() {
          float stripe = abs(sin(vUv.x * 3.14159));
          float alpha = smoothstep(0.0, 0.4, stripe) * smoothstep(1.0, 0.55, vUv.y) * 0.28;
          vec3 col = mix(uColorA, uColorC, vUv.x);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const auroraMeshes: THREE.Mesh[] = [];
    for (let ai = 0; ai < (isMobile ? 1 : 2); ai++) {
      const aGeo = new THREE.PlaneGeometry(280, 28, 60, 6);
      const aMesh = new THREE.Mesh(aGeo, auroraMaterial);
      aMesh.position.set(0, 20 + ai * 22, -70 - ai * 12);
      aMesh.rotation.x = -0.15 + ai * 0.08;
      scene.add(aMesh);
      auroraMeshes.push(aMesh);
    }

    /* ============================================================
     * 8. ATMOSPHERIC PLANETARY SPHERES (Matching Space Background)
     * ============================================================ */
    const planetUniforms = {
      uBaseColor: { value: new THREE.Color(initialConfig.nebulaB) },
      uAtmosphereColor: { value: new THREE.Color(initialConfig.nebulaC) },
      uGlowColor: { value: new THREE.Color(initialConfig.starColor2) },
      uLightPos: { value: new THREE.Vector3(50, 40, 60) },
      uTime: { value: 0 },
    };

    const planetMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: planetUniforms,
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewDir;
        uniform vec3 uBaseColor;
        uniform vec3 uAtmosphereColor;
        uniform vec3 uGlowColor;
        uniform vec3 uLightPos;
        uniform float uTime;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewDir);
          vec3 L = normalize(uLightPos - vWorldPos);

          float diff = max(dot(N, L), 0.0);
          float shadow = smoothstep(-0.2, 0.4, dot(N, L));

          float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
          float outerGlow = pow(1.0 - max(dot(N, V), 0.0), 1.8);

          vec3 planetBody = mix(uBaseColor * 0.15, uBaseColor * 0.85, diff * shadow);
          vec3 col = planetBody + uAtmosphereColor * rim * 1.6 + uGlowColor * outerGlow * 0.35;

          float edgeAlpha = smoothstep(0.0, 0.15, dot(N, V));
          float alpha = (0.55 + rim * 0.45) * edgeAlpha;

          gl_FragColor = vec4(col, alpha * 0.88);
        }
      `,
    });

    const planet1Mesh = new THREE.Mesh(new THREE.SphereGeometry(32, 32, 32), planetMaterial);
    planet1Mesh.position.set(-30, -22, -85);
    scene.add(planet1Mesh);

    const planet2Mesh = new THREE.Mesh(new THREE.SphereGeometry(22, 28, 28), planetMaterial);
    planet2Mesh.position.set(38, 14, -95);
    scene.add(planet2Mesh);

    const planet3Mesh = new THREE.Mesh(new THREE.SphereGeometry(14, 24, 24), planetMaterial);
    planet3Mesh.position.set(32, -32, -110);
    scene.add(planet3Mesh);

    /* ============================================================
     * 9. HORIZON EQUATOR GRID LINE
     * ============================================================ */
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-250, -8, -60),
      new THREE.Vector3(250, -8, -60),
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: initialConfig.rockRimColor,
      transparent: true,
      opacity: 0.22,
    });
    const horizonLine = new THREE.Line(lineGeo, lineMat);
    scene.add(horizonLine);

    /* ============================================================
     * MOUSE INTERACTION & SCROLL DYNAMICS
     * ============================================================ */
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      worldX: 0,
      worldY: 0,
      hasMoved: false,
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouse.targetX = (clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(clientY / window.innerHeight) * 2 + 1;
      mouse.hasMoved = true;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let isCardHovered = false;
    let cardHoverIntensity = 0;

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest('[data-card], .card, .prize-card, .rule-item, .interactive-card');
      if (card) isCardHovered = true;
    };

    const handlePointerOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const card = target.closest('[data-card], .card, .prize-card, .rule-item, .interactive-card');
      if (!card) isCardHovered = false;
    };

    window.addEventListener('mouseover', handlePointerOver, { passive: true });
    window.addEventListener('mouseout', handlePointerOut, { passive: true });

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = (currentScrollY - lastScrollY) * 0.08;
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    /* ============================================================
     * ANIMATION LOOP
     * ============================================================ */
    let isRunning = true;
    let animId = 0;

    const currentC1 = new THREE.Color(initialConfig.starColor1);
    const currentC2 = new THREE.Color(initialConfig.starColor2);
    const currentC3 = new THREE.Color(initialConfig.starColor3);
    const currentNebulaA = new THREE.Color(initialConfig.nebulaA);
    const currentNebulaB = new THREE.Color(initialConfig.nebulaB);
    const currentNebulaC = new THREE.Color(initialConfig.nebulaC);
    const currentRock = new THREE.Color(initialConfig.rockColor);
    const currentRockRim = new THREE.Color(initialConfig.rockRimColor);

    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Light on processing: pause calculations if out of active area or tab is hidden
      if (!isRunning || document.hidden) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      /* 1. Mouse smoothing & Card Hover Surge */
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      mouse.worldX = mouse.x * boundsX * 0.85;
      mouse.worldY = mouse.y * boundsY * 0.85;

      cardHoverIntensity += ((isCardHovered ? 1.0 : 0.0) - cardHoverIntensity) * 0.08;

      /* 2. Camera deep-space parallax drift with hover focus */
      if (!reducedMotion) {
        const camParallax = 14 + cardHoverIntensity * 8;
        camera.position.x += (mouse.x * camParallax - camera.position.x) * 0.035;
        camera.position.y += (mouse.y * (camParallax * 0.7) - camera.position.y) * 0.035;
        camera.position.z += ((95 - cardHoverIntensity * 8) - camera.position.z) * 0.04;
        camera.lookAt(0, 0, 0);
      }

      /* 3. Theme dynamic interpolation */
      const currentTheme = themeRef.current;
      const targetConfig =
        globalSpaceThemeConfigs[currentTheme] || globalSpaceThemeConfigs['tau-ceti'];
      const themeLerp = Math.min(delta * 6.0, 0.25);

      currentC1.lerp(new THREE.Color(targetConfig.starColor1), themeLerp);
      currentC2.lerp(new THREE.Color(targetConfig.starColor2), themeLerp);
      currentC3.lerp(new THREE.Color(targetConfig.starColor3), themeLerp);
      currentNebulaA.lerp(new THREE.Color(targetConfig.nebulaA), themeLerp);
      currentNebulaB.lerp(new THREE.Color(targetConfig.nebulaB), themeLerp);
      currentNebulaC.lerp(new THREE.Color(targetConfig.nebulaC), themeLerp);
      currentRock.lerp(new THREE.Color(targetConfig.rockColor), themeLerp);
      currentRockRim.lerp(new THREE.Color(targetConfig.rockRimColor), themeLerp);

      // Update nebula uniforms
      nebulaUniforms.uTime.value = elapsed;
      nebulaUniforms.uMouse.value.set(mouse.x, mouse.y);
      nebulaUniforms.uColorA.value.copy(currentNebulaA);
      nebulaUniforms.uColorB.value.copy(currentNebulaB);
      nebulaUniforms.uColorC.value.copy(currentNebulaC);
      nebulaUniforms.uOpacity.value = THREE.MathUtils.lerp(
        nebulaUniforms.uOpacity.value,
        targetConfig.nebulaOpacity + cardHoverIntensity * 0.08,
        themeLerp
      );

      // Update rock uniforms with card hover 3D lighting shift
      rockUniforms.uRockColor.value.copy(currentRock);
      rockUniforms.uRimColor.value.copy(currentRockRim);
      rockUniforms.uLightPos.value.set(
        mouse.x * (40 + cardHoverIntensity * 25) - 20,
        mouse.y * (30 + cardHoverIntensity * 20) + 40,
        50 + cardHoverIntensity * 20
      );

      // Update stars uniform
      starMaterial.uniforms.uTime.value = elapsed;

      /* 4. Update Starfield & Cosmic Dust */
      const starPosAttr = starGeometry.attributes.position as THREE.BufferAttribute;
      const starColAttr = starGeometry.attributes.color as THREE.BufferAttribute;
      const starPosArr = starPosAttr.array as Float32Array;
      const starColArr = starColAttr.array as Float32Array;

      // Damp scroll velocity
      scrollVelocity *= 0.92;

      const interactionRadius = isMobile ? 30 : 45;
      const interactionRadiusSq = interactionRadius * interactionRadius;

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        if (!reducedMotion) {
          // Continuous forward space drift + scroll inertia
          starPosArr[i3] += starVelocities[i3];
          starPosArr[i3 + 1] += starVelocities[i3 + 1] - scrollVelocity * 0.08;
          starPosArr[i3 + 2] += starVelocities[i3 + 2] + Math.abs(scrollVelocity) * 0.06;

          // Wrap boundaries: when stars pass camera, re-spawn in deep distance
          if (starPosArr[i3 + 2] > boundsZNear) {
            starPosArr[i3 + 2] = boundsZFar;
            starPosArr[i3] = (Math.random() - 0.5) * boundsX * 2;
            starPosArr[i3 + 1] = (Math.random() - 0.5) * boundsY * 2;
          }
          if (starPosArr[i3] > boundsX) starPosArr[i3] = -boundsX;
          if (starPosArr[i3] < -boundsX) starPosArr[i3] = boundsX;
          if (starPosArr[i3 + 1] > boundsY) starPosArr[i3 + 1] = -boundsY;
          if (starPosArr[i3 + 1] < -boundsY) starPosArr[i3 + 1] = boundsY;

          // Interactive fluid wake from mouse cursor
          if (mouse.hasMoved) {
            const dx = starPosArr[i3] - mouse.worldX;
            const dy = starPosArr[i3 + 1] - mouse.worldY;
            const dSq = dx * dx + dy * dy;

            if (dSq < interactionRadiusSq && dSq > 0.01) {
              const d = Math.sqrt(dSq);
              const force = (1.0 - d / interactionRadius) * 0.85;
              starPosArr[i3] += (dx / d) * force;
              starPosArr[i3 + 1] += (dy / d) * force;
            }
          }
        }

        // Color theme update
        const mod = i % 3;
        const targetC = mod === 0 ? currentC1 : mod === 1 ? currentC2 : currentC3;
        starColArr[i3] = targetC.r;
        starColArr[i3 + 1] = targetC.g;
        starColArr[i3 + 2] = targetC.b;
      }

      starPosAttr.needsUpdate = true;
      starColAttr.needsUpdate = true;

      /* 5. Update Floating Asteroids */
      if (!reducedMotion) {
        for (let i = 0; i < rockCount; i++) {
          const rData = rocksData[i];
          rData.rot.x += rData.rotSpeed.x;
          rData.rot.y += rData.rotSpeed.y;
          rData.rot.z += rData.rotSpeed.z;

          rData.pos.add(rData.driftSpeed);

          // Wrap rock positions in deep space
          if (rData.pos.z > 20) rData.pos.z = -100;
          if (rData.pos.x > boundsX * 1.2) rData.pos.x = -boundsX * 1.2;
          if (rData.pos.x < -boundsX * 1.2) rData.pos.x = boundsX * 1.2;
          if (rData.pos.y > boundsY * 1.2) rData.pos.y = -boundsY * 1.2;
          if (rData.pos.y < -boundsY * 1.2) rData.pos.y = boundsY * 1.2;

          dummy.position.copy(rData.pos);
          dummy.rotation.copy(rData.rot);
          dummy.scale.setScalar(rData.scale);
          dummy.updateMatrix();
          rockInstanced.setMatrixAt(i, dummy.matrix);
        }
        rockInstanced.instanceMatrix.needsUpdate = true;
      }

      /* 6. Update Themed Shooting Stars */
      const mPosAttr = meteorGeometry.attributes.position as THREE.BufferAttribute;
      const mColAttr = meteorGeometry.attributes.color as THREE.BufferAttribute;
      const mPosArr = mPosAttr.array as Float32Array;
      const mColArr = mColAttr.array as Float32Array;
      const starColors = targetConfig.shootingStarColor;

      for (let i = 0; i < meteorCount; i++) {
        const m = meteors[i];
        const idx = i * 6;

        if (!m.active) {
          m.delay -= delta;
          if (m.delay <= 0 && !reducedMotion) {
            m.active = true;
            m.life = 0;
            m.head.set(
              (Math.random() - 0.2) * boundsX * 1.5,
              (Math.random() + 0.2) * boundsY * 1.2,
              -50 - Math.random() * 60
            );
            const angle = -0.35 - Math.random() * 0.35;
            m.dir.set(Math.cos(angle), Math.sin(angle), 0).normalize();
          } else {
            // Hide inactive line
            mPosArr[idx] = 0;
            mPosArr[idx + 1] = 0;
            mPosArr[idx + 2] = 0;
            mPosArr[idx + 3] = 0;
            mPosArr[idx + 4] = 0;
            mPosArr[idx + 5] = 0;
            continue;
          }
        }

        m.life += delta * 1.4;
        m.head.addScaledVector(m.dir, m.speed);

        const tail = m.head.clone().addScaledVector(m.dir, -m.length);
        const fade = Math.sin(Math.min(m.life, 1.0) * Math.PI);

        mPosArr[idx] = m.head.x;
        mPosArr[idx + 1] = m.head.y;
        mPosArr[idx + 2] = m.head.z;

        mPosArr[idx + 3] = tail.x;
        mPosArr[idx + 4] = tail.y;
        mPosArr[idx + 5] = tail.z;

        // Head bright color
        mColArr[idx] = starColors[0] * fade;
        mColArr[idx + 1] = starColors[1] * fade;
        mColArr[idx + 2] = starColors[2] * fade;

        // Tail faded color
        mColArr[idx + 3] = starColors[0] * fade * 0.15;
        mColArr[idx + 4] = starColors[1] * fade * 0.15;
        mColArr[idx + 5] = starColors[2] * fade * 0.15;

        if (m.life >= 1.0) {
          m.active = false;
          m.delay = 3 + Math.random() * 7;
        }
      }

      mPosAttr.needsUpdate = true;
      mColAttr.needsUpdate = true;

      /* 7. Aurora Wisps — update time + theme colors */
      auroraUniforms.uTime.value = elapsed;
      auroraUniforms.uColorA.value.copy(currentNebulaA);
      auroraUniforms.uColorC.value.copy(currentNebulaC);

      /* 8. Atmospheric Planetary Spheres & Horizon Line */
      planetUniforms.uBaseColor.value.copy(currentNebulaB);
      planetUniforms.uAtmosphereColor.value.copy(currentNebulaC);
      planetUniforms.uGlowColor.value.copy(currentC2);
      planetUniforms.uTime.value = elapsed;
      lineMat.color.copy(currentRockRim);

      if (!reducedMotion) {
        planet1Mesh.rotation.y = elapsed * 0.015;
        planet2Mesh.rotation.y = -elapsed * 0.02;
        planet3Mesh.rotation.y = elapsed * 0.025;
      }

      /* 9. Render */
      renderer.render(scene, camera);
    };

    animate();

    /* ============================================================
     * CLEANUP
     * ============================================================ */
    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseover', handlePointerOver);
      window.removeEventListener('mouseout', handlePointerOut);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      nebulaGeometry_dispose: {
        nebulaMesh.geometry.dispose();
        nebulaMaterial.dispose();
      }
      starGeometry.dispose();
      starMaterial.dispose();
      rockGeometry.dispose();
      rockMaterial.dispose();
      meteorGeometry.dispose();
      meteorMaterial.dispose();

      // Atmospheric background elements cleanup
      auroraMeshes.forEach((am) => { am.geometry.dispose(); });
      auroraMaterial.dispose();

      planet1Mesh.geometry.dispose();
      planet2Mesh.geometry.dispose();
      planet3Mesh.geometry.dispose();
      planetMaterial.dispose();

      lineGeo.dispose();
      lineMat.dispose();

      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="global-space-bg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: inActiveArea ? 0.95 : 0,
        transition: 'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity',
      }}
    />
  );
};

export default GlobalThemeBackground;
