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
    scene.background = new THREE.Color(0x0a0305);
    const sceneFog = new THREE.FogExp2(0x1a060a, 0.008);
    scene.fog = sceneFog;

    /* ============================================================
       CAMERA
       ============================================================ */
    const camera = new THREE.PerspectiveCamera(
      46,
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
    renderer.toneMappingExposure = 1.08;

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
      isMobile ? 0.8 : 1.15, // strength
      0.45,                  // radius
      0.68                   // threshold
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
       MOUSE & PARALLAX STATE
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
        mouse.dragX += dx * 1.6;
        mouse.dragY += dy * 1.6;
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
       - spaceGroup: High orbit view of Kepler-186f & space
       - reentryGroup: Burning atmospheric entry plasma & cloud sheets
       - landscapeGroup: Surface view of Kepler-186f crimson terrain
       ============================================================ */
    const spaceGroup = new THREE.Group();
    const reentryGroup = new THREE.Group();
    const landscapeGroup = new THREE.Group();

    scene.add(spaceGroup);
    scene.add(reentryGroup);
    scene.add(landscapeGroup);

    landscapeGroup.position.set(0, -60, -80); // Placed at surface origin
    reentryGroup.position.set(0, 0, 0);

    /* ============================================================
       SHARED GLSL CHUNKS (NOISE)
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
    `;

    /* ============================================================
       1. SPACE GROUP: ORBITAL KEPLER-186F
       ============================================================ */
    const PLANET_RADIUS = 5.0;
    const planetRoot = new THREE.Group();
    planetRoot.position.set(3.4, -0.6, 0);
    spaceGroup.add(planetRoot);

    const sunLightDir = new THREE.Vector3(-28, 16, 12).normalize();

    // Planet Core Mesh
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

            // Specular ocean glint
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

    // Planet Atmosphere Shell
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

    // Orbital Crystalline Ring
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
          uniform vec3 uSunDir;
          uniform float uAlpha;
          varying vec2 vUv;
          varying vec3 vWorldPos;
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

    // Deep Space Starfield
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
       2. RE-ENTRY GROUP: ATMOSPHERIC ENTRY SHOCKWAVES & CLOUDS
       ============================================================ */
    // Plasma Streaks rushing toward camera
    const streakCount = isMobile ? 80 : 200;
    const streakPos = new Float32Array(streakCount * 3);
    const streakSpeed = new Float32Array(streakCount);

    for (let i = 0; i < streakCount; i++) {
      const i3 = i * 3;
      streakPos[i3] = (Math.random() - 0.5) * 22;
      streakPos[i3 + 1] = (Math.random() - 0.5) * 16;
      streakPos[i3 + 2] = -30 + Math.random() * 40;
      streakSpeed[i] = 0.8 + Math.random() * 1.4;
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
            gl_PointSize = clamp((35.0 / -mv.z) * uPixelRatio, 1.5, 12.0);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uAlpha;
          varying float vDist;
          void main() {
            vec2 p = gl_PointCoord - 0.5;
            float d = length(p);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.02, d) * uAlpha;
            // Fiery friction plasma: brilliant gold-vermilion core
            vec3 col = mix(vec3(1.0, 0.35, 0.15), vec3(1.0, 0.9, 0.55), 1.0 - d * 2.0);
            gl_FragColor = vec4(col * a * 2.0, a);
          }
        `,
      })
    );
    const streakMesh = new THREE.Points(streakGeo, streakMat);
    reentryGroup.add(streakMesh);

    // Thick Atmospheric Entry Clouds (Passing Planes)
    const cloudSheetGeo = track(new THREE.PlaneGeometry(60, 40));
    const cloudSheetMat = track(
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
          uniform float uTime;
          uniform float uAlpha;
          varying vec2 vUv;
          ${glslNoise}

          void main() {
            vec2 uv = vUv * 3.5 + vec2(uTime * 0.12, uTime * 0.04);
            float n = snoise(vec3(uv, uTime * 0.08)) * 0.5 + 0.5;
            float edge = smoothstep(0.0, 0.3, vUv.x) * (1.0 - smoothstep(0.7, 1.0, vUv.x)) *
                         smoothstep(0.0, 0.3, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));

            float a = smoothstep(0.3, 0.8, n) * edge * uAlpha * 0.85;
            vec3 col = mix(vec3(0.7, 0.12, 0.2), vec3(1.0, 0.5, 0.25), n);
            gl_FragColor = vec4(col * a, a);
          }
        `,
      })
    );
    const cloudSheetMesh = new THREE.Mesh(cloudSheetGeo, cloudSheetMat);
    cloudSheetMesh.position.set(0, 0, 5);
    reentryGroup.add(cloudSheetMesh);

    /* ============================================================
       3. LANDSCAPE GROUP: ALIEN RED TERRAIN OF KEPLER-186F
       ============================================================ */
    // Procedural Mountain & Valley Surface Plane
    const terrainRes = isMobile ? 100 : 160;
    const terrainGeo = track(new THREE.PlaneGeometry(320, 320, terrainRes, terrainRes));
    terrainGeo.rotateX(-Math.PI * 0.5);

    const terrainMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.0 },
          uSunPos: { value: new THREE.Vector3(0, 35, -140) },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vWorldPos;
          varying vec2 vUv;
          varying float vElevation;

          ${glslNoise}

          float getTerrainHeight(vec2 pos) {
            float h = 0.0;
            // Primary mountain ranges
            h += snoise(vec3(pos * 0.012, 0.5)) * 18.0;
            // Secondary volcanic ridges & canyon fractures
            h += snoise(vec3(pos * 0.035, 1.2)) * 6.5;
            // Rolling hills
            h += snoise(vec3(pos * 0.09, 2.5)) * 2.2;
            // Flatten lake basins in lower valleys
            if (h < 1.0) {
              h = smoothstep(-4.0, 1.0, h) * 1.0;
            }
            return h;
          }

          void main() {
            vUv = uv;
            vec3 pos = position;
            float h = getTerrainHeight(pos.xz);
            pos.y += h;
            vElevation = h;

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

          void main() {
            // Reconstruct surface normals via screen derivatives
            vec3 dX = dFdx(vWorldPos);
            vec3 dY = dFdy(vWorldPos);
            vec3 N = normalize(cross(dY, dX));

            vec3 L = normalize(uSunPos - vWorldPos);
            vec3 V = normalize(cameraPosition - vWorldPos);

            float NdotL = max(dot(N, L), 0.0);
            float diff = NdotL * 0.75 + 0.25;

            // Specular ocean/liquid sheen in low basins
            vec3 H = normalize(L + V);
            float spec = pow(max(dot(N, H), 0.0), 38.0) * step(vElevation, 1.2);
            vec3 specColor = vec3(1.0, 0.65, 0.45) * spec * 2.0;

            // Biome Colors:
            // Basalt lakes (black obsidian): #0e0508
            // Alien Red Grass & photosynthetic forests: #cf2e3f / #8a1825
            // High volcanic peak rock: #2a0b12 with geothermal veins
            vec3 lakeColor = vec3(0.06, 0.02, 0.035);
            vec3 redGrassColor = vec3(0.82, 0.18, 0.24); // #cf2e3f
            vec3 deepForest = vec3(0.54, 0.09, 0.15);    // #8a1825
            vec3 peakRock = vec3(0.18, 0.06, 0.08);

            vec3 surfaceColor = mix(lakeColor, redGrassColor, smoothstep(0.8, 2.5, vElevation));
            surfaceColor = mix(surfaceColor, deepForest, smoothstep(2.5, 9.0, vElevation));
            surfaceColor = mix(surfaceColor, peakRock, smoothstep(9.0, 18.0, vElevation));

            // Geothermal fissure veins on mountain peaks
            float fissure = smoothstep(12.0, 20.0, vElevation) * max(0.0, N.y * 0.5);
            vec3 fissureGlow = vec3(1.0, 0.42, 0.25) * fissure * 0.8;

            vec3 litColor = surfaceColor * (diff * vec3(1.15, 0.68, 0.60)) + specColor + fissureGlow;

            // Atmospheric distance fog (Crimson twilight haze)
            float dist = length(cameraPosition - vWorldPos);
            float fogFactor = clamp((dist - 20.0) / 220.0, 0.0, 1.0);
            vec3 fogColor = vec3(0.14, 0.03, 0.05);

            vec3 finalColor = mix(litColor, fogColor, fogFactor);
            gl_FragColor = vec4(finalColor, uAlpha);
          }
        `,
      })
    );
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    landscapeGroup.add(terrainMesh);

    // Alien Crystalline Monolith Spires scattered across ridges
    const spireCount = isMobile ? 30 : 65;
    const spireGeo = track(new THREE.ConeGeometry(0.8, 12, 5));
    const spireMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3d0b16,
        emissive: 0xff3344,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
      })
    );
    const spires = new THREE.InstancedMesh(spireGeo, spireMat, spireCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < spireCount; i++) {
      const x = (Math.random() - 0.5) * 160;
      const z = -20 - Math.random() * 120;
      const scale = 0.6 + Math.random() * 1.4;

      dummy.position.set(x, 4.0 + Math.random() * 4.0, z);
      dummy.scale.set(scale, scale * (1.5 + Math.random()), scale);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.rotation.z = (Math.random() - 0.5) * 0.2;
      dummy.updateMatrix();
      spires.setMatrixAt(i, dummy.matrix);
    }
    spires.instanceMatrix.needsUpdate = true;
    landscapeGroup.add(spires);

    // Massive Low-Hanging Red Dwarf Star on the Alien Horizon
    const horizonStarGroup = new THREE.Group();
    horizonStarGroup.position.set(0, 32, -180);
    landscapeGroup.add(horizonStarGroup);

    const horizonSunGeo = track(new THREE.SphereGeometry(18, 48, 48));
    const horizonSunMat = track(
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
            float pulse = sin(uTime * 1.6) * 0.06 + 0.94;
            vec3 core = vec3(1.0, 0.38, 0.20) * pulse * 2.2;
            gl_FragColor = vec4(core, uAlpha);
          }
        `,
      })
    );
    const horizonSunMesh = new THREE.Mesh(horizonSunGeo, horizonSunMat);
    horizonStarGroup.add(horizonSunMesh);

    // Glowing Sun Flare Disc
    const sunHaloGeo = track(new THREE.PlaneGeometry(90, 90));
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
          varying vec2 vUv;
          void main() {
            vec2 p = vUv - 0.5;
            float d = length(p) * 2.0;
            float glow = exp(-d * 2.4);
            vec3 col = mix(vec3(1.0, 0.24, 0.15), vec3(1.0, 0.72, 0.42), glow);
            float a = glow * uAlpha * 0.95;
            gl_FragColor = vec4(col * a, a);
          }
        `,
      })
    );
    const sunHaloMesh = new THREE.Mesh(sunHaloGeo, sunHaloMat);
    horizonStarGroup.add(sunHaloMesh);

    // Two Alien Moons in the Twilight Sky
    const moonGeo = track(new THREE.SphereGeometry(3.5, 32, 32));
    const moonMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x4a1820,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
      })
    );
    const moon1 = new THREE.Mesh(moonGeo, moonMat);
    moon1.position.set(-42, 48, -140);
    moon1.scale.set(1.4, 1.4, 1.4);
    landscapeGroup.add(moon1);

    const moon2 = new THREE.Mesh(moonGeo, moonMat);
    moon2.position.set(52, 60, -160);
    moon2.scale.set(0.8, 0.8, 0.8);
    landscapeGroup.add(moon2);

    // Floating Ground Spores / Bioluminescent Embers
    const sporeCount = isMobile ? 140 : 350;
    const sporePos = new Float32Array(sporeCount * 3);
    const sporeVel = new Float32Array(sporeCount * 3);

    for (let i = 0; i < sporeCount; i++) {
      const i3 = i * 3;
      sporePos[i3] = (Math.random() - 0.5) * 90;
      sporePos[i3 + 1] = 1.0 + Math.random() * 14.0;
      sporePos[i3 + 2] = -Math.random() * 90;

      sporeVel[i3] = (Math.random() - 0.5) * 0.02;
      sporeVel[i3 + 1] = 0.006 + Math.random() * 0.015;
      sporeVel[i3 + 2] = (Math.random() - 0.5) * 0.02;
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
            gl_PointSize = clamp((120.0 / -mv.z) * uPixelRatio, 2.0, 14.0);
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
    // Red Dwarf Sun directional light
    const surfaceSunLight = new THREE.DirectionalLight(0xff6e4a, 3.2);
    surfaceSunLight.position.set(0, 45, -160);
    landscapeGroup.add(surfaceSunLight);

    const surfaceAmbient = new THREE.AmbientLight(0x28080f, 1.1);
    landscapeGroup.add(surfaceAmbient);

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
       ANIMATION LOOP & PLANET-TO-LANDSCAPE DESCENT TRAJECTORY
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

      // Smooth scroll lerp
      smoothScroll = lerp(smoothScroll, targetScroll, reducedMotion ? 1 : 0.055);
      const s = smoothScroll;

      // Mouse Parallax Damping
      mouse.x = lerp(mouse.x, mouse.targetX, 0.07);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.07);
      mouse.dragX *= 0.92;
      mouse.dragY *= 0.92;

      camSmoothX = lerp(camSmoothX, mouse.x * 1.4 + mouse.dragX * 3.0, 0.06);
      camSmoothY = lerp(camSmoothY, mouse.y * 0.9 + mouse.dragY * 2.0, 0.06);

      // Natural planet & star rotations
      planetMesh.rotation.y = elapsed * 0.04 + s * 1.5;
      ringMesh.rotation.z = elapsed * 0.02;

      // Update Time Uniforms
      planetMat.uniforms.uTime.value = elapsed;
      starMat.uniforms.uTime.value = elapsed;
      streakMat.uniforms.uTime.value = elapsed;
      cloudSheetMat.uniforms.uTime.value = elapsed;
      terrainMat.uniforms.uTime.value = elapsed;
      horizonSunMat.uniforms.uTime.value = elapsed;
      sunHaloMat.uniforms.uTime.value = elapsed;
      sporeMat.uniforms.uTime.value = elapsed;

      /* ============================================================
         DESCENT CHOREOGRAPHY (ORBIT -> RE-ENTRY -> LANDSCAPE)
         ------------------------------------------------------------
         Stage 1: s = [0.00, 0.28]  High Orbit View of Kepler-186f
         Stage 2: s = [0.28, 0.58]  Atmospheric Entry Shockwave & Clouds
         Stage 3: s = [0.58, 1.00]  Ground-Level Alien Landscape
         ============================================================ */

      // 1. Group Opacity Crossfades
      const spaceAlpha = clamp(1.0 - (s - 0.25) / 0.25, 0.0, 1.0);
      planetMat.uniforms.uAlpha.value = spaceAlpha;
      atmosMat.uniforms.uAlpha.value = spaceAlpha;
      ringMat.uniforms.uAlpha.value = spaceAlpha;
      starMat.uniforms.uAlpha.value = spaceAlpha;
      spaceGroup.visible = spaceAlpha > 0.01;

      // Re-entry Peak around s = 0.42
      let reentryAlpha = 0.0;
      if (s >= 0.22 && s <= 0.62) {
        if (s < 0.42) {
          reentryAlpha = (s - 0.22) / 0.20;
        } else {
          reentryAlpha = 1.0 - (s - 0.42) / 0.20;
        }
      }
      streakMat.uniforms.uAlpha.value = reentryAlpha;
      cloudSheetMat.uniforms.uAlpha.value = reentryAlpha;
      reentryGroup.visible = reentryAlpha > 0.01;

      // Landscape Reveal from s = 0.40 to 1.00
      const landscapeAlpha = clamp((s - 0.38) / 0.24, 0.0, 1.0);
      terrainMat.uniforms.uAlpha.value = landscapeAlpha;
      spireMat.opacity = landscapeAlpha;
      horizonSunMat.uniforms.uAlpha.value = landscapeAlpha;
      sunHaloMat.uniforms.uAlpha.value = landscapeAlpha;
      moonMat.opacity = landscapeAlpha;
      sporeMat.uniforms.uAlpha.value = landscapeAlpha;
      landscapeGroup.visible = landscapeAlpha > 0.01;

      // Dynamic Fog Shift: Space deep black -> Re-entry fiery haze -> Alien red horizon
      if (s < 0.35) {
        sceneFog.color.setHex(0x0a0305);
        sceneFog.density = 0.0075;
      } else if (s < 0.60) {
        sceneFog.color.setHex(0x2d080e);
        sceneFog.density = 0.018;
      } else {
        sceneFog.color.setHex(0x1a0508);
        sceneFog.density = 0.012;
      }

      // 2. Camera Flight Coordinates
      if (s < 0.48) {
        // --- ORBITAL & RE-ENTRY FLIGHT ---
        const t = s / 0.48;
        // Dive toward planetary terminator
        planetRoot.position.x = lerp(3.4, 0.5, t);
        planetRoot.position.y = lerp(-0.6, -1.8, t);

        const camX = lerp(0.0, 1.2, t) + camSmoothX;
        const camY = lerp(1.2, 0.2, t) + camSmoothY;
        const camZ = lerp(16.0, 4.2, t);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(planetRoot.position.x * 0.4, planetRoot.position.y * 0.4, 0);

        // Animate Re-entry Streaks
        const streakArr = streakGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < streakCount; i++) {
          const i3 = i * 3;
          streakArr[i3 + 2] += streakSpeed[i] * 1.8;
          if (streakArr[i3 + 2] > 20) {
            streakArr[i3 + 2] = -40;
          }
        }
        streakGeo.attributes.position.needsUpdate = true;
      } else {
        // --- SURFACE ALIEN LANDSCAPE CRUISE ---
        const t = (s - 0.48) / 0.52; // 0.0 -> 1.0 across landscape phase

        // Camera flies forward across the crimson mountain valley
        const startX = 0.0;
        const targetX = 0.0 + camSmoothX * 1.8;
        const camX = lerp(startX, targetX, t);

        // Altitude drops from low aerial (y = 18) down to cruising altitude (y = 4.2)
        const camY = lerp(16.0, 3.8, t) + camSmoothY * 0.8;

        // Moves forward along z-axis into the landscape
        const camZ = lerp(35.0, -42.0, t);

        camera.position.set(camX, camY, camZ);

        // Look toward the setting Red Dwarf star on horizon
        const lookZ = camZ - 50.0;
        const lookY = lerp(8.0, 5.0, t) + camSmoothY * 0.5;
        camera.lookAt(camX * 0.3, lookY, lookZ);

        // Animate ground spores drifting
        const spArr = sporeGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sporeCount; i++) {
          const i3 = i * 3;
          spArr[i3] += sporeVel[i3];
          spArr[i3 + 1] += sporeVel[i3 + 1];
          spArr[i3 + 2] += sporeVel[i3 + 2];

          if (spArr[i3 + 1] > 22.0) spArr[i3 + 1] = 1.0;
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
