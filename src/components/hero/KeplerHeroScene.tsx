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
       SCENE & FOG
       ============================================================ */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090204);
    scene.fog = new THREE.FogExp2(0x140407, 0.0075);

    /* ============================================================
       CAMERA
       ============================================================ */
    const camera = new THREE.PerspectiveCamera(
      44,
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
      isMobile ? 1.25 : 1.85
    );

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

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
      isMobile ? 0.85 : 1.15, // strength
      0.45,                   // radius
      0.68                    // threshold (blooms red dwarf core & rim highlights)
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
       INTERACTION / PARALLAX STATE
       ============================================================ */
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      dragX: 0,
      dragY: 0,
      isDown: false,
      lastDownX: 0,
      lastDownY: 0,
    };

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      mouse.targetX = nx;
      mouse.targetY = ny;

      if (mouse.isDown) {
        const deltaX = (e.clientX - mouse.lastDownX) / window.innerWidth;
        const deltaY = (e.clientY - mouse.lastDownY) / window.innerHeight;
        mouse.dragX += deltaX * 1.5;
        mouse.dragY += deltaY * 1.5;
        mouse.lastDownX = e.clientX;
        mouse.lastDownY = e.clientY;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      mouse.isDown = true;
      mouse.lastDownX = e.clientX;
      mouse.lastDownY = e.clientY;
    };

    const onPointerUp = () => {
      mouse.isDown = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    /* ============================================================
       TEXTURE LOADER & KEPLER PLANET TEXTURE
       ============================================================ */
    const textureLoader = new THREE.TextureLoader();
    const keplerTexture = track(textureLoader.load(keplerImage));
    keplerTexture.colorSpace = THREE.SRGBColorSpace;
    keplerTexture.wrapS = THREE.RepeatWrapping;
    keplerTexture.wrapT = THREE.ClampToEdgeWrapping;
    keplerTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    /* ============================================================
       PLANETARY SYSTEM (KEPLER-186F)
       ============================================================ */
    const planetRoot = new THREE.Group();
    planetRoot.position.set(3.4, -0.6, 0);
    scene.add(planetRoot);

    const PLANET_RADIUS = 5.0;

    // Red Dwarf Sun directional vector for lighting shaders
    const sunLightPos = new THREE.Vector3(-28, 16, 12).normalize();

    // 1. Kepler-186f Surface Shader
    const planetGeo = track(new THREE.SphereGeometry(PLANET_RADIUS, isMobile ? 64 : 96, isMobile ? 64 : 96));
    const planetMat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: keplerTexture },
          uSunDir: { value: sunLightPos },
          uTime: { value: 0 },
          uScroll: { value: 0 },
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
          uniform float uScroll;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          // 2D simplex noise helper for terrain detail
          vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }

          void main() {
            // Subtle slow texture drift for planetary rotation
            vec2 uv = vUv;
            vec4 texColor = texture2D(uTexture, uv);

            // Red Dwarf Light Calculations
            vec3 N = normalize(vNormal);
            vec3 L = normalize(uSunDir);
            vec3 V = normalize(cameraPosition - vWorldPos);

            float NdotL = dot(N, L);
            float diff = clamp(NdotL * 0.5 + 0.5, 0.0, 1.0); // wrapped diffuse for soft atmospheric penumbra

            // Twilight terminator scattering (glowing crimson/vermilion at the day/night boundary)
            float terminator = smoothstep(-0.25, 0.25, NdotL) * (1.0 - smoothstep(0.05, 0.65, NdotL));
            vec3 twilightColor = vec3(1.0, 0.38, 0.18) * terminator * 1.8;

            // Specular ocean glint from the Red Dwarf star
            vec3 H = normalize(L + V);
            float NdotH = max(dot(N, H), 0.0);
            float spec = pow(NdotH, 28.0) * (1.0 - texColor.r * 0.45) * smoothstep(0.0, 0.3, NdotL);
            vec3 specColor = vec3(1.0, 0.65, 0.45) * spec * 1.5;

            // Night side geothermal veins / bioluminescent crimson vegetation
            float noiseDetail = snoise(uv * 18.0 + vec2(uTime * 0.01, 0.0));
            float nightVein = smoothstep(0.55, 0.85, noiseDetail) * (1.0 - smoothstep(-0.35, 0.1, NdotL));
            vec3 nightEmission = vec3(0.9, 0.15, 0.25) * nightVein * 0.85;

            // Day side illumination by Red Dwarf Star (warm crimson & amber hues)
            vec3 dayColor = texColor.rgb * vec3(1.15, 0.75, 0.70);
            vec3 ambientNight = texColor.rgb * vec3(0.08, 0.02, 0.04);

            vec3 finalColor = mix(ambientNight, dayColor, diff * diff) + twilightColor + specColor + nightEmission;

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
      })
    );
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetRoot.add(planetMesh);

    // 2. Swirling Crimson Atmospheric Cloud Shell
    const cloudGeo = track(new THREE.SphereGeometry(PLANET_RADIUS * 1.018, isMobile ? 48 : 64, isMobile ? 48 : 64));
    const cloudMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDir: { value: sunLightPos },
          uTime: { value: 0 },
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
          uniform vec3 uSunDir;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;

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
            for(int i = 0; i < 4; i++) {
              v += a * noise(p);
              p *= 2.04;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 p = vUv * 9.0 + vec2(uTime * 0.02, uTime * 0.008);
            float density = fbm(p);
            density = smoothstep(0.38, 0.72, density);

            float NdotL = dot(normalize(vNormal), normalize(uSunDir));
            float light = smoothstep(-0.2, 0.5, NdotL);

            vec3 cloudTint = mix(vec3(0.5, 0.12, 0.18), vec3(1.0, 0.55, 0.40), light);
            float alpha = density * (0.12 + light * 0.38);

            gl_FragColor = vec4(cloudTint * alpha, alpha);
          }
        `,
      })
    );
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    planetRoot.add(cloudMesh);

    // 3. Atmospheric Rim & Rayleigh Sunset Glow Shell
    const atmosGeo = track(new THREE.SphereGeometry(PLANET_RADIUS * 1.085, isMobile ? 48 : 64, isMobile ? 48 : 64));
    const atmosMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDir: { value: sunLightPos },
          uTime: { value: 0 },
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
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          void main() {
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 N = normalize(vNormal);
            float rim = 1.0 - max(dot(V, N), 0.0);
            rim = pow(rim, 3.2);

            // Sunlight crescent bias
            float sunAlign = max(dot(N, normalize(uSunDir)), 0.0);
            float flare = pow(sunAlign, 1.8) * 1.6 + 0.3;

            // Kepler-186f sunset colors: deep ruby crimson to glowing vermilion/orange
            vec3 coreColor = vec3(1.0, 0.28, 0.35); // #ff3344
            vec3 rimColor  = vec3(1.0, 0.52, 0.22); // #ff7a59
            vec3 outerColor = vec3(0.55, 0.08, 0.15); // #8a1825

            vec3 atmosColor = mix(outerColor, mix(coreColor, rimColor, sunAlign), rim);
            float alpha = rim * flare * 0.92;

            gl_FragColor = vec4(atmosColor * alpha, alpha);
          }
        `,
      })
    );
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    planetRoot.add(atmosMesh);

    // 4. Kepler-186f Orbital Crystalline Debris Ring
    const ringGeo = track(new THREE.RingGeometry(PLANET_RADIUS * 1.32, PLANET_RADIUS * 1.95, isMobile ? 64 : 128, 4));
    const ringMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSunDir: { value: sunLightPos },
          uTime: { value: 0 },
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
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vWorldPos;

          void main() {
            vec2 p = vUv - 0.5;
            float dist = length(p) * 2.0;

            // Concentric bands in the ring
            float band = sin(dist * 62.0) * 0.5 + 0.5;
            float gaps = sin(dist * 18.0) * 0.5 + 0.5;
            float density = band * gaps;

            // Fade inner & outer edges
            float edgeFade = smoothstep(0.02, 0.15, dist) * (1.0 - smoothstep(0.85, 1.0, dist));
            density *= edgeFade;

            // Planetary shadow on the ring
            vec3 toRing = normalize(vWorldPos);
            float shadow = smoothstep(-0.25, 0.1, dot(toRing, -uSunDir));
            density *= mix(1.0, 0.08, shadow);

            vec3 ringColor = mix(vec3(0.75, 0.20, 0.28), vec3(1.0, 0.68, 0.45), band);
            float alpha = density * 0.55;

            gl_FragColor = vec4(ringColor * alpha, alpha);
          }
        `,
      })
    );
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI * 0.42;
    ringMesh.rotation.y = -Math.PI * 0.14;
    planetRoot.add(ringMesh);

    // 5. Instanced Micro-Asteroids Orbiting in the Ring
    const asteroidCount = isMobile ? 80 : 180;
    const asteroidGeo = track(new THREE.IcosahedronGeometry(0.065, 0));
    const asteroidMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xff6644,
        roughness: 0.85,
        metalness: 0.2,
      })
    );
    const asteroids = new THREE.InstancedMesh(asteroidGeo, asteroidMat, asteroidCount);
    const dummy = new THREE.Object3D();
    const asteroidData: Array<{ radius: number; angle: number; speed: number; yOffset: number; scale: number }> = [];

    for (let i = 0; i < asteroidCount; i++) {
      const r = PLANET_RADIUS * (1.35 + Math.random() * 0.55);
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.12 + Math.random() * 0.18) * (Math.random() > 0.5 ? 1 : 1);
      const yOffset = (Math.random() - 0.5) * 0.45;
      const scale = 0.5 + Math.random() * 1.5;

      asteroidData.push({ radius: r, angle, speed, yOffset, scale });

      dummy.position.set(Math.cos(angle) * r, yOffset, Math.sin(angle) * r);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      asteroids.setMatrixAt(i, dummy.matrix);
    }
    asteroids.instanceMatrix.needsUpdate = true;
    ringMesh.add(asteroids);

    /* ============================================================
       THE KEPLER-186 HOST STAR (COOL RED DWARF)
       ============================================================ */
    const redDwarfGroup = new THREE.Group();
    redDwarfGroup.position.set(-36, 18, -80);
    scene.add(redDwarfGroup);

    // Star Core
    const sunCoreGeo = track(new THREE.SphereGeometry(6.2, 48, 48));
    const sunCoreMat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
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
          varying vec3 vNormal;

          void main() {
            float pulse = sin(uTime * 1.5) * 0.08 + 0.92;
            vec3 core = vec3(1.0, 0.42, 0.22) * pulse * 2.2;
            gl_FragColor = vec4(core, 1.0);
          }
        `,
      })
    );
    const sunCoreMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    redDwarfGroup.add(sunCoreMesh);

    // Star Corona Glow Halo (Billboard plane)
    const haloGeo = track(new THREE.PlaneGeometry(38, 38));
    const haloMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
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
          varying vec2 vUv;

          void main() {
            vec2 p = vUv - 0.5;
            float dist = length(p) * 2.0;
            float glow = exp(-dist * 2.6);
            float flare = sin(atan(p.y, p.x) * 8.0 + uTime * 0.4) * 0.1 + 0.9;
            glow *= flare;

            vec3 coronaColor = mix(vec3(1.0, 0.22, 0.15), vec3(1.0, 0.72, 0.38), glow);
            float alpha = glow * 0.95;

            gl_FragColor = vec4(coronaColor * alpha, alpha);
          }
        `,
      })
    );
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    redDwarfGroup.add(haloMesh);

    /* ============================================================
       LIGHTS
       ============================================================ */
    // Main directional sunlight from Red Dwarf
    const sunLight = new THREE.DirectionalLight(0xff6e4a, 3.4);
    sunLight.position.copy(redDwarfGroup.position);
    scene.add(sunLight);

    // Deep ambient crimson bounce
    const ambientLight = new THREE.AmbientLight(0x28080f, 0.95);
    scene.add(ambientLight);

    /* ============================================================
       HYDROGEN-ALPHA NEBULA (CRIMSON COSMIC DUST)
       ============================================================ */
    const nebulaGeo = track(new THREE.PlaneGeometry(160, 100));
    const nebulaMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
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
          varying vec2 vUv;

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
            for(int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.02;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 p = vUv * 3.5 + vec2(uTime * 0.008, 0.0);
            float n = fbm(p);
            float edgeFade = smoothstep(0.0, 0.35, vUv.x) * (1.0 - smoothstep(0.65, 1.0, vUv.x)) *
                             smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.65, 1.0, vUv.y));

            float alpha = smoothstep(0.25, 0.8, n) * edgeFade * 0.28;
            vec3 col = mix(vec3(0.54, 0.09, 0.15), vec3(1.0, 0.38, 0.25), n);

            gl_FragColor = vec4(col * alpha, alpha);
          }
        `,
      })
    );

    const nebulaMesh = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebulaMesh.position.set(-15, 8, -60);
    nebulaMesh.rotation.z = -0.15;
    scene.add(nebulaMesh);

    /* ============================================================
       STARFIELD
       ============================================================ */
    const starCount = isMobile ? 650 : 1500;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const starHues = [
      new THREE.Color(0xff4a5a), // rich crimson
      new THREE.Color(0xff8d55), // warm amber/orange
      new THREE.Color(0xffd5ad), // peach-white dwarf
      new THREE.Color(0xffffff), // pure white
      new THREE.Color(0xff3344), // red dwarf light
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 250 + Math.random() * 650;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i3 + 1] = radius * Math.cos(phi);
      starPos[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = starHues[Math.floor(Math.random() * starHues.length)];
      starCol[i3] = color.r;
      starCol[i3 + 1] = color.g;
      starCol[i3 + 2] = color.b;

      starSizes[i] = 1.0 + Math.random() * 2.4;
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
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * vTwinkle * uPixelRatio * (180.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vTwinkle;

          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            if (dist > 0.5) discard;
            float a = smoothstep(0.5, 0.05, dist);
            gl_FragColor = vec4(vColor * vTwinkle, a * 0.85);
          }
        `,
      })
    );

    const starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    /* ============================================================
       FOREGROUND SPACE EMBERS & CRIMSON DUST
       ============================================================ */
    const emberCount = isMobile ? 120 : 320;
    const emberPos = new Float32Array(emberCount * 3);
    const emberVel = new Float32Array(emberCount * 3);
    const emberScales = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      emberPos[i3] = (Math.random() - 0.5) * 28;
      emberPos[i3 + 1] = (Math.random() - 0.5) * 18;
      emberPos[i3 + 2] = -4 + Math.random() * 20;

      emberVel[i3] = (Math.random() - 0.5) * 0.015;
      emberVel[i3 + 1] = 0.008 + Math.random() * 0.02;
      emberVel[i3 + 2] = (Math.random() - 0.5) * 0.015;

      emberScales[i] = 1.5 + Math.random() * 3.5;
    }

    const emberGeo = track(new THREE.BufferGeometry());
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute('size', new THREE.BufferAttribute(emberScales, 1));

    const emberMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          attribute float size;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vAlpha;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vAlpha = smoothstep(2.0, 14.0, -mvPosition.z) * (1.0 - smoothstep(22.0, 36.0, -mvPosition.z));
            gl_PointSize = size * uPixelRatio * (120.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;

          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            if (dist > 0.5) discard;
            float a = smoothstep(0.5, 0.02, dist);
            vec3 emberColor = mix(vec3(1.0, 0.32, 0.15), vec3(1.0, 0.85, 0.5), 1.0 - dist * 2.0);
            gl_FragColor = vec4(emberColor * a * 1.5, a * vAlpha * 0.75);
          }
        `,
      })
    );

    const emberMesh = new THREE.Points(emberGeo, emberMat);
    scene.add(emberMesh);

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
        width < 768 ? 1.25 : 1.85
      );

      renderer.setPixelRatio(newRatio);
      renderer.setSize(width, height);
      composer.setSize(width, height);

      starMat.uniforms.uPixelRatio.value = newRatio;
      emberMat.uniforms.uPixelRatio.value = newRatio;
    };

    window.addEventListener('resize', handleResize);

    /* ============================================================
       VISIBILITY OBSERVER (PAUSE ON OFFSCREEN)
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
       ANIMATION LOOP & CINEMATIC SCROLL TRAJECTORY
       ============================================================ */
    const clock = new THREE.Clock();
    let animationFrame = 0;
    let smoothScroll = scrollRef.current;
    let cameraSmoothX = 0;
    let cameraSmoothY = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      const scroll = Math.min(Math.max(scrollRef.current, 0), 1);

      // Smooth scroll interpolation
      smoothScroll = lerp(smoothScroll, scroll, reducedMotion ? 1 : 0.055);

      // Mouse Parallax Damping
      mouse.x = lerp(mouse.x, mouse.targetX, 0.07);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.07);
      mouse.dragX *= 0.92;
      mouse.dragY *= 0.92;

      const targetCamX = mouse.x * 1.5 + mouse.dragX * 3.5;
      const targetCamY = mouse.y * 0.9 + mouse.dragY * 2.5;

      cameraSmoothX = lerp(cameraSmoothX, targetCamX, 0.06);
      cameraSmoothY = lerp(cameraSmoothY, targetCamY, 0.06);

      // Update shader uniforms
      planetMat.uniforms.uTime.value = elapsed;
      planetMat.uniforms.uScroll.value = smoothScroll;
      cloudMat.uniforms.uTime.value = elapsed;
      atmosMat.uniforms.uTime.value = elapsed;
      ringMat.uniforms.uTime.value = elapsed;
      sunCoreMat.uniforms.uTime.value = elapsed;
      haloMat.uniforms.uTime.value = elapsed;
      nebulaMat.uniforms.uTime.value = elapsed;
      starMat.uniforms.uTime.value = elapsed;
      emberMat.uniforms.uTime.value = elapsed;

      // Planet System Natural Rotation
      planetMesh.rotation.y = elapsed * 0.045 + smoothScroll * 1.25;
      planetMesh.rotation.x = 0.18 + Math.sin(elapsed * 0.08) * 0.04;

      cloudMesh.rotation.y = elapsed * 0.065 + smoothScroll * 1.6;
      cloudMesh.rotation.z = Math.sin(elapsed * 0.05) * 0.03;

      // Rotate Asteroids in ring
      ringMesh.rotation.z = elapsed * 0.025;
      for (let i = 0; i < asteroidCount; i++) {
        const ast = asteroidData[i];
        ast.angle += ast.speed * 0.008;
        const x = Math.cos(ast.angle) * ast.radius;
        const z = Math.sin(ast.angle) * ast.radius;

        dummy.position.set(x, ast.yOffset + Math.sin(elapsed + i) * 0.08, z);
        dummy.rotation.x = elapsed * 0.4 + i;
        dummy.rotation.y = elapsed * 0.6 + i;
        dummy.scale.set(ast.scale, ast.scale, ast.scale);
        dummy.updateMatrix();
        asteroids.setMatrixAt(i, dummy.matrix);
      }
      asteroids.instanceMatrix.needsUpdate = true;

      // Drift Foreground Embers
      const posArray = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        posArray[i3] += emberVel[i3];
        posArray[i3 + 1] += emberVel[i3 + 1];
        posArray[i3 + 2] += emberVel[i3 + 2] - smoothScroll * 0.15;

        // Wrap around bounds
        if (posArray[i3 + 1] > 14) posArray[i3 + 1] = -14;
        if (posArray[i3 + 2] > 22) posArray[i3 + 2] = -4;
        if (posArray[i3 + 2] < -4) posArray[i3 + 2] = 22;
      }
      emberGeo.attributes.position.needsUpdate = true;

      // Face Billboard Halo toward Camera
      haloMesh.lookAt(camera.position);

      /* ============================================================
         CINEMATIC SCROLL TRAJECTORY
         ------------------------------------------------------------
         Scroll 0.0: Wide majestic view of Kepler-186f on right flank.
         Scroll 0.0 -> 0.55: Swoop inward across the ring plane towards
                             the twilight terminator.
         Scroll 0.55 -> 1.0: Skim close to the upper atmospheric limb,
                             horizon curving gracefully across screen.
         ============================================================ */
      const s = smoothScroll;

      // Planet Position Shift on scroll
      planetRoot.position.x = lerp(3.4, 1.2, s);
      planetRoot.position.y = lerp(-0.6, -1.8, s);
      planetRoot.position.z = lerp(0.0, -1.5, s);

      // Camera Position & Pitch
      const baseCamX = lerp(0.0, 1.6, s) + cameraSmoothX;
      const baseCamY = lerp(1.2, 0.2, s) + cameraSmoothY;
      const baseCamZ = lerp(16.0, 7.8, s);

      camera.position.set(baseCamX, baseCamY, baseCamZ);

      // Look slightly ahead on the planetary curve
      const lookTargetX = lerp(0.8, 1.4, s) + cameraSmoothX * 0.4;
      const lookTargetY = lerp(-0.2, -1.2, s) + cameraSmoothY * 0.4;
      const lookTargetZ = lerp(0.0, -1.5, s);

      camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

      // Camera subtle bank roll
      camera.rotation.z = -mouse.x * 0.02 - mouse.dragX * 0.04 + s * 0.08;

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

export default KeplerHeroScene;
