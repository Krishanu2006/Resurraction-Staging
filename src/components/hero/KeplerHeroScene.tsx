import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface KeplerHeroSceneProps {
  scrollProgress?: number;
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* ================================================================
   KEPLER-186f hero.
   Composition: dark red/burgundy land, cold navy-teal oceans, a thin
   atmospheric limb, a warm red host star upper-left, three small moons,
   restrained purple nebula. No text is drawn in the scene.

   Shared by every shader: tone mapping + colour space chunks, so the
   ShaderMaterials match the rest of the renderer instead of writing raw
   linear values to an sRGB framebuffer.
   ================================================================ */

const NOISE = /* glsl */ `
  vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    float a = dot(hash33(i), f);
    float b = dot(hash33(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
    float c = dot(hash33(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
    float d = dot(hash33(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
    float e = dot(hash33(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
    float g = dot(hash33(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
    float h = dot(hash33(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
    float k = dot(hash33(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
    return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y),
               mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z) * 0.5 + 0.5;
  }
`;

const sphereVertex = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vLocal = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorldPos = w.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FINISH = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

const planetFragment = /* glsl */ `
  uniform vec3 uStarPosition;
  uniform mat3 uRot;
  uniform float uFade;
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  ${NOISE}

  float heightAt(vec3 n) {
    return noise3(n * 3.8) * 0.55 + noise3(n * 10.0 + vec3(2.0, -4.0, 5.0)) * 0.30
         + noise3(n * 26.0) * 0.15;
  }

  void main() {
    vec3 sn = normalize(vLocal);

    float broad = noise3(sn * 1.45);
    float regional = noise3(sn * 3.1 + vec3(7.0, -2.0, 4.0));
    float detail = noise3(sn * 7.5 - vec3(3.0, 5.0, 1.0));
    float landValue = broad * 0.62 + regional * 0.26 + detail * 0.12;
    float landMask = smoothstep(0.525, 0.555, landValue);
    float coastBand = smoothstep(0.525, 0.54, landValue) * (1.0 - smoothstep(0.54, 0.575, landValue));

    // Relief: perturb the normal from the height field gradient (land only).
    vec3 up = abs(sn.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 t1 = normalize(cross(up, sn));
    vec3 t2 = cross(sn, t1);
    float e = 0.012;
    float h0 = heightAt(sn);
    float h1 = heightAt(normalize(sn + t1 * e));
    float h2 = heightAt(normalize(sn + t2 * e));
    vec3 grad = (t1 * (h1 - h0) + t2 * (h2 - h0)) / e;
    vec3 N = normalize(vWorldNormal - uRot * grad * 0.05 * landMask);

    vec3 L = normalize(uStarPosition - vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(L + V);
    float ndl = dot(N, L);
    float diff = smoothstep(-0.30, 0.65, ndl);

    // Land: burgundy lowlands to rust highs, pale mineral crust on ridges.
    float mineral = noise3(sn * 8.0 + vec3(9.0, 1.0, -4.0));
    vec3 land = mix(vec3(0.065, 0.017, 0.019), vec3(0.205, 0.048, 0.043), smoothstep(0.25, 0.60, h0));
    land = mix(land, vec3(0.39, 0.105, 0.075), smoothstep(0.62, 0.90, h0));
    land *= mix(vec3(0.88, 0.92, 0.90), vec3(1.05, 0.86, 0.79), mineral);
    land = mix(land, vec3(0.50, 0.30, 0.27), smoothstep(0.72, 0.90, h0) * 0.45);
    land = mix(land, vec3(0.42, 0.24, 0.21), coastBand * 0.55);

    // Ocean: near-black deep water, teal shelf along coasts.
    float shelf = 1.0 - smoothstep(0.43, 0.53, landValue);
    float oceanVar = regional * 0.75 + detail * 0.25;
    vec3 ocean = mix(vec3(0.004, 0.013, 0.021), vec3(0.028, 0.13, 0.16), smoothstep(0.28, 0.72, oceanVar));
    ocean = mix(ocean, vec3(0.03, 0.17, 0.20), shelf * 0.55);

    vec3 albedo = mix(ocean, land, landMask);
    vec3 starCol = vec3(1.0, 0.48, 0.36) * 2.8;
    vec3 col = albedo * (starCol * diff + vec3(0.05, 0.07, 0.11) * 0.9);

    float spec = pow(max(dot(N, H), 0.0), 140.0) * smoothstep(0.0, 0.3, ndl) * (1.0 - landMask);
    col += vec3(0.20, 0.46, 0.52) * spec * 0.9;

    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    col += vec3(0.24, 0.72, 0.82) * fresnel * smoothstep(-0.08, 0.72, ndl) * 0.25;
    float twilight = (1.0 - smoothstep(-0.12, 0.38, ndl)) * smoothstep(-0.42, 0.18, ndl);
    col += vec3(0.52, 0.055, 0.032) * twilight * fresnel * 0.34;

    // Distinct crimson red glow hitting Kepler's horizon and dayside from the red star
    float starRim = pow(1.0 - max(dot(N, V), 0.0), 3.2) * smoothstep(-0.15, 0.65, ndl);
    col += vec3(1.0, 0.20, 0.12) * starRim * 0.75;
    col += vec3(0.85, 0.14, 0.09) * smoothstep(0.05, 0.80, ndl) * 0.15;

    gl_FragColor = vec4(col, uFade);
    ${FINISH}
  }
`;

const cloudFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uStarPosition;
  uniform float uFade;
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vec3 n = normalize(vLocal);
    vec2 uv = vec2(atan(n.z, n.x) / 6.2831853 + 0.5, asin(clamp(n.y, -1.0, 1.0)) / 3.14159265 + 0.5);
    float d = texture2D(uMap, uv).r;
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uStarPosition - vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float diff = smoothstep(-0.30, 0.65, dot(N, L));
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    vec3 col = mix(vec3(0.40, 0.20, 0.22), vec3(1.0, 0.80, 0.74), diff) * (0.08 + 0.92 * diff) * 1.6;
    // Red star rim scatter on clouds facing the star
    col += vec3(1.0, 0.22, 0.14) * rim * diff * 0.40;
    float a = d * (0.10 + 0.90 * diff) * 0.78 * (0.75 + 0.5 * rim) * uFade;
    gl_FragColor = vec4(col, a);
    ${FINISH}
  }
