import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import keplerImage from '../sections/track_images/kepler.png';

interface KeplerHeroSceneProps {
  scrollProgress?: number;
}

export const KeplerHeroScene: React.FC<KeplerHeroSceneProps> = ({
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

    const isMobile = window.innerWidth < 768;

    /* ============================================================
       SCENE & ENVIRONMENT
       ============================================================ */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0306);

    // Height-based cinematic atmospheric fog
    const sceneFog = new THREE.FogExp2(0x180509, 0.0075);
    scene.fog = sceneFog;

    /* ============================================================
       CAMERA
       ============================================================ */
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2500
    );
    camera.position.set(0, 1.2, 16);
    camera.lookAt(0, 0, 0);

    /* ============================================================
       RENDERER
       ============================================================ */
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    });

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      isMobile ? 1.25 : 1.75
    );

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';

    container.appendChild(renderer.domElement);

    /* ============================================================
       POST-PROCESSING (BLOOM)
       ============================================================ */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      isMobile ? 0.75 : 1.05, // strength
      0.45,                   // radius
      0.72                    // threshold (keeps bloom focused on sun, embers, and reflections)
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    /* ============================================================
       DISPOSABLES TRACKER
       ============================================================ */
    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    /* ============================================================
       INTERACTION & PARALLAX STATE
       ============================================================ */
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      dragX: 0,
      dragY: 0,
      isDown: false,
      lastX: 0,
      lastY: 0,
    };

    const onPointerMove = (e: PointerEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -((e.clientY / window.innerHeight) * 2 - 1);

      if (mouse.isDown) {
        const dx = (e.clientX - mouse.lastX) / window.innerWidth;
        const dy = (e.clientY - mouse.lastY) / window.innerHeight;
        mouse.dragX += dx * 1.5;
        mouse.dragY += dy * 1.5;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      mouse.isDown = true;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    };

    const onPointerUp = () => {
      mouse.isDown = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    /* ============================================================
       TEXTURE LOADER
       ============================================================ */
    const textureLoader = new THREE.TextureLoader();
    const keplerTexture = track(textureLoader.load(keplerImage));
    keplerTexture.colorSpace = THREE.SRGBColorSpace;
    keplerTexture.wrapS = THREE.RepeatWrapping;
    keplerTexture.wrapT = THREE.ClampToEdgeWrapping;

    /* ============================================================
       SCENE ROOT GROUPS
       - spaceGroup: Orbit view of Kepler-186f
       - reentryGroup: High-speed atmospheric entry streaks
       - landscapeGroup: Photorealistic Alien Terrain of Kepler-186f
       ============================================================ */
    const spaceGroup = new THREE.Group();
    const reentryGroup = new THREE.Group();
    const landscapeGroup = new THREE.Group();

    scene.add(spaceGroup);
    scene.add(reentryGroup);
    scene.add(landscapeGroup);

    landscapeGroup.position.set(0, 0, 0);
    reentryGroup.position.set(0, 0, 0);

    /* ============================================================
       SHARED GLSL CHUNKS (ADVANCED MULTIFRACTAL NOISE)
       ============================================================ */
    const glslNoise = /* glsl */ `
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // Realistic Eroded Mountain Heightmap with Canyon Valley
      float getLandscapeElevation(vec2 p) {
        // Canyon corridor along X=0 for the camera flight
        float valleyDist = abs(p.x);
        float valleyWall = smoothstep(6.0, 38.0, valleyDist);

        // Domain warping for natural tectonic folding
        vec2 warp = vec2(
          snoise(vec3(p * 0.012, 0.4)),
          snoise(vec3(p * 0.012 + vec2(4.2, 1.8), 0.9))
        ) * 16.0;

        vec2 q = p + warp;

        // Sharp Alpine Ridge Multifractal (1.0 - abs(noise))
        float r1 = 1.0 - abs(snoise(vec3(q * 0.016, 1.2)));
        r1 = r1 * r1 * 26.0;

        float r2 = 1.0 - abs(snoise(vec3(q * 0.038, 2.5)));
        r2 = r2 * 9.5;

        // Rolling foothills & basalt terraces
        float hills = snoise(vec3(p * 0.075, 4.0)) * 2.8;

        float totalElevation = (r1 + r2 + hills) * valleyWall;

        // Central Obsidian Riverbed channel
        float riverDepth = smoothstep(6.0, 0.0, valleyDist) * 1.5;
        totalElevation = max(totalElevation - riverDepth, 0.2);

        return totalElevation;
      }
    `;

    /* ============================================================
       1. SPACE GROUP: ORBITAL KEPLER-186F
       ============================================================ */
    const PLANET_RADIUS = 5.0;
    const planetRoot = new THREE.Group();
    planetRoot.position.set(3.4, -0.6, 0);
    spaceGroup.add(planetRoot);

    const sunLightDir = new THREE.Vector3(-28, 16, 12).normalize();

    // Planet Core
    const planetGeo = track(new THREE.SphereGeometry(PLANET_RADIUS, isMobile ? 64 : 96, isMobile ? 64 : 96));
    const planetMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTexture: { value: keplerTexture },
          uSunDir: { value: sunLightDir },
          uTime: { value: 0 },
          uAlpha: { value: 1.0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uTexture;
          uniform vec3 uSunDir;
          uniform float uTime;
          uniform float uAlpha;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          void main() {
            vec4 tex = texture2D(uTexture, vUv);
            vec3 N = normalize(vNormal);
            vec3 L = normalize(uSunDir);
            vec3 V = normalize(cameraPosition - vWorldPos);

            float NdotL = dot(N, L);
            float diff = clamp(NdotL * 0.5 + 0.5, 0.0, 1.0);

            // Twilight terminator scattering
            float terminator = smoothstep(-0.25, 0.25, NdotL) * (1.0 - smoothstep(0.05, 0.65, NdotL));
            vec3 twilightColor = vec3(1.0, 0.38, 0.18) * terminator * 1.8;

            // Specular ocean reflection
            vec3 H = normalize(L + V);
            float spec = pow(max(dot(N, H), 0.0), 32.0) * (1.0 - tex.r * 0.5) * smoothstep(0.0, 0.25, NdotL);
            vec3 specColor = vec3(1.0, 0.68, 0.5) * spec * 1.6;

            vec3 dayColor = tex.rgb * vec3(1.2, 0.76, 0.72);
            vec3 nightColor = tex.rgb * vec3(0.08, 0.02, 0.04);
            vec3 finalColor = mix(nightColor, dayColor, diff * diff) + twilightColor + specColor;

            gl_FragColor = vec4(finalColor, uAlpha);
          }
        `,
      })
    );
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetRoot.add(planetMesh);

    // Planet Atmospheric Limb
    const atmosGeo = track(new THREE.SphereGeometry(PLANET_RADIUS * 1.085, isMobile ? 48 : 64, isMobile ? 48 : 64));
    const atmosMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDir: { value: sunLightDir },
          uAlpha: { value: 1.0 },
        },
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
          uniform vec3 uSunDir;
          uniform float uAlpha;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          void main() {
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 N = normalize(vNormal);
            float rim = pow(1.0 - max(dot(V, N), 0.0), 3.2);
            float sunAlign = max(dot(N, normalize(uSunDir)), 0.0);
            float flare = pow(sunAlign, 1.8) * 1.5 + 0.35;

            vec3 atmosColor = mix(vec3(0.55, 0.08, 0.15), vec3(1.0, 0.52, 0.22), sunAlign);
            float a = rim * flare * 0.95 * uAlpha;
            gl_FragColor = vec4(atmosColor * a, a);
          }
        `,
      })
    );
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    planetRoot.add(atmosMesh);

    // Orbital Debris Ring
    const ringGeo = track(new THREE.RingGeometry(PLANET_RADIUS * 1.32, PLANET_RADIUS * 1.95, isMobile ? 64 : 128, 4));
    const ringMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDir: { value: sunLightDir },
          uAlpha: { value: 1.0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float dist = length(p) * 2.0;
            float band = sin(dist * 62.0) * 0.5 + 0.5;
            float edgeFade = smoothstep(0.02, 0.15, dist) * (1.0 - smoothstep(0.85, 1.0, dist));
            vec3 ringColor = mix(vec3(0.75, 0.20, 0.28), vec3(1.0, 0.68, 0.45), band);
            float a = band * edgeFade * 0.55 * uAlpha;
            gl_FragColor = vec4(ringColor * a, a);
          }
        `,
      })
    );
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.42;
    ringMesh.rotation.y = -Math.PI * 0.14;
    planetRoot.add(ringMesh);

    // Starfield in Orbit
    const starCount = isMobile ? 600 : 1400;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const starHues = [
      new THREE.Color(0xff4a5a),
      new THREE.Color(0xff8d55),
      new THREE.Color(0xffd5ad),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 250 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i3 + 1] = radius * Math.cos(phi);
      starPos[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = starHues[Math.floor(Math.random() * starHues.length)];
      starCol[i3] = color.r;
      starCol[i3 + 1] = color.g;
      starCol[i3 + 2] = color.b;

      starSizes[i] = 1.0 + Math.random() * 2.2;
    }

    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 1.0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          varying float vTwinkle;
          uniform float uTime;
          uniform float uPixelRatio;
          void main() {
            vColor = color;
            float seed = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);
            vTwinkle = 0.6 + 0.4 * sin(uTime * 1.8 + seed * 6.28);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * vTwinkle * uPixelRatio * (180.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vTwinkle;
          uniform float uAlpha;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            if (dist > 0.5) discard;
            float a = smoothstep(0.5, 0.05, dist) * 0.85 * uAlpha;
            gl_FragColor = vec4(vColor * vTwinkle, a);
          }
        `,
      })
    );
    const starMesh = new THREE.Points(starGeo, starMat);
    spaceGroup.add(starMesh);

    /* ============================================================
       2. RE-ENTRY GROUP: HIGH-SPEED ATMOSPHERIC ENTRY STREAKS
       ============================================================ */
    const streakCount = isMobile ? 80 : 200;
    const streakPos = new Float32Array(streakCount * 3);
    const streakSpeed = new Float32Array(streakCount);

    for (let i = 0; i < streakCount; i++) {
      const i3 = i * 3;
      streakPos[i3] = (Math.random() - 0.5) * 24;
      streakPos[i3 + 1] = (Math.random() - 0.5) * 18;
      streakPos[i3 + 2] = -30 + Math.random() * 40;
      streakSpeed[i] = 1.0 + Math.random() * 1.5;
    }

    const streakGeo = track(new THREE.BufferGeometry());
    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));

    const streakMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          uniform float uPixelRatio;
          varying float vDist;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDist = -mv.z;
            gl_PointSize = clamp((38.0 / -mv.z) * uPixelRatio, 1.5, 12.0);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          void main() {
            vec2 p = gl_PointCoord - 0.5;
            float d = length(p);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.02, d) * uAlpha;
            vec3 col = mix(vec3(1.0, 0.35, 0.15), vec3(1.0, 0.9, 0.55), 1.0 - d * 2.0);
            gl_FragColor = vec4(col * a * 2.2, a);
          }
        `,
      })
    );
    const streakMesh = new THREE.Points(streakGeo, streakMat);
    reentryGroup.add(streakMesh);

    /* ============================================================
       3. LANDSCAPE GROUP: PHOTOREALISTIC ALIEN CANYON OF KEPLER-186F
       ============================================================ */

    // 3.1 ATMOSPHERIC TWILIGHT SKY DOME
    const skyDomeGeo = track(new THREE.SphereGeometry(320, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5));
    const skyDomeMat = track(
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        transparent: true,
        uniforms: {
          uAlpha: { value: 0.0 },
          uSunPos: { value: new THREE.Vector3(0, 16, -170) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorldPos;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          uniform vec3 uSunPos;
          varying vec3 vWorldPos;

          void main() {
            vec3 V = normalize(vWorldPos);
            vec3 L = normalize(uSunPos);

            // Zenith to Horizon angle
            float height = clamp(V.y, 0.0, 1.0);

            // Red Dwarf sunset atmospheric scattering
            float sunDot = max(dot(V, L), 0.0);
            float sunGlow = pow(sunDot, 6.0) * 1.8;

            vec3 zenithColor  = vec3(0.04, 0.01, 0.025); // Deep cosmic void
            vec3 midSkyColor  = vec3(0.42, 0.06, 0.12);  // Rich ruby twilight
            vec3 horizonColor = vec3(0.98, 0.38, 0.16);  // Blazing vermilion sunset

            vec3 sky = mix(horizonColor, midSkyColor, smoothstep(0.0, 0.28, height));
            sky = mix(sky, zenithColor, smoothstep(0.28, 0.95, height));
            sky += vec3(1.0, 0.72, 0.45) * sunGlow;

            gl_FragColor = vec4(sky, uAlpha);
          }
        `,
      })
    );
    const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    landscapeGroup.add(skyDomeMesh);

    // 3.2 THE RED DWARF HOST STAR (KEPLER-186) ON THE HORIZON
    const horizonStarGroup = new THREE.Group();
    horizonStarGroup.position.set(0, 16, -170);
    landscapeGroup.add(horizonStarGroup);

    // Glowing Star Core
    const sunCoreGeo = track(new THREE.SphereGeometry(14, 48, 48));
    const sunCoreMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uAlpha;
          void main() {
            float pulse = sin(uTime * 1.5) * 0.05 + 0.95;
            vec3 core = vec3(1.0, 0.42, 0.22) * pulse * 2.4;
            gl_FragColor = vec4(core, uAlpha);
          }
        `,
      })
    );
    const sunCoreMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    horizonStarGroup.add(sunCoreMesh);

    // Coronal God-Ray Flare Halo
    const sunHaloGeo = track(new THREE.PlaneGeometry(95, 95));
    const sunHaloMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float d = length(p) * 2.0;
            float glow = exp(-d * 2.2);

            // Solar ray flare spikes
            float angle = atan(p.y, p.x);
            float rays = sin(angle * 12.0 + uTime * 0.3) * 0.12 + 0.88;
            glow *= rays;

            vec3 col = mix(vec3(1.0, 0.25, 0.15), vec3(1.0, 0.82, 0.45), glow);
            float a = glow * uAlpha * 0.92;
            gl_FragColor = vec4(col * a, a);
          }
        `,
      })
    );
    const sunHaloMesh = new THREE.Mesh(sunHaloGeo, sunHaloMat);
    horizonStarGroup.add(sunHaloMesh);

    // Two Alien Moons in Twilight Sky
    const moonGeo = track(new THREE.SphereGeometry(3.8, 32, 32));
    const moonMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x541e28,
        roughness: 0.85,
        metalness: 0.15,
        transparent: true,
      })
    );
    const moon1 = new THREE.Mesh(moonGeo, moonMat);
    moon1.position.set(-48, 52, -150);
    moon1.scale.set(1.4, 1.4, 1.4);
    landscapeGroup.add(moon1);

    const moon2 = new THREE.Mesh(moonGeo, moonMat);
    moon2.position.set(58, 62, -165);
    moon2.scale.set(0.75, 0.75, 0.75);
    landscapeGroup.add(moon2);

    // 3.3 PROCEDURAL MOUNTAIN CANYON TERRAIN (ANALYTICAL NORMALS & GEOLOGICAL STRATIFICATION)
    const terrainRes = isMobile ? 120 : 200;
    const terrainGeo = track(new THREE.PlaneGeometry(360, 360, terrainRes, terrainRes));
    terrainGeo.rotateX(-Math.PI * 0.5);

    const terrainMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.0 },
          uSunPos: { value: new THREE.Vector3(0, 16, -170) },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vWorldPos;
          varying vec2 vUv;
          varying float vElevation;
          varying vec3 vAnalyticalNormal;

          ${glslNoise}

          void main() {
            vUv = uv;
            vec3 pos = position;

            // Height calculation
            float h = getLandscapeElevation(pos.xz);
            pos.y = h;
            vElevation = h;

            // Analytical Finite-Difference Normals (Eliminates triangular facet artifacts)
            float eps = 0.22;
            float hR = getLandscapeElevation(pos.xz + vec2(eps, 0.0));
            float hU = getLandscapeElevation(pos.xz + vec2(0.0, eps));
            vAnalyticalNormal = normalize(vec3(h - hR, eps, h - hU));

            vec4 world = modelMatrix * vec4(pos, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          uniform vec3 uSunPos;
          uniform float uTime;
          varying vec3 vWorldPos;
          varying vec2 vUv;
          varying float vElevation;
          varying vec3 vAnalyticalNormal;

          ${glslNoise}

          void main() {
            vec3 N = normalize(vAnalyticalNormal);
            vec3 L = normalize(uSunPos - vWorldPos);
            vec3 V = normalize(cameraPosition - vWorldPos);

            // Slope factor: 0.0 = completely flat, 1.0 = vertical cliff
            float slope = clamp(1.0 - N.y, 0.0, 1.0);

            // Low-angle grazing sunlight diffuse with warm terminator wrap
            float NdotL = dot(N, L);
            float diff = clamp(NdotL * 0.65 + 0.35, 0.0, 1.0);

            // --- 1. GEOLOGICAL ROCK STRATIFICATION (Sedimentary Cliff Layers) ---
            float strataNoise = snoise(vec3(vWorldPos.y * 0.8, vWorldPos.x * 0.04, 0.0));
            vec3 darkBasalt   = vec3(0.12, 0.04, 0.06); // Dark volcanic slate
            vec3 ironRedStone = vec3(0.48, 0.11, 0.15); // Weathered iron oxide
            vec3 cliffRock = mix(darkBasalt, ironRedStone, strataNoise * 0.5 + 0.5);

            // Fine rock micro-bump detail
            float rockGrain = snoise(vWorldPos * 1.5) * 0.08;
            cliffRock += vec3(rockGrain);

            // --- 2. CRIMSON ALIEN VEGETATION (Photosynthetic Lichen & Moss) ---
            vec3 scarletMoss = vec3(0.82, 0.16, 0.22); // #cf2e3f
            vec3 deepVelvet  = vec3(0.55, 0.08, 0.14); // #8a1825
            float floraNoise = snoise(vec3(vWorldPos.xz * 0.18, 1.0)) * 0.5 + 0.5;
            vec3 alienFoliage = mix(deepVelvet, scarletMoss, floraNoise);

            // Backlit Sub-surface Scattering on foliage
            float sss = pow(clamp(dot(V, -L), 0.0, 1.0), 3.0) * (1.0 - slope);
            alienFoliage += vec3(1.0, 0.45, 0.25) * sss * 0.7;

            // Blend Cliffs vs Foliage based on slope
            vec3 terrainAlbedo = mix(alienFoliage, cliffRock, smoothstep(0.28, 0.65, slope));

            // High Mountain Peak Geothermal Fissures
            float fissure = smoothstep(18.0, 32.0, vElevation) * max(0.0, slope * 0.8);
            vec3 fissureGlow = vec3(1.0, 0.45, 0.22) * fissure * 1.4;

            // --- 3. CENTRAL LIQUID OBSIDIAN RIVER (Low Elevation) ---
            float isWater = 1.0 - smoothstep(0.3, 1.2, vElevation);

            // Water ripple perturbation
            vec3 waterNormal = normalize(vec3(
              N.x + sin(vWorldPos.z * 1.2 + uTime * 2.0) * 0.06,
              1.0,
              N.z + cos(vWorldPos.x * 1.5 + uTime * 2.0) * 0.06
            ));

            vec3 H = normalize(L + V);
            float waterSpec = pow(max(dot(waterNormal, H), 0.0), 64.0);
            float fresnel = pow(1.0 - max(dot(V, waterNormal), 0.0), 4.0);

            vec3 waterDeep = vec3(0.03, 0.008, 0.018); // Dark obsidian liquid
            vec3 waterReflection = mix(vec3(0.95, 0.35, 0.18), vec3(1.0, 0.85, 0.55), waterSpec);
            vec3 liquidSurface = mix(waterDeep, waterReflection, fresnel * 0.85 + waterSpec * 1.8);

            // Combine Land and River
            vec3 surfaceColor = mix(terrainAlbedo * (diff * vec3(1.15, 0.72, 0.62)) + fissureGlow, liquidSurface, isWater);

            // Mountain Crest Rim Highlight (from the Red Dwarf sun)
            float rim = pow(clamp(1.0 - max(dot(V, N), 0.0), 0.0, 1.0), 4.0) * max(dot(N, L), 0.0);
            surfaceColor += vec3(1.0, 0.55, 0.28) * rim * 1.2;

            // --- 4. VOLUMETRIC AERIAL PERSPECTIVE (Atmospheric Valley Mist) ---
            float dist = length(cameraPosition - vWorldPos);
            float distanceHaze = clamp((dist - 15.0) / 240.0, 0.0, 1.0);

            // Height-based valley fog (nestled in low canyons)
            float valleyFog = clamp(exp(-(vWorldPos.y - 1.5) * 0.14), 0.0, 1.0) * clamp(dist / 60.0, 0.0, 1.0);
            float totalFog = clamp(distanceHaze * 0.75 + valleyFog * 0.55, 0.0, 1.0);

            vec3 fogColor = mix(vec3(0.18, 0.04, 0.08), vec3(0.95, 0.35, 0.18), pow(max(dot(V, L), 0.0), 4.0) * 0.6);

            vec3 finalColor = mix(surfaceColor, fogColor, totalFog);
            gl_FragColor = vec4(finalColor, uAlpha);
          }
        `,
      })
    );
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    landscapeGroup.add(terrainMesh);

    // 3.4 GEOLOGICAL BOULDERS & ALIEN FLORA INSTANCES
    const rockCount = isMobile ? 35 : 75;
    const rockGeo = track(new THREE.DodecahedronGeometry(0.8, 1));
    const rockMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x380e16,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
      })
    );
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < rockCount; i++) {
      // Clustered along canyon edges
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (5.5 + Math.random() * 24.0);
      const z = 20.0 - Math.random() * 140.0;
      const scale = 0.6 + Math.random() * 1.8;

      dummy.position.set(x, 0.8 + Math.random() * 2.5, z);
      dummy.scale.set(scale * (0.8 + Math.random() * 0.4), scale, scale * (0.8 + Math.random() * 0.4));
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);
    }
    rocks.instanceMatrix.needsUpdate = true;
    landscapeGroup.add(rocks);

    // 3.5 FLOATING BIOLUMINESCENT SPORES & VALLEY EMBERS
    const sporeCount = isMobile ? 120 : 300;
    const sporePos = new Float32Array(sporeCount * 3);
    const sporeVel = new Float32Array(sporeCount * 3);

    for (let i = 0; i < sporeCount; i++) {
      const i3 = i * 3;
      sporePos[i3] = (Math.random() - 0.5) * 45.0;
      sporePos[i3 + 1] = 1.0 + Math.random() * 14.0;
      sporePos[i3 + 2] = 20.0 - Math.random() * 120.0;

      sporeVel[i3] = (Math.random() - 0.5) * 0.015;
      sporeVel[i3 + 1] = 0.005 + Math.random() * 0.012;
      sporeVel[i3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    const sporeGeo = track(new THREE.BufferGeometry());
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));

    const sporeMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          uniform float uPixelRatio;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = clamp((120.0 / -mv.z) * uPixelRatio, 2.0, 12.0);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          void main() {
            vec2 p = gl_PointCoord - 0.5;
            float d = length(p);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.02, d) * uAlpha * 0.85;
            vec3 col = mix(vec3(1.0, 0.28, 0.18), vec3(1.0, 0.85, 0.45), 1.0 - d * 2.0);
            gl_FragColor = vec4(col * a * 1.8, a);
          }
        `,
      })
    );
    const sporeMesh = new THREE.Points(sporeGeo, sporeMat);
    landscapeGroup.add(sporeMesh);

    /* ============================================================
       LIGHTS
       ============================================================ */
    // Main directional sunlight from Red Dwarf
    const sunLight = new THREE.DirectionalLight(0xff6844, 3.6);
    sunLight.position.set(0, 24, -170);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x24080e, 1.0);
    scene.add(ambientLight);

    /* ============================================================
       RESIZE LISTENER
       ============================================================ */
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const newRatio = Math.min(
        window.devicePixelRatio || 1,
        width < 768 ? 1.25 : 1.75
      );

      renderer.setPixelRatio(newRatio);
      renderer.setSize(width, height);
      composer.setSize(width, height);

      starMat.uniforms.uPixelRatio.value = newRatio;
      streakMat.uniforms.uPixelRatio.value = newRatio;
      sporeMat.uniforms.uPixelRatio.value = newRatio;
    };

    window.addEventListener('resize', handleResize);

    /* ============================================================
       VISIBILITY OBSERVER
       ============================================================ */
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    /* ============================================================
       ANIMATION LOOP & CINEMATIC CAMERA DESCENT CHOREOGRAPHY
       ============================================================ */
    const clock = new THREE.Clock();
    let animationFrame = 0;
    let smoothScroll = scrollRef.current;
    let camSmoothX = 0;
    let camSmoothY = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      const targetScroll = Math.min(Math.max(scrollRef.current, 0), 1);

      // Smooth scroll damping
      smoothScroll = lerp(smoothScroll, targetScroll, reducedMotion ? 1 : 0.055);
      const s = smoothScroll;

      // Mouse Parallax Damping
      mouse.x = lerp(mouse.x, mouse.targetX, 0.07);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.07);
      mouse.dragX *= 0.92;
      mouse.dragY *= 0.92;

      camSmoothX = lerp(camSmoothX, mouse.x * 1.6 + mouse.dragX * 3.5, 0.06);
      camSmoothY = lerp(camSmoothY, mouse.y * 1.0 + mouse.dragY * 2.0, 0.06);

      // Planet rotation in space
      planetMesh.rotation.y = elapsed * 0.04 + s * 1.5;
      ringMesh.rotation.z = elapsed * 0.02;

      // Update shader uniforms
      planetMat.uniforms.uTime.value = elapsed;
      starMat.uniforms.uTime.value = elapsed;
      streakMat.uniforms.uTime.value = elapsed;
      terrainMat.uniforms.uTime.value = elapsed;
      sunCoreMat.uniforms.uTime.value = elapsed;
      sunHaloMat.uniforms.uTime.value = elapsed;
      sporeMat.uniforms.uTime.value = elapsed;

      /* ============================================================
         PHASE MANAGEMENT
         ------------------------------------------------------------
         s in [0.00, 0.32] -> High Orbit
         s in [0.32, 0.56] -> Atmospheric Re-entry Plunge
         s in [0.56, 1.00] -> Canyon Flight over Alien Surface
         ============================================================ */

      // 1. Space Opacity Fade Out
      const spaceAlpha = clamp(1.0 - (s - 0.28) / 0.24, 0.0, 1.0);
      planetMat.uniforms.uAlpha.value = spaceAlpha;
      atmosMat.uniforms.uAlpha.value = spaceAlpha;
      ringMat.uniforms.uAlpha.value = spaceAlpha;
      starMat.uniforms.uAlpha.value = spaceAlpha;
      spaceGroup.visible = spaceAlpha > 0.01;

      // 2. Re-entry Peak
      let reentryAlpha = 0.0;
      if (s >= 0.24 && s <= 0.60) {
        if (s < 0.42) {
          reentryAlpha = (s - 0.24) / 0.18;
        } else {
          reentryAlpha = 1.0 - (s - 0.42) / 0.18;
        }
      }
      streakMat.uniforms.uAlpha.value = reentryAlpha;
      reentryGroup.visible = reentryAlpha > 0.01;

      // 3. Landscape Opacity Fade In
      const landscapeAlpha = clamp((s - 0.42) / 0.22, 0.0, 1.0);
      skyDomeMat.uniforms.uAlpha.value = landscapeAlpha;
      terrainMat.uniforms.uAlpha.value = landscapeAlpha;
      rockMat.opacity = landscapeAlpha;
      sunCoreMat.uniforms.uAlpha.value = landscapeAlpha;
      sunHaloMat.uniforms.uAlpha.value = landscapeAlpha;
      moonMat.opacity = landscapeAlpha;
      sporeMat.uniforms.uAlpha.value = landscapeAlpha;
      landscapeGroup.visible = landscapeAlpha > 0.01;

      // Dynamic Fog Shift
      if (s < 0.35) {
        sceneFog.color.setHex(0x0a0306);
        sceneFog.density = 0.0075;
      } else if (s < 0.58) {
        sceneFog.color.setHex(0x28080e);
        sceneFog.density = 0.018;
      } else {
        sceneFog.color.setHex(0x180509);
        sceneFog.density = 0.010;
      }

      // --- 4. CAMERA TRAJECTORY ---
      if (s < 0.52) {
        // --- ORBIT & PLUNGE ---
        const t = s / 0.52;
        planetRoot.position.x = lerp(3.4, 0.4, t);
        planetRoot.position.y = lerp(-0.6, -1.8, t);

        const camX = lerp(0.0, 1.2, t) + camSmoothX;
        const camY = lerp(1.2, 0.2, t) + camSmoothY;
        const camZ = lerp(16.0, 4.0, t);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(planetRoot.position.x * 0.4, planetRoot.position.y * 0.4, 0);

        // Move Re-entry Streaks
        const streakArr = streakGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < streakCount; i++) {
          const i3 = i * 3;
          streakArr[i3 + 2] += streakSpeed[i] * 2.2;
          if (streakArr[i3 + 2] > 20) {
            streakArr[i3 + 2] = -40;
          }
        }
        streakGeo.attributes.position.needsUpdate = true;
      } else {
        // --- SURFACE CANYON FLIGHT ---
        const t = (s - 0.52) / 0.48; // 0.0 -> 1.0 along landscape phase

        // Camera flies straight through the canyon pass
        const camX = camSmoothX * 1.5;

        // Altitude starts at low aerial (y = 16.0) and descends into low canyon cruise (y = 5.2)
        const camY = lerp(16.0, 5.2, t) + camSmoothY * 0.6;

        // Advances forward along Z: from 30 down into the canyon at -55
        const camZ = lerp(32.0, -55.0, t);

        camera.position.set(camX, camY, camZ);

        // Look straight ahead towards the Red Dwarf sun on the horizon
        const lookTargetZ = camZ - 65.0;
        const lookTargetY = lerp(9.0, 6.0, t) + camSmoothY * 0.4;
        camera.lookAt(camX * 0.35, lookTargetY, lookTargetZ);

        // Camera roll banking on horizontal steer
        camera.rotation.z = -mouse.x * 0.04 - mouse.dragX * 0.06;

        // Animate drifting spores
        const spArr = sporeGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sporeCount; i++) {
          const i3 = i * 3;
          spArr[i3] += sporeVel[i3];
          spArr[i3 + 1] += sporeVel[i3 + 1];
          spArr[i3 + 2] += sporeVel[i3 + 2];

          if (spArr[i3 + 1] > 18.0) spArr[i3 + 1] = 1.0;
        }
        sporeGeo.attributes.position.needsUpdate = true;
      }

      // Billboard Sun Halo always faces camera
      sunHaloMesh.lookAt(camera.position);

      composer.render();
    };

    animate();

    /* ============================================================
       CLEANUP ON UNMOUNT
       ============================================================ */
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);

      disposables.forEach((d) => d.dispose());
      composer.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    />
  );
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default KeplerHeroScene;
