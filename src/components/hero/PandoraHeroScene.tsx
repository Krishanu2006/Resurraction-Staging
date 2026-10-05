import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

interface PandoraHeroSceneProps {
  scrollProgress?: number;
}

/* ============================================================
   CPU NOISE
   ============================================================ */

const hash3 = (x: number, y: number, z: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return n - Math.floor(n);
};

const valueNoise3 = (x: number, y: number, z: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix + 1, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const x00 = n000 * (1 - ux) + n100 * ux;
  const x10 = n010 * (1 - ux) + n110 * ux;
  const x01 = n001 * (1 - ux) + n101 * ux;
  const x11 = n011 * (1 - ux) + n111 * ux;

  const y0 = x00 * (1 - uy) + x10 * uy;
  const y1 = x01 * (1 - uy) + x11 * uy;

  return y0 * (1 - uz) + y1 * uz;
};

/* ============================================================
   COMPONENT
   ============================================================ */

const PandoraHeroScene: React.FC<PandoraHeroSceneProps> = ({
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
    scene.background = new THREE.Color(0x06070a);

    /* ============================================================
       CAMERA
       ============================================================ */

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );

    camera.position.set(0, 0.3, 22);
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
      mobile ? 1.15 : 1.5
    );

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;

    container.appendChild(renderer.domElement);

    /* ============================================================
       POST PROCESSING
       ============================================================ */

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.24,
      0.72,
      0.72
    );

    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ============================================================
       ROOT
       ============================================================ */

    const world = new THREE.Group();
    scene.add(world);

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
      pressStart: 0,
      worldX: 0,
      worldY: 0,
    };

    const interaction = {
      energy: 0,
      targetEnergy: 0,
      giantProximity: 0,
      targetGiantProximity: 0,
      earthProximity: 0,
      targetEarthProximity: 0,
      pulse: 0,
      targetPulse: 0,
      idleCharge: 0,
      idleTime: 0,
      cursorForce: 0,
      targetCursorForce: 0,
      shockwave: 0,
      shockOrigin: new THREE.Vector2(0, 0),
    };

    const updateWorldPointer = () => {
      const ndcX = pointer.screenX * 2 - 1;
      const ndcY = -(pointer.screenY * 2 - 1);

      const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
      vector.unproject(camera);

      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));

      pointer.worldX = pos.x;
      pointer.worldY = pos.y;
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);

      pointer.targetX = x;
      pointer.targetY = y;
      pointer.screenX = event.clientX / window.innerWidth;
      pointer.screenY = event.clientY / window.innerHeight;

      const dxG = pointer.screenX - 0.63;
      const dyG = pointer.screenY - 0.42;
      const dG = Math.sqrt(dxG * dxG + dyG * dyG);
      interaction.targetGiantProximity = THREE.MathUtils.clamp(
        1 - dG * 2.0,
        0,
        1
      );

      const dxE = pointer.screenX - 0.44;
      const dyE = pointer.screenY - 0.52;
      const dE = Math.sqrt(dxE * dxE + dyE * dyE);
      interaction.targetEarthProximity = THREE.MathUtils.clamp(
        1 - dE * 3.2,
        0,
        1
      );

      interaction.targetCursorForce = THREE.MathUtils.clamp(
        interaction.targetGiantProximity * 0.6 +
          interaction.targetEarthProximity * 0.8 +
          0.25,
        0,
        1
      );

      interaction.targetEnergy = THREE.MathUtils.clamp(
        Math.abs(x) * 0.12 +
          Math.abs(y) * 0.1 +
          interaction.targetGiantProximity * 0.5 +
          interaction.targetEarthProximity * 0.55,
        0,
        1
      );

      interaction.idleTime = 0;

      updateWorldPointer();
    };

    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      interaction.targetEnergy = 0;
      interaction.targetGiantProximity = 0;
      interaction.targetEarthProximity = 0;
      interaction.targetCursorForce = 0;
    };

    const onPointerDown = () => {
      pointer.isDown = true;
      pointer.pressStart = performance.now();

      interaction.shockwave = 1.0;
      interaction.shockOrigin.set(
        pointer.worldX,
        pointer.worldY
      );
    };

    const onPointerUp = () => {
      pointer.isDown = false;
      interaction.targetPulse = 1.0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
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
       LIGHTING
       ============================================================ */

    const keyLight = new THREE.DirectionalLight(0xbfd8ff, 1.7);
    keyLight.position.set(14, 3, -4);
    world.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8fa8d8, 0.75);
    rimLight.position.set(-8, 6, -18);
    world.add(rimLight);

    const ambient = new THREE.AmbientLight(0x1a2438, 0.5);
    world.add(ambient);

    const giantLight = new THREE.PointLight(0x4b78b8, 1.35, 55, 2.0);
    giantLight.position.set(8.5, -0.6, -8);
    world.add(giantLight);

    /* ============================================================
       BLUE JUPITER-STYLE GAS GIANT
       ============================================================ */

    const GIANT_RADIUS = 6.5;
    const giantGroup = new THREE.Group();
    giantGroup.position.set(8.5, -0.6, -8);
    world.add(giantGroup);

    const giantMat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uProximity: { value: 0 },
          uPulse: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vObjPos;
          varying vec3 vWorldPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vObjPos = normalize(position);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vObjPos;
          varying vec3 vWorldPos;

          uniform float uTime;
          uniform float uEnergy;
          uniform float uProximity;
          uniform float uPulse;

          float hash(vec3 p) {
            p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
          }
          float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                  mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                  mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
              f.z
            );
          }
          float fbm(vec3 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.05;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 P = vObjPos;

            float bandNoise = fbm(P * 4.0 + vec3(uTime * 0.015, 0.0, 0.0));
            float bands = sin(P.y * 26.0 + bandNoise * 7.0);

            float storm = fbm(P * 2.2 + vec3(uTime * 0.025, uTime * 0.01, 0.0));
            float storm2 = fbm(P * 5.5 - vec3(0.0, uTime * 0.03, 0.0));

            vec2 spotUV = vec2(
              atan(P.z, P.x) / 6.2831,
              P.y
            );
            float spotDist = length(vec2(
              (spotUV.x - 0.15) * 3.5,
              (spotUV.y + 0.15) * 2.2
            ));
            float blueSpot = 1.0 - smoothstep(0.35, 0.7, spotDist);
            blueSpot *= smoothstep(0.4, 0.7, fbm(P * 6.0 + vec3(uTime * 0.04, 0.0, 0.0)) + 0.5);

            vec3 abyssBlue = vec3(0.008, 0.018, 0.060);
            vec3 deepBlue = vec3(0.018, 0.055, 0.16);
            vec3 oceanBlue = vec3(0.035, 0.105, 0.30);
            vec3 mutedBlue = vec3(0.080, 0.190, 0.42);
            vec3 dustyBlue = vec3(0.16, 0.31, 0.52);
            vec3 cloudBlue = vec3(0.30, 0.46, 0.64);
            vec3 indigo = vec3(0.075, 0.035, 0.22);
            vec3 deepIndigo = vec3(0.035, 0.018, 0.11);

            float bandMask = smoothstep(-0.65, 0.65, bands);
            vec3 col = mix(deepBlue, oceanBlue, bandMask * 0.75);
            col = mix(col, mutedBlue, smoothstep(0.48, 0.72, bandNoise) * 0.34);

            float cloudLayer = smoothstep(0.38, 0.78, storm * 0.72 + storm2 * 0.28);
            col = mix(col, dustyBlue, cloudLayer * 0.30);
            col = mix(col, cloudBlue, smoothstep(0.78, 0.94, storm2) * 0.12);

            float indigoField = fbm(
              P * vec3(1.4, 5.0, 1.4) +
              vec3(uTime * 0.012, -uTime * 0.018, uTime * 0.008)
            );
            float indigoMask = smoothstep(0.60, 0.82, indigoField);
            indigoMask *= 0.55 + 0.45 * (0.5 + 0.5 * sin(P.y * 18.0));
            col = mix(col, indigo, indigoMask * 0.48);

            col = mix(col, deepIndigo, blueSpot * 0.52);

            col += vec3(0.055, 0.11, 0.19) * pow(storm2, 4.0);

            vec3 lightDir = normalize(vec3(-0.72, 0.22, 0.58));
            float diffuse = max(dot(N, lightDir), 0.0);
            float viewLight = pow(max(dot(N, V), 0.0), 0.65);
            float limb = pow(1.0 - max(dot(N, V), 0.0), 3.2);

            col *= 0.28 + diffuse * 0.72;
            col *= 0.72 + viewLight * 0.34;
            col += vec3(0.025, 0.075, 0.16) * limb;

            col *= 1.0 + uEnergy * 0.06 + uProximity * 0.10 + uPulse * 0.16;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })
    );

    const giantGeo = track(
      new THREE.SphereGeometry(GIANT_RADIUS, mobile ? 48 : 80, mobile ? 32 : 56)
    );

    const giant = new THREE.Mesh(giantGeo, giantMat);
    giantGroup.add(giant);

    const giantAtmoGeo = new THREE.SphereGeometry(
      GIANT_RADIUS * 1.018,
      mobile ? 48 : 96,
      mobile ? 32 : 64
    );

    const giantAtmoMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
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

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.8);
          float day = smoothstep(-0.25, 0.55, dot(N, normalize(vec3(-0.7, 0.2, 0.6))));
          vec3 atmosphere = mix(
            vec3(0.015, 0.035, 0.11),
            vec3(0.055, 0.16, 0.34),
            day
          );
          float alpha = fresnel * 0.22;
          gl_FragColor = vec4(atmosphere, alpha);
        }
      `,
    });
    const giantAtmo = new THREE.Mesh(giantAtmoGeo, giantAtmoMat);
    giantGroup.add(giantAtmo);

    /* ============================================================
       EARTH-LIKE MOON
       ============================================================ */

    const EARTH_RADIUS = 2.4;
    const earthGroup = new THREE.Group();
    earthGroup.position.set(4.6, -1.1, -3.5);
    world.add(earthGroup);

    const earthMat = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uProximity: { value: 0 },
          uPulse: { value: 0 },
          uSunDir: { value: new THREE.Vector3(1.0, 0.35, 0.5).normalize() },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vObjPos;
          varying vec3 vWorldPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vObjPos = normalize(position);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vObjPos;
          varying vec3 vWorldPos;

          uniform float uTime;
          uniform float uEnergy;
          uniform float uProximity;
          uniform float uPulse;
          uniform vec3 uSunDir;

          float hash(vec3 p) {
            p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
          }
          float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                  mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                  mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
              f.z
            );
          }
          float fbm(vec3 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.03;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 P = vObjPos;

            float land1 = fbm(P * 1.5 + vec3(0.0, uTime * 0.005, 0.0));
            float land2 = fbm(P * 4.0);
            float land = land1 * 0.7 + land2 * 0.3;

            float seaLevel = 0.5;
            float landMask = smoothstep(seaLevel - 0.02, seaLevel + 0.02, land);

            vec3 deepOcean = vec3(0.01, 0.06, 0.15);
            vec3 shallowOcean = vec3(0.03, 0.18, 0.32);
            vec3 ocean = mix(deepOcean, shallowOcean,
                             smoothstep(seaLevel - 0.1, seaLevel, land));

            float alt = smoothstep(seaLevel, seaLevel + 0.35, land);
            vec3 vegetation = vec3(0.08, 0.20, 0.08);
            vec3 vegetationDark = vec3(0.04, 0.12, 0.05);
            vec3 rock = vec3(0.28, 0.22, 0.14);
            vec3 desert = vec3(0.45, 0.36, 0.20);
            vec3 snow = vec3(0.85, 0.88, 0.90);

            vec3 landCol = mix(vegetationDark, vegetation,
                              smoothstep(0.0, 0.35, alt));
            float desertNoise = fbm(P * 2.5 + vec3(5.0, 0.0, 0.0));
            landCol = mix(landCol, desert,
                         smoothstep(0.55, 0.75, desertNoise) * 0.6);
            landCol = mix(landCol, rock,
                         smoothstep(0.4, 0.55, alt) * 0.4);
            float polar = smoothstep(0.72, 0.95, abs(P.y));
            landCol = mix(landCol, snow, polar * 0.7);

            vec3 surface = mix(ocean, landCol, landMask);
            surface = mix(surface, snow, polar * 0.5);

            vec3 L = normalize(uSunDir);
            float NdotL = dot(N, L);
            float lit = smoothstep(-0.2, 0.35, NdotL);
            float diff = max(NdotL, 0.0);

            vec3 col = surface * (0.08 + diff * 1.1);

            vec3 H = normalize(L + V);
            float spec = pow(max(dot(N, H), 0.0), 120.0);
            float isWater = 1.0 - landMask;
            col += vec3(1.0, 0.95, 0.85) * spec * isWater * 0.85;

            col = mix(vec3(0.004, 0.008, 0.02), col, lit);

            float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
            col += vec3(0.32, 0.62, 1.0) * fres * 0.85;

            col *= 1.0 + uEnergy * 0.2 + uProximity * 0.5 + uPulse * 0.85;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })
    );

    const earthGeo = track(
      new THREE.SphereGeometry(EARTH_RADIUS, mobile ? 48 : 72, mobile ? 32 : 48)
    );

    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    const cloudGeo = track(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.015, mobile ? 48 : 72, mobile ? 32 : 48)
    );

    const cloudMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uProximity: { value: 0 },
          uPulse: { value: 0 },
          uSunDir: { value: new THREE.Vector3(1.0, 0.35, 0.5).normalize() },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vObjPos;
          varying vec3 vWorldPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vObjPos = normalize(position);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vObjPos;
          varying vec3 vWorldPos;

          uniform float uTime;
          uniform float uEnergy;
          uniform float uProximity;
          uniform float uPulse;
          uniform vec3 uSunDir;

          float hash(vec3 p) {
            p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
          }
          float noise(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                  mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                  mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
              f.z
            );
          }
          float fbm(vec3 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.03;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 P = vObjPos;

            float c1 = fbm(P * 3.5 + vec3(uTime * 0.02, 0.0, 0.0));
            float c2 = fbm(P * 6.0 - vec3(uTime * 0.03, uTime * 0.02, 0.0));
            float clouds = c1 * 0.6 + c2 * 0.4;

            float lat = abs(P.y);
            float band1 = smoothstep(0.05, 0.25, 1.0 - lat);
            float band2 = smoothstep(0.35, 0.55, 1.0 - lat) *
                          smoothstep(0.15, 0.35, lat);
            float latMask = band1 * 0.6 + band2 * 0.4;

            float cloudMask = smoothstep(0.45, 0.75, clouds) * latMask;

            vec3 L = normalize(uSunDir);
            float NdotL = dot(N, L);
            float lit = smoothstep(-0.15, 0.35, NdotL);
            float diff = max(NdotL, 0.0);

            vec3 cloudCol = mix(vec3(0.4, 0.5, 0.7), vec3(1.0, 0.98, 0.95), lit);
            cloudCol *= (0.15 + diff * 1.2);

            float fres = pow(1.0 - max(dot(N, V), 0.0), 3.5);

            float alpha = cloudMask * (0.55 + fres * 0.5);
            alpha *= 1.0 + uEnergy * 0.3 + uProximity * 0.6 + uPulse * 0.9;

            gl_FragColor = vec4(cloudCol * alpha, alpha * 0.85);
          }
        `,
      })
    );

    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    const earthAtmoGeo = track(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.06, 64, 48)
    );

    const earthAtmoMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uProximity: { value: 0 },
          uPulse: { value: 0 },
          uSunDir: { value: new THREE.Vector3(1.0, 0.35, 0.5).normalize() },
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
          uniform float uProximity;
          uniform float uPulse;
          uniform vec3 uSunDir;

          void main() {
            vec3 V = normalize(cameraPosition - vWorldPos);
            vec3 N = normalize(vNormal);

            float fres = pow(1.0 - max(dot(N, V), 0.0), 4.5);

            vec3 col = vec3(0.42, 0.72, 1.0);

            float sunFacing = smoothstep(0.0, 1.0, dot(N, uSunDir));
            col = mix(col, vec3(0.55, 0.82, 1.0), sunFacing);

            float alpha = fres * 0.6;
            alpha *= 1.0 + uEnergy * 0.35 + uProximity * 0.7 + uPulse * 1.0;

            gl_FragColor = vec4(col * alpha, alpha);
          }
        `,
      })
    );

    const earthAtmo = new THREE.Mesh(earthAtmoGeo, earthAtmoMat);
    earthGroup.add(earthAtmo);

    /* ============================================================
       BLUE VOLUMETRIC FOG
       ------------------------------------------------------------
       Only the fog has been modified in this version.
       Slight blue increase — brighter mid-tier and slightly
       higher alpha so the fog reads more strongly without
       overpowering the scene.
       ============================================================ */

    const mainFogGeo = track(new THREE.PlaneGeometry(120, 75, 1, 1));

    const mainFogMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uGiantProx: { value: 0 },
          uEarthProx: { value: 0 },
          uPulse: { value: 0 },
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
          uniform float uGiantProx;
          uniform float uEarthProx;
          uniform float uPulse;

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
          float fbm(vec2 p, int oct) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for (int i = 0; i < 5; i++) {
              if (i >= oct) break;
              v += a * noise(p);
              p = rot * p * 2.02;
              a *= 0.5;
            }
            return v;
          }
          float warped(vec2 p, float t, int oct) {
            vec2 q = vec2(
              fbm(p + vec2(0.0, t * 0.04), 4),
              fbm(p + vec2(3.7, 1.9), 4)
            );
            vec2 r = vec2(
              fbm(p + 2.5 * q + vec2(1.2, 5.4) + t * 0.02, 4),
              fbm(p + 2.5 * q + vec2(6.8, 2.1) - t * 0.03, 4)
            );
            return fbm(p + 2.2 * r, oct);
          }

          void main() {
            vec2 uv = vUv;
            float t = uTime * 0.055;

            float n1 = warped(uv * 2.2, t, 6);
            float n2 = warped(uv * 4.5 + vec2(2.0, 0.0), t * 0.8, 5);
            float n3 = fbm(uv * 14.0 + vec2(t * 0.4, 0.0), 4);

            float density = n1 * 0.62 + n2 * 0.28 + n3 * 0.10;
            density = smoothstep(0.25, 0.85, density);

            /* Blue fog — brighter mid & light tiers */
            vec3 deepBlueFog = vec3(0.022, 0.045, 0.105);
            vec3 midBlueFog = vec3(0.075, 0.145, 0.305);
            vec3 lightBlueFog = vec3(0.155, 0.275, 0.505);
            vec3 brightBlueFog = vec3(0.240, 0.395, 0.640);

            vec3 col = mix(deepBlueFog, midBlueFog, smoothstep(0.2, 0.55, density));
            col = mix(col, lightBlueFog, smoothstep(0.5, 0.8, density));
            col = mix(col, brightBlueFog, smoothstep(0.75, 0.95, density));

            /* Indigo cloud patches */
            float indigoField = warped(uv * 1.4 + vec2(5.5, 2.2), t * 0.5, 5);
            float indigoMask = smoothstep(0.42, 0.68, indigoField);

            vec3 deepIndigoFog = vec3(0.055, 0.022, 0.14);
            vec3 midIndigoFog = vec3(0.13, 0.055, 0.275);
            vec3 brightIndigoFog = vec3(0.235, 0.115, 0.420);

            vec3 indigoCol = mix(deepIndigoFog, midIndigoFog,
                                 smoothstep(0.35, 0.65, indigoField));
            indigoCol = mix(indigoCol, brightIndigoFog,
                            smoothstep(0.68, 0.9, indigoField));

            col = mix(col, indigoCol, indigoMask * 0.56);

            /* Soft blue highlights */
            float accent = warped(uv * 3.2 + vec2(0.0, 8.0), t * 0.7, 4);
            float accentMask = smoothstep(0.80, 0.96, accent);
            col += vec3(0.220, 0.400, 0.640) * accentMask * 0.42;

            /* Deep blue atmospheric patches */
            float glowField = warped(uv * 0.8 + vec2(12.0, 4.0), t * 0.3, 4);
            float glowMask = smoothstep(0.70, 0.92, glowField);
            col += vec3(0.125, 0.235, 0.505) * glowMask * 0.30;

            /* Interaction remains restrained */
            col *= 1.0 + uEnergy * 0.08 + uPulse * 0.18;

            col += vec3(0.085, 0.185, 0.375) * uGiantProx * density * 0.22;
            col += indigoCol * uEarthProx * indigoMask * 0.20;
            col += vec3(0.115, 0.225, 0.455) * uPulse * indigoMask * 0.16;

            /* Slightly increased alpha for a touch more fog */
            float alpha = 0.70 * (0.55 + density * 0.45);

            gl_FragColor = vec4(col, alpha);
          }
        `,
      })
    );

    const mainFog = new THREE.Mesh(mainFogGeo, mainFogMat);
    mainFog.position.set(0, 0, -24);
    mainFog.renderOrder = -10;
    world.add(mainFog);

    /* ---- Back fog ---- */
    const backFogGeo = track(new THREE.PlaneGeometry(200, 120, 1, 1));
    const backFogMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
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
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p = rot * p * 2.02;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv;
            float t = uTime * 0.03;

            float n = fbm(uv * 1.8 + vec2(t, 0.0));
            n = smoothstep(0.3, 0.8, n);

            vec3 deep = vec3(0.010, 0.020, 0.055);
            vec3 mid = vec3(0.032, 0.068, 0.155);

            vec3 col = mix(deep, mid, n);

            float indigo = fbm(uv * 1.2 + vec2(7.0, 3.0) + vec2(t * 0.6, 0.0));
            col = mix(col, vec3(0.065, 0.030, 0.155),
                     smoothstep(0.5, 0.8, indigo) * 0.45);

            col *= 1.0 + uEnergy * 0.05;

            gl_FragColor = vec4(col, 0.42);
          }
        `,
      })
    );
    const backFog = new THREE.Mesh(backFogGeo, backFogMat);
    backFog.position.set(0, 0, -40);
    backFog.renderOrder = -20;
    world.add(backFog);

    /* ============================================================
       STAR DUST
       ============================================================ */

    const dustCount = mobile ? 1800 : 4000;
    const dustPos = new Float32Array(dustCount * 3);
    const dustCol = new Float32Array(dustCount * 3);
    const dustSize = new Float32Array(dustCount);
    const dustPhase = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 18 + Math.random() * 35;

      dustPos[i3] = r * Math.sin(phi) * Math.cos(theta);
      dustPos[i3 + 1] = r * Math.cos(phi) * 0.65;
      dustPos[i3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 15;

      const type = Math.random();
      if (type < 0.6) {
        dustCol[i3] = 0.90;
        dustCol[i3 + 1] = 0.86;
        dustCol[i3 + 2] = 0.76;
      } else if (type < 0.85) {
        dustCol[i3] = 0.78;
        dustCol[i3 + 1] = 0.72;
        dustCol[i3 + 2] = 0.60;
      } else {
        dustCol[i3] = 0.68;
        dustCol[i3 + 1] = 0.58;
        dustCol[i3 + 2] = 0.44;
      }

      dustSize[i] = 0.15 + Math.random() * 0.6;
      dustPhase[i] = Math.random() * Math.PI * 2;
    }

    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));
    dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSize, 1));
    dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(dustPhase, 1));

    const dustMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uPulse: { value: 0 },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aPhase;
          attribute vec3 color;

          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uEnergy;
          uniform float uPulse;

          varying vec3 vColor;
          varying float vFlicker;

          void main() {
            vColor = color;
            float flicker = 0.5 + 0.5 * sin(uTime * 1.1 + aPhase);
            vFlicker = flicker * (1.0 + uEnergy * 0.3 + uPulse * 0.6);

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
            float core = smoothstep(0.5, 0.02, d);
            float halo = smoothstep(0.5, 0.15, d) * 0.35;
            float a = core + halo;
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor * vFlicker, a * 0.7);
          }
        `,
      })
    );

    const dust = new THREE.Points(dustGeo, dustMat);
    world.add(dust);

    /* ============================================================
       HIGHLY INTERACTIVE ASTEROIDS
       ============================================================ */

    const asteroidMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x252a32,
        roughness: 0.94,
        metalness: 0.04,
        emissive: new THREE.Color(0x03070d),
        emissiveIntensity: 0.08,
        flatShading: false,
      })
    );

    const accentMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x3a4050,
        roughness: 0.90,
        metalness: 0.07,
        emissive: new THREE.Color(0x0b1020),
        emissiveIntensity: 0.18,
        flatShading: false,
      })
    );

    const createRockGeo = (seed: number, detail: number) => {
      const geo = new THREE.IcosahedronGeometry(1, detail);
      const positions = geo.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        const n1 = valueNoise3(x * 2.5 + seed, y * 2.5 + seed, z * 2.5 + seed);
        const n2 = valueNoise3(x * 6.0 + seed * 2, y * 6.0 + seed * 2, z * 6.0 + seed * 2);
        const n3 = valueNoise3(x * 11.0 + seed * 4, y * 11.0 + seed * 4, z * 11.0 + seed * 4);

        const disp =
          (n1 - 0.5) * 0.42 +
          (n2 - 0.5) * 0.22 +
          (n3 - 0.5) * 0.10;
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        const s = 1 + disp;

        positions[i] = (x / len) * len * s;
        positions[i + 1] = (y / len) * len * s;
        positions[i + 2] = (z / len) * len * s;
      }

      geo.computeVertexNormals();
      return geo;
    };

    const rockGeos: THREE.BufferGeometry[] = [];
    const geoSampleCount = mobile ? 6 : 10;
    for (let i = 0; i < geoSampleCount; i++) {
      rockGeos.push(track(createRockGeo(i * 3.7, mobile ? 1 : 2)));
    }

    interface RockData {
      mesh: THREE.Mesh;
      radius: number;
      angle: number;
      baseSpeed: number;
      speed: number;
      yOffset: number;
      rotSpeed: THREE.Vector3;
      baseScale: number;
      velocity: THREE.Vector3;
      hovered: number;
    }

    const rocks: RockData[] = [];

    const rockCount = mobile ? 100 : 200;
    const ringInner = GIANT_RADIUS * 1.35;
    const ringOuter = GIANT_RADIUS * 3.6;

    for (let i = 0; i < rockCount; i++) {
      const t = Math.pow(Math.random(), 1.4);
      const radius = ringInner + t * (ringOuter - ringInner);
      const angle = Math.random() * Math.PI * 2;

      const geo = rockGeos[Math.floor(Math.random() * rockGeos.length)];
      const isAccent = Math.random() < 0.2;
      const mat = isAccent ? accentMat : asteroidMat;

      const rock = new THREE.Mesh(geo, mat);

      const scale = (0.10 + Math.random() * 0.32) * (1 - t * 0.3);
      rock.scale.setScalar(scale);

      rock.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const yOffset = (Math.random() - 0.5) * (0.5 + radius * 0.12);

      rock.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius
      );

      giantGroup.add(rock);

      const baseSpeed = (0.35 + Math.random() * 0.25) * (7 / radius);

      rocks.push({
        mesh: rock,
        radius,
        angle,
        baseSpeed,
        speed: baseSpeed,
        yOffset,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.008
        ),
        baseScale: scale,
        velocity: new THREE.Vector3(),
        hovered: 0,
      });
    }

    interface LooseData {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      hovered: number;
      driftPhase: number;
    }

    const looseRocks: LooseData[] = [];
    const looseCount = mobile ? 50 : 110;

    for (let i = 0; i < looseCount; i++) {
      const geo = rockGeos[Math.floor(Math.random() * rockGeos.length)];
      const isAccent = Math.random() < 0.22;
      const mat = isAccent ? accentMat : asteroidMat;

      const rock = new THREE.Mesh(geo, mat);

      const scale = 0.18 + Math.random() * 0.6;
      rock.scale.setScalar(scale);

      rock.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const depth = Math.random();
      const x = (Math.random() - 0.5) * (22 + depth * 15);
      const y = (Math.random() - 0.5) * (14 + depth * 8);
      const z = 3 - Math.random() * 28;

      rock.position.set(x, y, z);
      world.add(rock);

      looseRocks.push({
        mesh: rock,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.006
        ),
        hovered: 0,
        driftPhase: Math.random() * Math.PI * 2,
      });
    }

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

    let smoothScroll = scrollRef.current;
    const cameraLookTarget = new THREE.Vector3(0, 0, 0);

    const damp = (current: number, target: number, speed: number, dt: number) => {
      const alpha = 1 - Math.exp(-speed * Math.min(dt, 0.05));
      return THREE.MathUtils.lerp(current, target, alpha);
    };

    const animate = () => {
      if (!running) return;
      animationFrame = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      smoothScroll = damp(smoothScroll, THREE.MathUtils.clamp(scrollRef.current, 0, 1), 5.5, dt);
      const scroll = smoothScroll;

      const prevX = pointer.x;
      const prevY = pointer.y;

      pointer.x = damp(pointer.x, pointer.targetX, 6.0, dt);
      pointer.y = damp(pointer.y, pointer.targetY, 6.0, dt);

      pointer.velocityX = pointer.x - prevX;
      pointer.velocityY = pointer.y - prevY;

      interaction.energy = damp(
        interaction.energy,
        interaction.targetEnergy,
        3.0,
        dt
      );

      interaction.giantProximity = damp(
        interaction.giantProximity,
        interaction.targetGiantProximity,
        4.0,
        dt
      );

      interaction.earthProximity = damp(
        interaction.earthProximity,
        interaction.targetEarthProximity,
        4.0,
        dt
      );

      interaction.cursorForce = damp(
        interaction.cursorForce,
        interaction.targetCursorForce,
        5.0,
        dt
      );

      interaction.pulse = damp(
        interaction.pulse,
        interaction.targetPulse,
        5.0,
        dt
      );
      interaction.targetPulse = Math.max(
        0,
        interaction.targetPulse - dt * 1.8
      );

      interaction.idleTime += dt;
      if (interaction.idleTime > 1.5) {
        interaction.idleCharge = Math.min(
          interaction.idleCharge + dt * 0.18,
          0.3
        );
      } else {
        interaction.idleCharge *= 0.95;
      }

      /* CAMERA */
      const targetZ = 22 - scroll * 17;
      const targetX = pointer.x * 1.6;
      const targetY = 0.3 + pointer.y * 1.1 + scroll * 0.4;

      camera.position.x = damp(camera.position.x, targetX, 4.5, dt);
      camera.position.y = damp(camera.position.y, targetY, 4.5, dt);
      camera.position.z = damp(camera.position.z, targetZ, 5.0, dt);

      const planetFocus = THREE.MathUtils.smoothstep(scroll, 0.0, 1.0);
      const focusX = THREE.MathUtils.lerp(pointer.x * 0.5, 4.6, planetFocus);
      const focusY = THREE.MathUtils.lerp(pointer.y * 0.3, -1.1, planetFocus);
      const focusZ = THREE.MathUtils.lerp(0, -3.5, planetFocus);

      cameraLookTarget.x = damp(cameraLookTarget.x, focusX, 5.5, dt);
      cameraLookTarget.y = damp(cameraLookTarget.y, focusY, 5.5, dt);
      cameraLookTarget.z = damp(cameraLookTarget.z, focusZ, 5.5, dt);
      camera.lookAt(cameraLookTarget);

      world.rotation.y = damp(
        world.rotation.y,
        pointer.x * 0.015,
        2.5,
        dt
      );
      world.rotation.x = damp(
        world.rotation.x,
        -pointer.y * 0.01,
        2.5,
        dt
      );

      /* GIANT */
      giantMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      giantMat.uniforms.uEnergy.value = interaction.energy + interaction.idleCharge;
      giantMat.uniforms.uProximity.value = interaction.giantProximity;
      giantMat.uniforms.uPulse.value = interaction.pulse;

      giantAtmoMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;

      if (!reducedMotion) {
        giant.rotation.y = elapsed * 0.008;
        giantAtmo.rotation.y = elapsed * 0.006;
      }

      /* EARTH */
      earthMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      earthMat.uniforms.uEnergy.value = interaction.energy + interaction.idleCharge;
      earthMat.uniforms.uProximity.value = interaction.earthProximity;
      earthMat.uniforms.uPulse.value = interaction.pulse;

      cloudMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      cloudMat.uniforms.uEnergy.value = interaction.energy + interaction.idleCharge;
      cloudMat.uniforms.uProximity.value = interaction.earthProximity;
      cloudMat.uniforms.uPulse.value = interaction.pulse;

      earthAtmoMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      earthAtmoMat.uniforms.uEnergy.value = interaction.energy + interaction.idleCharge;
      earthAtmoMat.uniforms.uProximity.value = interaction.earthProximity;
      earthAtmoMat.uniforms.uPulse.value = interaction.pulse;

      if (!reducedMotion) {
        earth.rotation.y += 0.0015;
        clouds.rotation.y += 0.0019;
      }

      const planetApproach = THREE.MathUtils.smoothstep(scroll, 0.35, 1.0);
      const planetScale = 1.0 + planetApproach * 0.035;
      earthGroup.scale.setScalar(planetScale);

      /* FOG */
      mainFogMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      mainFogMat.uniforms.uEnergy.value = interaction.energy + interaction.idleCharge;
      mainFogMat.uniforms.uGiantProx.value = interaction.giantProximity;
      mainFogMat.uniforms.uEarthProx.value = interaction.earthProximity;
      mainFogMat.uniforms.uPulse.value = interaction.pulse;

      backFogMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed * 0.6;
      backFogMat.uniforms.uEnergy.value = interaction.energy;

      if (!reducedMotion) {
        mainFog.rotation.z = Math.sin(elapsed * 0.05) * 0.008;
        backFog.rotation.z = Math.sin(elapsed * 0.03 + 1.5) * 0.012;
      }

      /* DUST */
      dustMat.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
      dustMat.uniforms.uEnergy.value = interaction.energy;
      dustMat.uniforms.uPulse.value = interaction.pulse;

      if (!reducedMotion) {
        dust.rotation.y += 0.0003;
        dust.rotation.x += pointer.velocityY * 0.0002;
      }

      /* ASTEROIDS */
      const pointerVelocityMag = Math.sqrt(
        pointer.velocityX * pointer.velocityX +
        pointer.velocityY * pointer.velocityY
      );

      interaction.shockwave *= 0.94;

      if (!reducedMotion) {
        rocks.forEach((r) => {
          const localPointer = new THREE.Vector3(
            pointer.worldX - giantGroup.position.x,
            pointer.worldY - giantGroup.position.y,
            -giantGroup.position.z
          );

          r.angle += r.speed * 0.01;

          const ringX = Math.cos(r.angle) * r.radius;
          const ringZ = Math.sin(r.angle) * r.radius;
          const ringY = r.yOffset + Math.sin(r.angle * 2) * 0.15;

          r.mesh.position.set(ringX, ringY, ringZ);

          const dx = ringX - localPointer.x;
          const dy = ringY - localPointer.y;
          const distSq = dx * dx + dy * dy;
          const influenceRadius = 8.0;

          if (distSq < influenceRadius * influenceRadius && distSq > 0.01) {
            const d = Math.sqrt(distSq);
            const falloff = 1 - d / influenceRadius;
            const force = falloff * interaction.cursorForce * 0.35;

            r.velocity.x += (dx / d) * force;
            r.velocity.y += (dy / d) * force;

            r.velocity.x += pointer.velocityX * 0.95 * falloff;
            r.velocity.y += pointer.velocityY * 0.95 * falloff;

            r.hovered = Math.min(r.hovered + 0.2, 1);
          } else {
            r.hovered *= 0.94;
          }

          if (interaction.shockwave > 0.05) {
            const shockX = r.mesh.position.x + giantGroup.position.x - interaction.shockOrigin.x;
            const shockY = r.mesh.position.y + giantGroup.position.y - interaction.shockOrigin.y;
            const shockDistSq = shockX * shockX + shockY * shockY;

            if (shockDistSq < 100 && shockDistSq > 0.01) {
              const shockDist = Math.sqrt(shockDistSq);
              const shockForce =
                interaction.shockwave *
                Math.max(0, 1 - shockDist / 10) *
                1.2;

              r.velocity.x += (shockX / shockDist) * shockForce;
              r.velocity.y += (shockY / shockDist) * shockForce;

              r.hovered = Math.min(r.hovered + interaction.shockwave * 0.5, 1);
            }
          }

          r.mesh.position.x += r.velocity.x;
          r.mesh.position.y += r.velocity.y;
          r.mesh.position.z += r.velocity.z;

          r.velocity.x *= 0.9;
          r.velocity.y *= 0.9;
          r.velocity.z *= 0.9;

          r.mesh.position.x += (ringX - r.mesh.position.x) * 0.045;
          r.mesh.position.y += (ringY - r.mesh.position.y) * 0.045;
          r.mesh.position.z += (ringZ - r.mesh.position.z) * 0.045;

          r.mesh.rotation.x += r.rotSpeed.x + pointerVelocityMag * 0.02;
          r.mesh.rotation.y += r.rotSpeed.y + pointerVelocityMag * 0.02;
          r.mesh.rotation.z += r.rotSpeed.z;

          const s = r.baseScale * (1 + r.hovered * 0.16);
          r.mesh.scale.setScalar(s);

          r.speed =
            r.baseSpeed *
            (1 + interaction.cursorForce * 1.2);
        });

        looseRocks.forEach((r) => {
          const px = r.mesh.position.x;
          const py = r.mesh.position.y;
          const pz = r.mesh.position.z;

          const dx = px - pointer.worldX;
          const dy = py - pointer.worldY;
          const dz = Math.abs(pz);

          const distSq = dx * dx + dy * dy;
          const influenceRadius = 8.0;

          if (distSq < influenceRadius * influenceRadius && distSq > 0.01) {
            const d = Math.sqrt(distSq);
            const falloff = 1 - d / influenceRadius;
            const depthFactor = 1 / (1 + dz * 0.05);

            const force =
              falloff *
              interaction.cursorForce *
              0.4 *
              depthFactor;

            r.velocity.x += (dx / d) * force;
            r.velocity.y += (dy / d) * force;

            r.velocity.x += pointer.velocityX * 1.0 * falloff * depthFactor;
            r.velocity.y += pointer.velocityY * 1.0 * falloff * depthFactor;

            r.hovered = Math.min(r.hovered + 0.25, 1);
          } else {
            r.hovered *= 0.94;
          }

          if (interaction.shockwave > 0.05) {
            const shockX = px - interaction.shockOrigin.x;
            const shockY = py - interaction.shockOrigin.y;
            const shockDistSq = shockX * shockX + shockY * shockY;

            if (shockDistSq < 144 && shockDistSq > 0.01) {
              const shockDist = Math.sqrt(shockDistSq);
              const shockForce =
                interaction.shockwave *
                Math.max(0, 1 - shockDist / 12) *
                1.5;

              r.velocity.x += (shockX / shockDist) * shockForce;
              r.velocity.y += (shockY / shockDist) * shockForce;

              r.hovered = Math.min(r.hovered + interaction.shockwave * 0.6, 1);
            }
          }

          r.mesh.position.x += r.velocity.x;
          r.mesh.position.y += r.velocity.y;
          r.mesh.position.z += r.velocity.z;

          r.mesh.position.y +=
            Math.sin(elapsed * 0.3 + r.driftPhase) * 0.002;

          r.velocity.x *= 0.92;
          r.velocity.y *= 0.92;
          r.velocity.z *= 0.92;

          r.mesh.position.x +=
            r.velocity.x * 0.4 +
            Math.sin(elapsed * 0.2 + r.driftPhase) * 0.0015;
          r.mesh.position.y +=
            r.velocity.y * 0.4 +
            Math.cos(elapsed * 0.15 + r.driftPhase) * 0.0012;

          r.mesh.rotation.x += r.rotSpeed.x + pointerVelocityMag * 0.015;
          r.mesh.rotation.y += r.rotSpeed.y + pointerVelocityMag * 0.015;
          r.mesh.rotation.z += r.rotSpeed.z;

          const currentScale = r.mesh.scale.x;
          const targetScale = 0.3 + (r.hovered * 0.25);
          r.mesh.scale.setScalar(
            currentScale + (targetScale - currentScale) * 0.15
          );
        });
      }

      asteroidMat.emissiveIntensity =
        0.08 +
        interaction.pulse * 0.30 +
        interaction.cursorForce * 0.18 +
        interaction.shockwave * 0.45;

      accentMat.emissiveIntensity =
        0.18 +
        interaction.pulse * 0.55 +
        interaction.cursorForce * 0.25 +
        interaction.shockwave * 0.65;

      giantLight.intensity =
        1.35 +
        interaction.giantProximity * 0.75 +
        interaction.pulse * 0.55 +
        interaction.idleCharge * 0.25 +
        interaction.shockwave * 0.65;

      keyLight.intensity =
        1.7 + interaction.energy * 0.5 + interaction.pulse * 1.0;

      rimLight.intensity =
        0.75 + interaction.earthProximity * 0.8;

      bloom.strength =
        0.24 +
        interaction.energy * 0.08 +
        interaction.giantProximity * 0.08 +
        interaction.pulse * 0.12 +
        interaction.shockwave * 0.16;

      bloom.radius =
        0.8 + interaction.giantProximity * 0.1;

      renderer.toneMappingExposure =
        1.0 + interaction.energy * 0.04 + interaction.pulse * 0.06;

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

      giantAtmoGeo.dispose();
      giantAtmoMat.dispose();

      disposables.forEach((item) => item.dispose());

      composer.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

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

export default PandoraHeroScene;