`;

// Thin atmosphere computed from each view ray's closest approach to the
// planet, so the limb has a physical falloff instead of a flat shell colour.
const atmosphereFragment = /* glsl */ `
  uniform vec3 uStarPosition;
  uniform vec3 uCenter;
  uniform float uRadius;
  uniform float uOuter;
  uniform float uFade;
  varying vec3 vWorldPos;
  void main() {
    vec3 ro = cameraPosition;
    vec3 rd = normalize(vWorldPos - ro);
    float t = dot(uCenter - ro, rd);
    vec3 p = ro + rd * t;
    vec3 r = p - uCenter;
    float d = length(r);
    float x = d / uRadius;
    vec3 n = r / max(d, 1e-4);
    vec3 L = normalize(uStarPosition - p);
    float s = dot(n, L);

    float solar = smoothstep(-0.25, 0.70, s);
    float inner = pow(smoothstep(0.90, 1.0, x), 2.0);
    float outer = exp(-(x - 1.0) * 58.0) * (1.0 - smoothstep(0.55, 1.0, (x - 1.0) / (uOuter - 1.0)));
    float g = x < 1.0 ? inner : outer;

    float tw = smoothstep(-0.35, 0.05, s) * (1.0 - smoothstep(0.05, 0.50, s));
    // Side facing Kepler-186 red dwarf receives a vibrant crimson-vermilion solar wash
    vec3 dayAtmo = mix(vec3(0.25, 0.62, 0.82), vec3(1.0, 0.28, 0.16), smoothstep(-0.15, 0.55, s));
    vec3 nightAtmo = vec3(0.12, 0.32, 0.50);
    vec3 col = mix(nightAtmo, dayAtmo, solar);
    // Deep crimson twilight along terminator
    col = mix(col, vec3(1.0, 0.12, 0.06), tw * 0.92);

    // Radiant red atmospheric rim bloom facing the star
    float starLimb = exp(-(x - 1.0) * 42.0) * smoothstep(-0.05, 0.80, s);
    col += vec3(1.0, 0.24, 0.14) * starLimb * 0.95;

    float a = (0.06 + 0.94 * solar) * g * 0.95 * uFade;
    a += starLimb * 0.25 * uFade;
    gl_FragColor = vec4(col, a);
    ${FINISH}
  }
`;

/* Starfield shader.
   aBright: per-star intrinsic brightness (faint to bright).
   aPhase:  per-star random phase for very slight atmospheric-free scintillation.
   Stars smaller than one pixel are drawn as a 1px point and dimmed by their
   pixel coverage, which is how a real sub-pixel point source integrates. */
const starfieldVertex = /* glsl */ `
  attribute float aSize;
  attribute float aBright;
  attribute float aPhase;

  uniform float uTime;
  uniform float uTwinkle;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;

    vec4 mv = modelViewMatrix * vec4(position, 1.0);

        // aSize is now directly interpreted as screen pixels.
    gl_PointSize = aSize;

    float tw = 1.0 +
      uTwinkle * 0.08 *
      sin(uTime * (0.5 + aPhase * 1.3) + aPhase * 43.98);

    vAlpha = aBright * tw;

    gl_Position = projectionMatrix * mv;
  }
`;

const starfieldFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    if (d > 0.5) discard;

    // Small bright core with a very subtle glow.
    float core = 1.0 - smoothstep(0.0, 0.16, d);
    float glow = 1.0 - smoothstep(0.08, 0.5, d);

    float alpha = (core * 0.9 + glow * 0.32) * vAlpha;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

function createStarfield(count: number, cameraZ: number, fovDeg: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const brightness = new Float32Array(count);
  const phases = new Float32Array(count);

  let seed = 186186;

  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Mostly white and blue-white, with a few warmer stars, like a real field.
  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xffffff),
    new THREE.Color(0xdce7ff),
    new THREE.Color(0xdce7ff),
    new THREE.Color(0xbfd8ff),
    new THREE.Color(0xaec6ff),
    new THREE.Color(0xfff4ea),
    new THREE.Color(0xffe5dc),
    new THREE.Color(0xffd9bf),
  ];

  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fovDeg / 2));

  for (let i = 0; i < count; i++) {
    // Depth first, so the lateral spread can follow the view frustum at that
    // depth. This keeps star density even across the screen near and far.
    const z = -24 - random() * 180;
    const dist = cameraZ - z;
    const halfH = tanHalfFov * dist * 1.35; // margin for camera push + parallax
    const halfW = halfH * 2.35;

    positions[i * 3] = (random() * 2 - 1) * halfW;
    positions[i * 3 + 1] = (random() * 2 - 1) * halfH;
    positions[i * 3 + 2] = z;

    const c = palette[Math.floor(random() * palette.length)];

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    // Mostly tiny stars.
    // A very small percentage are slightly brighter/larger.
    const rareBrightStar = random() > 0.985;

    sizes[i] = rareBrightStar
      ? 7.0
      : 5.0;

    // Brightness loosely follows size but with its own scatter,
    // so some small stars are bright and some larger ones are dim.
    if (rareBrightStar) {
      brightness[i] = 0.92 + random() * 0.08;
    } else {
      const sizeT = clamp01((sizes[i] - 0.30) / 0.55);

      brightness[i] = clamp01(
        0.42 +
        sizeT * 0.28 +
        Math.pow(random(), 2.0) * 0.38
      );
    }

    phases[i] = random();
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  );

  geometry.setAttribute(
    'aSize',
    new THREE.BufferAttribute(sizes, 1)
  );

  geometry.setAttribute(
    'aBright',
    new THREE.BufferAttribute(brightness, 1)
  );

  geometry.setAttribute(
    'aPhase',
    new THREE.BufferAttribute(phases, 1)
  );

  return geometry;
}
/* Cloud density baked once from 3D noise sampled on the sphere, so there is
   no seam at the texture edge and no per-frame cost beyond one texture read. */
function createCloudTexture(width = 512, height = 256) {
  const hash = (x: number, y: number, z: number) => {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const vnoise = (x: number, y: number, z: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = x - xi, fy = y - yi, fz = z - zi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    const m = (a: number, b: number, t: number) => a + (b - a) * t;
    return m(
      m(m(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), m(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
      m(m(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), m(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
      w
    );
  };
  const fbm = (x: number, y: number, z: number) => {
    let sum = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 4; o++) {
      sum += vnoise(x * f, y * f, z * f) * amp;
      amp *= 0.5;
      f *= 2.03;
    }
    return sum;
  };

  const data = new Uint8Array(width * height * 4);
  for (let j = 0; j < height; j++) {
    const lat = (j / (height - 1) - 0.5) * Math.PI;
    for (let i = 0; i < width; i++) {
      const lon = (i / width - 0.5) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);
      // Light domain warp gives the soft sheared look of real cloud decks.
      const wx = fbm(x * 2 + 11, y * 2, z * 2) - 0.5;
      const wz = fbm(x * 2, y * 2 + 5, z * 2 + 3) - 0.5;
      let c = fbm(x * 3.2 + wx * 1.1, y * 5.5, z * 3.2 + wz * 1.1);
      c *= 1 - smoothstep(0.75, 1.0, Math.abs(y)) * 0.4;
      const a = Math.round(smoothstep(0.50, 0.68, c) * 255);
      const k = (j * width + i) * 4;
      data[k] = data[k + 1] = data[k + 2] = data[k + 3] = a;
    }
  }
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/* Host star: an unmistakable glowing red dwarf star (Kepler-186) with fiery
   crimson disc, dynamic solar granulation, and radiant ruby/vermilion corona. */
function createStarTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  // 1. Wide Atmospheric Red Corona Halo
  const halo = ctx.createRadialGradient(c, c, 0, c, c, c);
  halo.addColorStop(0.0, 'rgba(255, 45, 55, 0.95)');
  halo.addColorStop(0.18, 'rgba(255, 65, 35, 0.78)');
  halo.addColorStop(0.38, 'rgba(235, 25, 45, 0.48)');
  halo.addColorStop(0.62, 'rgba(185, 12, 35, 0.22)');
  halo.addColorStop(0.85, 'rgba(125, 0, 22, 0.08)');
  halo.addColorStop(1.0, 'rgba(60, 0, 10, 0.0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // 2. Anamorphic Red Lens Flare Spikes (Optical cross diffraction)
  const drawSpike = (angleRad: number, length: number, width: number) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(angleRad);
    const grad = ctx.createLinearGradient(-length, 0, length, 0);
    grad.addColorStop(0.0, 'rgba(255, 35, 45, 0.0)');
    grad.addColorStop(0.35, 'rgba(255, 65, 55, 0.40)');
    grad.addColorStop(0.5, 'rgba(255, 150, 110, 0.90)');
    grad.addColorStop(0.65, 'rgba(255, 65, 55, 0.40)');
    grad.addColorStop(1.0, 'rgba(255, 35, 45, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawSpike(THREE.MathUtils.degToRad(-26), size * 0.48, 5.5);
  drawSpike(THREE.MathUtils.degToRad(64), size * 0.36, 4.0);

  // 3. Dense Incandescent Red Solar Disc
  const R = 68;
  const disc = ctx.createRadialGradient(c, c, 0, c, c, R);
  disc.addColorStop(0.0, '#ff7a5c'); // Hot incandescent vermilion/orange core
  disc.addColorStop(0.42, '#ff2536'); // Vibrant ruby crimson
  disc.addColorStop(0.82, '#d6001a'); // Saturated deep scarlet
  disc.addColorStop(1.0, '#8c0014'); // Solar limb darkening

  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = disc;
  ctx.fillRect(c - R, c - R, R * 2, R * 2);

  // Solar surface granulation and fiery convective flares
  let s = 186;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 500; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * R;
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255, 130, 90, 0.38)' : 'rgba(170, 0, 25, 0.48)';
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 1.2 + rnd() * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Subtle atmospheric smoke / dust around the planet.
   Generated once on a canvas, so it has almost no per-frame GPU cost. */
function createSmokeTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const center = size / 2;

  // Very soft volumetric-looking radial cloud.
  const gradient = ctx.createRadialGradient(
    center,
    center,
    size * 0.08,
    center,
    center,
    size * 0.48
  );

  gradient.addColorStop(0, 'rgba(120, 150, 170, 0.10)');
  gradient.addColorStop(0.28, 'rgba(90, 120, 145, 0.075)');
  gradient.addColorStop(0.55, 'rgba(55, 75, 100, 0.045)');
  gradient.addColorStop(0.78, 'rgba(30, 40, 65, 0.02)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Soft red star glow wash from top-left direction towards Kepler
  const starHaze = ctx.createRadialGradient(
    size * 0.22,
    size * 0.22,
    0,
    size * 0.22,
    size * 0.22,
    size * 0.65
  );
  starHaze.addColorStop(0, 'rgba(255, 65, 45, 0.14)');
  starHaze.addColorStop(0.35, 'rgba(220, 45, 35, 0.08)');
  starHaze.addColorStop(0.7, 'rgba(160, 25, 25, 0.025)');
  starHaze.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = starHaze;
  ctx.fillRect(0, 0, size, size);

  // Large irregular smoke patches.
  let seed = 91823;

  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 65; i++) {
    const x = center + (random() - 0.5) * size * 0.72;
    const y = center + (random() - 0.5) * size * 0.55;

    const radius =
      size * (0.025 + Math.pow(random(), 1.7) * 0.08);

    const alpha = 0.012 + random() * 0.025;

    const smoke = ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      radius
    );

    smoke.addColorStop(
      0,
      `rgba(130, 145, 165, ${alpha})`
    );

    smoke.addColorStop(
      0.55,
      `rgba(75, 90, 115, ${alpha * 0.45})`
    );

    smoke.addColorStop(
      1,
      'rgba(0, 0, 0, 0)'
    );

    ctx.fillStyle = smoke;
    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return texture;
}

function createMoon(radius: number, position: THREE.Vector3, color: number, segments: number) {
  const group = new THREE.Group();
  group.position.copy(position);
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  return { group, mesh, geometry, material };
}

export const KeplerHeroScene: React.FC<KeplerHeroSceneProps> = ({ scrollProgress = 0 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);

    const CAMERA_FOV = isMobile ? 43 : 38;
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );
    camera.position.set(0, 0.75, 16.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
    });
    container.appendChild(renderer.domElement);

    /* ---------------- Red dwarf host star (Kepler-186) ---------------- */
    const starPosition = new THREE.Vector3(-6.8, 4.8, -10.5);
    const starTexture = createStarTexture();
    const star = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: starTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    );
    const STAR_SIZE = isMobile ? 4.5 : 5.8;
    star.scale.set(STAR_SIZE, STAR_SIZE, 1);
    star.position.copy(starPosition);
    scene.add(star);

    const starLight = new THREE.PointLight(0xff3322, isMobile ? 95 : 135, 120, 1.8);
    starLight.position.copy(starPosition);
    scene.add(starLight);

    const redSunDirLight = new THREE.DirectionalLight(0xff4433, 2.6);
    redSunDirLight.position.copy(starPosition);
    scene.add(redSunDirLight);

    /* ---------------- Nebula ---------------- */
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 1024;
    nebulaCanvas.height = 512;
    const nctx = nebulaCanvas.getContext('2d')!;
    nctx.fillStyle = '#02040a';
    nctx.fillRect(0, 0, 1024, 512);
    const bands = [
      { x: 180, y: 135, r: 190, a: 0.2, c: '106,45,121' },
      { x: 475, y: 100, r: 230, a: 0.17, c: '34,74,119' },
      { x: 790, y: 180, r: 200, a: 0.14, c: '121,38,99' },
      { x: 900, y: 70, r: 170, a: 0.2, c: '112,62,150' },
      { x: 650, y: 385, r: 170, a: 0.1, c: '37,59,108' },
    ];
    for (const b of bands) {
      const g = nctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(${b.c},${b.a})`);
      g.addColorStop(0.65, `rgba(${b.c},0.035)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      nctx.fillStyle = g;
      nctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);
    nebulaTexture.colorSpace = THREE.SRGBColorSpace;
    const nebula = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: nebulaTexture, transparent: true, opacity: 0.42, depthWrite: false })
    );
    nebula.scale.set(58, 29, 1);
    nebula.position.set(2, 4, -48);
    scene.add(nebula);

    /* ---------------- Planet ---------------- */
    const PLANET_RADIUS = 8.35;
    const ATMOS_OUTER = 1.06;
    const seg = isMobile ? 48 : 72;

    const planetRoot = new THREE.Group();
    planetRoot.position.set(0.25, -6.75, -0.75);
    planetRoot.rotation.z = THREE.MathUtils.degToRad(-6);
    scene.add(planetRoot);

    const planetGeometry = new THREE.SphereGeometry(PLANET_RADIUS, seg, seg);
    const planetMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uStarPosition: { value: starPosition },
        uRot: { value: new THREE.Matrix3() },
        uFade: { value: 1 },
      },
      vertexShader: sphereVertex,
      fragmentShader: planetFragment,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.renderOrder = 0;
    planetRoot.add(planet);

    const cloudTexture = createCloudTexture();
    const cloudGeometry = new THREE.SphereGeometry(PLANET_RADIUS * 1.012, seg, seg);
    const cloudMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: cloudTexture },
        uStarPosition: { value: starPosition },
        uFade: { value: 1 },
      },
      vertexShader: sphereVertex,
      fragmentShader: cloudFragment,
    });
    const cloudShell = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudShell.renderOrder = 1;
    planetRoot.add(cloudShell);

    const atmosphereGeometry = new THREE.SphereGeometry(PLANET_RADIUS * ATMOS_OUTER, seg, seg);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uStarPosition: { value: starPosition },
        uCenter: { value: planetRoot.position },
        uRadius: { value: PLANET_RADIUS },
        uOuter: { value: ATMOS_OUTER },
        uFade: { value: 1 },
      },
      vertexShader: sphereVertex,
      fragmentShader: atmosphereFragment,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.renderOrder = 2;
    planetRoot.add(atmosphere);

    /* ---------------- Atmospheric smoke ---------------- */

    const smokeTexture = createSmokeTexture();

    const smokeMaterial = new THREE.SpriteMaterial({
      map: smokeTexture,
      transparent: true,
      opacity: isMobile ? 0.20 : 0.27,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });

    const smoke = new THREE.Sprite(smokeMaterial);

    // Slightly larger than the planet.
    // The planet remains the dominant object.
    const smokeSize = PLANET_RADIUS * 2.28;
    smoke.scale.set(smokeSize, smokeSize, 1);

    smoke.position.set(
      0.15,
      0.15,
      0.22
    );

    smoke.renderOrder = 3;
    planetRoot.add(smoke);

    /* ---------------- Moons ---------------- */
    const moonFar = createMoon(0.26, new THREE.Vector3(-4.2, 4.25, -17), 0x1b1d24, isMobile ? 20 : 32);
    const moonMid = createMoon(0.48, new THREE.Vector3(-5.5, 2.1, -13), 0x171a20, isMobile ? 24 : 36);
    const moonRight = createMoon(0.2, new THREE.Vector3(3.7, 4.2, -15), 0x202027, isMobile ? 20 : 28);
    scene.add(moonFar.group, moonMid.group, moonRight.group);
    scene.add(new THREE.HemisphereLight(0x8bb8d0, 0x08070a, 0.11));

    /* ---------------- Starfield ---------------- */
    const starGeometry = createStarfield(isMobile ? 2000 : 7000, camera.position.z, CAMERA_FOV);
    const starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uTwinkle: { value: reducedMotion ? 0 : 1 },
      },
      vertexShader: starfieldVertex,
      fragmentShader: starfieldFragment,
    });
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);

    /* ---------------- Input / resize / visibility ---------------- */
    const pointer = { targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // When the cursor leaves the window, ease back to the neutral pose.
    const onPointerLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        pointer.targetX = 0;
        pointer.targetY = 0;
      }
    };
    document.addEventListener('mouseout', onPointerLeave);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 768 ? 1.0 : 1.25));
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let visible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    /* ---------------- Animation ---------------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let smoothScroll = clamp01(scrollRef.current);
    let pointerX = 0;
    let pointerY = 0;
    let planetPointerX = 0;
    let planetPointerY = 0;
    // Cursor-driven spin: a second easing stage on top of the smoothed pointer,
    // so the planet has weight and lags the cursor like a massive body.
    let spinX = 0;
    let spinY = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;

      const time = clock.getElapsedTime();
      smoothScroll = lerp(smoothScroll, clamp01(scrollRef.current), reducedMotion ? 1 : 0.065);
      const s = smoothScroll;
      pointerX = lerp(pointerX, pointer.targetX, reducedMotion ? 1 : 0.035);
      pointerY = lerp(pointerY, pointer.targetY, reducedMotion ? 1 : 0.035);

      // Cursor right/up turns the visible surface toward the cursor.
      // Amplitude is small (about 9 degrees horizontally, 5 vertically).
      const targetSpinY = pointerX * (isMobile ? 0.10 : 0.16);
      const targetSpinX = -pointerY * (isMobile ? 0.05 : 0.09);
      spinY = lerp(spinY, targetSpinY, reducedMotion ? 1 : 0.03);
      spinX = lerp(spinX, targetSpinX, reducedMotion ? 1 : 0.03);

      // Planet turns slowly under a fixed sun; clouds drift a little faster.
      planet.rotation.y = time * 0.004 + s * 0.1 + spinY;
      planet.rotation.x = spinX;
      // Clouds sit higher above the surface, so they shift slightly more.
      cloudShell.rotation.y = time * 0.006 + s * 0.14 + spinY * 1.12;
      cloudShell.rotation.x = spinX * 1.12;
      // Atmospheric dust drifts independently from the surface.
      smoke.position.x =
        0.15 +
        Math.sin(time * 0.045) * 0.045 +
        pointerX * 0.035;

      smoke.position.y =
        0.15 +
        Math.cos(time * 0.038) * 0.028 +
        pointerY * 0.025;

      smoke.material.opacity =
        (isMobile ? 0.20 : 0.27) +
        Math.sin(time * 0.32) * 0.012;
      planet.updateMatrixWorld(true);
      planetMaterial.uniforms.uRot.value.setFromMatrix4(planet.matrixWorld);

      // ------------------------------------------------------------
      // Subtle cursor-driven planetary parallax.
      // The planet follows the cursor independently from the camera,
      // creating a slow, massive-object feeling rather than a UI effect.
      // ------------------------------------------------------------

      const targetPlanetX = pointerX * (isMobile ? 0.12 : 0.30);
      const targetPlanetY = pointerY * (isMobile ? 0.08 : 0.20);

      planetPointerX = lerp(
        planetPointerX,
        targetPlanetX,
        reducedMotion ? 1 : 0.025
      );

      planetPointerY = lerp(
        planetPointerY,
        targetPlanetY,
        reducedMotion ? 1 : 0.025
      );

      planetRoot.position.x =
        0.25 +
        planetPointerX;

      planetRoot.position.y =
        -6.75 +
        planetPointerY;
      // Slow camera push, no game-style camera moves.
      const approach = smoothstep(0, 0.72, s);
      camera.position.set(
        lerp(0, 0.22, approach) + pointerX * 0.12,
        lerp(0.72, -0.05, approach) + pointerY * 0.06,
        lerp(16.8, 13.2, approach)
      );
      camera.lookAt(lerp(0, 0.12, approach), lerp(-1.2, -1.85, approach), -1.0);

      moonFar.group.position.set(-4.2 + Math.sin(time * 0.01) * 0.22, 4.25 + Math.cos(time * 0.01) * 0.08, -17);
      moonMid.group.position.set(-5.5 + Math.sin(time * 0.006) * 0.34, 2.1 + Math.cos(time * 0.006) * 0.12, -13);
      moonRight.group.position.set(3.7 + Math.cos(time * 0.009) * 0.2, 4.2 + Math.sin(time * 0.009) * 0.07, -15);
      moonFar.mesh.rotation.y = time * 0.006;
      moonMid.mesh.rotation.y = time * 0.004;
      moonRight.mesh.rotation.y = time * 0.008;

      // Star: faint granulation drift and a barely perceptible flicker.
      star.material.rotation = time * 0.004;
      const flicker = 1 + Math.sin(time * 0.7) * 0.004 + Math.sin(time * 1.9) * 0.002;
      star.scale.set(STAR_SIZE * flicker, STAR_SIZE * flicker, 1);

      starMaterial.uniforms.uTime.value = time;
      starfield.rotation.y = time * 0.00045;
      starfield.position.set(pointerX * 0.1, pointerY * 0.05, 0);
      nebula.position.x = 2 + pointerX * 0.12;

      // Fade only at the very end of the hero.
      const fade = 1 - smoothstep(0.91, 1.0, s);
      planetMaterial.uniforms.uFade.value = fade;
      cloudMaterial.uniforms.uFade.value = fade;
      atmosphereMaterial.uniforms.uFade.value = fade;
      star.material.opacity = fade;
      smoke.material.opacity =
        ((isMobile ? 0.20 : 0.27) +
          Math.sin(time * 0.32) * 0.012) * fade;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseout', onPointerLeave);
      window.removeEventListener('resize', onResize);

      planetGeometry.dispose();
      planetMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      cloudTexture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      smokeTexture.dispose();
      smokeMaterial.dispose();
      for (const m of [moonFar, moonMid, moonRight]) {
        m.geometry.dispose();
        m.material.dispose();
      }
      starTexture.dispose();
      star.material.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaTexture.dispose();
      nebula.material.dispose();
      renderer.dispose();
      renderer.domElement.parentElement?.removeChild(renderer.domElement);
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
        pointerEvents: 'none',
      }}
    />
  );
};

export default KeplerHeroScene;