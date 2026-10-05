import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

interface KeplerHeroSceneProps {
  scrollProgress?: number;
}

/* ============================================================
   PROCEDURAL TEXTURE GENERATION FOR KEPLER-186F
   - Recreates the exact exoplanet visuals:
     * Deep magenta, crimson, violet, and dark plum alien crust
     * Massive branching dark tectonic rift valleys & fractures
     * Prominent impact crater with frosty rim on upper-left
     * Swirling white & icy-cyan polar ice caps and cloud vortexes
     * Corresponding high-depth bump/normal map
     * Dynamic atmospheric cloud layer
   ============================================================ */

function createKeplerProceduralTextures(): {
  albedo: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  clouds: THREE.CanvasTexture;
} {
  const W = 2048;
  const H = 1024;

  // 1. Albedo Canvas
  const canvasA = document.createElement('canvas');
  canvasA.width = W;
  canvasA.height = H;
  const ctxA = canvasA.getContext('2d')!;

  // 2. Bump Canvas
  const canvasB = document.createElement('canvas');
  canvasB.width = W;
  canvasB.height = H;
  const ctxB = canvasB.getContext('2d')!;

  // 3. Clouds Canvas
  const canvasC = document.createElement('canvas');
  canvasC.width = W;
  canvasC.height = H;
  const ctxC = canvasC.getContext('2d')!;

  /* --- STEP 1: BASE TERRAIN PALETTE (WARM ALIEN RED / DEEP CRIMSON / RUST) --- */
  // Base cosmic red gradients
  const baseGrad = ctxA.createLinearGradient(0, 0, 0, H);
  baseGrad.addColorStop(0.0, '#32060b'); // North polar deep ruby
  baseGrad.addColorStop(0.16, '#7e0e18'); // Sub-polar crimson
  baseGrad.addColorStop(0.38, '#b81c26'); // Northern vibrant red highlands
  baseGrad.addColorStop(0.55, '#9a1622'); // Continental warm red plateau
  baseGrad.addColorStop(0.74, '#6e0d16'); // Southern deep ruby-rust
  baseGrad.addColorStop(1.0, '#260408'); // South polar basin
  ctxA.fillStyle = baseGrad;
  ctxA.fillRect(0, 0, W, H);

  // Bump neutral gray
  ctxB.fillStyle = '#828282';
  ctxB.fillRect(0, 0, W, H);

  // Clouds transparent base
  ctxC.clearRect(0, 0, W, H);

  // Pseudo-random deterministic noise generator
  let seed = 42;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  /* --- STEP 2: CONTINENTAL LANDMASSES, VOLCANIC PROVINCES & MOUNTAINS --- */
  for (let i = 0; i < 110; i++) {
    const cx = random() * W;
    const cy = random() * H;
    const radX = 70 + random() * 280;
    const radY = 40 + random() * 180;
    const rot = random() * Math.PI;

    const shades = [
      'rgba(225, 38, 48, 0.50)',  // Vibrant alien red
      'rgba(185, 22, 32, 0.55)',  // Deep crimson
      'rgba(140, 14, 22, 0.60)',  // Volcanic iron red
      'rgba(175, 52, 28, 0.45)',  // Rust red & terracotta mineral patch
      'rgba(245, 68, 75, 0.35)',  // Bright scarlet highland peaks
      'rgba(95, 10, 16, 0.65)',   // Basalt lowlands
    ];

    ctxA.save();
    ctxA.translate(cx, cy);
    ctxA.rotate(rot);
    const grad = ctxA.createRadialGradient(0, 0, 0, 0, 0, radX);
    grad.addColorStop(0.0, shades[Math.floor(random() * shades.length)]);
    grad.addColorStop(0.65, shades[Math.floor(random() * shades.length)]);
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctxA.fillStyle = grad;
    ctxA.beginPath();
    ctxA.ellipse(0, 0, radX, radY, 0, 0, Math.PI * 2);
    ctxA.fill();
    ctxA.restore();

    // High-contrast elevation in bump map for crisp tactile relief
    ctxB.save();
    ctxB.translate(cx, cy);
    ctxB.rotate(rot);
    const bumpG = ctxB.createRadialGradient(0, 0, 0, 0, 0, radX);
    const bumpVal = random() > 0.45 ? 'rgba(185, 185, 185, 0.35)' : 'rgba(75, 75, 75, 0.35)';
    bumpG.addColorStop(0.0, bumpVal);
    bumpG.addColorStop(1.0, 'rgba(130, 130, 130, 0)');
    ctxB.fillStyle = bumpG;
    ctxB.beginPath();
    ctxB.ellipse(0, 0, radX, radY, 0, 0, Math.PI * 2);
    ctxB.fill();
    ctxB.restore();
  }

  // Draw Mountain Ridges (highland spine features)
  for (let m = 0; m < 12; m++) {
    const startX = random() * W;
    const startY = H * 0.2 + random() * (H * 0.6);
    const angle = random() * Math.PI * 2;
    const len = 120 + random() * 260;

    ctxA.save();
    ctxA.strokeStyle = 'rgba(255, 110, 120, 0.45)';
    ctxA.lineWidth = 4 + random() * 6;
    ctxA.beginPath();
    ctxA.moveTo(startX, startY);
    for (let s = 1; s <= 8; s++) {
      const px = startX + Math.cos(angle) * (len * (s / 8)) + (random() - 0.5) * 20;
      const py = startY + Math.sin(angle) * (len * (s / 8)) + (random() - 0.5) * 20;
      ctxA.lineTo(px, py);
    }
    ctxA.stroke();
    ctxA.restore();

    // Bump map mountain ridge
    ctxB.save();
    ctxB.strokeStyle = 'rgba(235, 235, 235, 0.7)';
    ctxB.lineWidth = 6 + random() * 8;
    ctxB.beginPath();
    ctxB.moveTo(startX, startY);
    for (let s = 1; s <= 8; s++) {
      const px = startX + Math.cos(angle) * (len * (s / 8)) + (random() - 0.5) * 20;
      const py = startY + Math.sin(angle) * (len * (s / 8)) + (random() - 0.5) * 20;
      ctxB.lineTo(px, py);
    }
    ctxB.stroke();
    ctxB.restore();
  }

  /* --- STEP 3: THE SIGNATURE TECTONIC RIFT VALLEYS & FRACTURES --- */
  // Function to draw jagged tectonic rifts with deep shadow and rim highlights
  const drawTectonicChasm = (
    points: Array<[number, number]>,
    baseWidth: number,
    isMajorRift = true
  ) => {
    // Generate jagged subdivided path
    const jagged: Array<[number, number]> = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const segs = 14;
      for (let s = 0; s < segs; s++) {
        const t = s / segs;
        const x = p0[0] + (p1[0] - p0[0]) * t;
        const y = p0[1] + (p1[1] - p0[1]) * t;
        // Perpendicular displacement for tectonic fracturing
        const dx = p1[0] - p0[0];
        const dy = p1[1] - p0[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const jitter = (random() - 0.5) * (baseWidth * 0.95);
        jagged.push([x + nx * jitter, y + ny * jitter]);
      }
    }
    jagged.push(points[points.length - 1]);

    const buildPath = () => {
      const path = new Path2D();
      path.moveTo(jagged[0][0], jagged[0][1]);
      for (let j = 1; j < jagged.length; j++) {
        path.lineTo(jagged[j][0], jagged[j][1]);
      }
      return path;
    };

    const path = buildPath();

    // 1. Canyon outer drop-shadow / gorge walls
    ctxA.save();
    ctxA.lineCap = 'round';
    ctxA.lineJoin = 'bevel';
    ctxA.strokeStyle = 'rgba(18, 3, 8, 0.96)';
    ctxA.lineWidth = baseWidth * 1.8;
    ctxA.stroke(path);

    // 2. Chasm abyssal floor (pure deep darkness)
    ctxA.strokeStyle = 'rgba(4, 0, 2, 1.0)';
    ctxA.lineWidth = baseWidth * 0.95;
    ctxA.stroke(path);

    // 3. Sunlit tectonic cliff rim (crimson/ochre highlight)
    if (isMajorRift) {
      ctxA.save();
      ctxA.strokeStyle = 'rgba(235, 120, 140, 0.65)';
      ctxA.lineWidth = Math.max(1.8, baseWidth * 0.28);
      ctxA.translate(-baseWidth * 0.45, -baseWidth * 0.35);
      ctxA.stroke(path);
      ctxA.restore();
    }
    ctxA.restore();

    // 4. Bump Map: Abyss is pitch black, rim is raised white
    ctxB.save();
    ctxB.lineCap = 'round';
    ctxB.lineJoin = 'bevel';
    // Sunken abyss
    ctxB.strokeStyle = 'rgba(0, 0, 0, 1.0)';
    ctxB.lineWidth = baseWidth * 1.5;
    ctxB.stroke(path);
    // Raised cliff rim
    if (isMajorRift) {
      ctxB.strokeStyle = 'rgba(245, 245, 245, 0.85)';
      ctxB.lineWidth = Math.max(2.0, baseWidth * 0.35);
      ctxB.translate(-baseWidth * 0.5, -baseWidth * 0.4);
      ctxB.stroke(path);
    }
    ctxB.restore();

    // 5. Generate tributary hairline cracks branching out organically
    if (isMajorRift) {
      const branches = 18;
      for (let b = 0; b < branches; b++) {
        const idx = Math.floor(random() * (jagged.length - 1));
        const root = jagged[idx];
        const angle = random() * Math.PI * 2;
        const bLen = 25 + random() * 95;
        const branchPts: Array<[number, number]> = [root];
        const subSteps = 6;
        let curX = root[0];
        let curY = root[1];
        for (let k = 1; k <= subSteps; k++) {
          const stepDist = bLen / subSteps;
          curX += Math.cos(angle + (random() - 0.5) * 0.8) * stepDist;
          curY += Math.sin(angle + (random() - 0.5) * 0.8) * stepDist;
          branchPts.push([curX, curY]);
        }
        drawTectonicChasm(branchPts, Math.max(1.2, baseWidth * 0.25), false);
      }
    }
  };

  /* --- DEFINING THE EXACT RIFT SYSTEM FROM THE REFERENCE IMAGE --- */
  // Rift 1: Upper-Northern Fracture curving from polar edge to central node
  drawTectonicChasm(
    [
      [W * 0.34, H * 0.24],
      [W * 0.42, H * 0.27],
      [W * 0.48, H * 0.34],
      [W * 0.52, H * 0.40],
    ],
    16
  );

  // Rift 2: Major Central Abyssal Chasm (the huge central canyon cutting down the planet face)
  drawTectonicChasm(
    [
      [W * 0.52, H * 0.40],
      [W * 0.49, H * 0.48],
      [W * 0.47, H * 0.58],
      [W * 0.46, H * 0.70],
      [W * 0.49, H * 0.82],
      [W * 0.47, H * 0.94],
    ],
    22
  );

  // Rift 3: Great Eastern Rift Valley (branching diagonally across the eastern continent)
  drawTectonicChasm(
    [
      [W * 0.52, H * 0.40],
      [W * 0.60, H * 0.45],
      [W * 0.72, H * 0.52],
      [W * 0.84, H * 0.59],
      [W * 0.94, H * 0.66],
    ],
    20
  );

  // Rift 4: Secondary Western Fault line
  drawTectonicChasm(
    [
      [W * 0.48, H * 0.54],
      [W * 0.41, H * 0.58],
      [W * 0.35, H * 0.65],
      [W * 0.30, H * 0.74],
    ],
    12
  );

  // Rift 5: North-Eastern Ridge Fracture
  drawTectonicChasm(
    [
      [W * 0.62, H * 0.28],
      [W * 0.70, H * 0.34],
      [W * 0.80, H * 0.38],
    ],
    10
  );

  /* --- STEP 4: PROMINENT IMPACT CRATERS --- */
  // The iconic crater seen on the upper-left of Kepler-186f
  const drawImpactCrater = (
    cx: number,
    cy: number,
    rad: number,
    hasWhiteFrost = true
  ) => {
    // Albedo crater
    ctxA.save();
    // Inner floor
    const floorG = ctxA.createRadialGradient(cx, cy, 0, cx, cy, rad);
    floorG.addColorStop(0.0, 'rgba(42, 8, 20, 0.9)');
    floorG.addColorStop(0.72, 'rgba(25, 4, 12, 0.95)');
    floorG.addColorStop(1.0, 'rgba(80, 16, 36, 0.8)');
    ctxA.fillStyle = floorG;
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad, 0, Math.PI * 2);
    ctxA.fill();

    // Raised white/ice frost rim
    ctxA.lineWidth = Math.max(2.5, rad * 0.22);
    ctxA.strokeStyle = hasWhiteFrost
      ? 'rgba(240, 248, 255, 0.88)'
      : 'rgba(215, 120, 145, 0.75)';
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad, 0, Math.PI * 2);
    ctxA.stroke();

    // Central rebound peak
    ctxA.fillStyle = 'rgba(245, 235, 245, 0.95)';
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad * 0.18, 0, Math.PI * 2);
    ctxA.fill();
    ctxA.restore();

    // Bump crater
    ctxB.save();
    // Sunken bowl
    const bumpBowl = ctxB.createRadialGradient(cx, cy, 0, cx, cy, rad);
    bumpBowl.addColorStop(0.0, 'rgba(50, 50, 50, 0.8)');
    bumpBowl.addColorStop(0.85, 'rgba(10, 10, 10, 0.9)');
    bumpBowl.addColorStop(1.0, 'rgba(128, 128, 128, 0.0)');
    ctxB.fillStyle = bumpBowl;
    ctxB.beginPath();
    ctxB.arc(cx, cy, rad, 0, Math.PI * 2);
    ctxB.fill();

    // Raised rim
    ctxB.lineWidth = Math.max(3.0, rad * 0.24);
    ctxB.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctxB.beginPath();
    ctxB.arc(cx, cy, rad, 0, Math.PI * 2);
    ctxB.stroke();

    // Peak
    ctxB.fillStyle = 'rgba(230, 230, 230, 0.9)';
    ctxB.beginPath();
    ctxB.arc(cx, cy, rad * 0.2, 0, Math.PI * 2);
    ctxB.fill();
    ctxB.restore();
  };

  // Great Volcanic Shield Caldera (prominent Martian/Keplerian volcanic province)
  const drawShieldCaldera = (cx: number, cy: number, rad: number) => {
    // Albedo: Volcanic shield flanks, dark basalt caldera floor & glowing vent
    ctxA.save();
    const flankG = ctxA.createRadialGradient(cx, cy, rad * 0.25, cx, cy, rad * 1.7);
    flankG.addColorStop(0.0, 'rgba(75, 10, 18, 0.95)');
    flankG.addColorStop(0.35, 'rgba(165, 24, 34, 0.85)');
    flankG.addColorStop(0.75, 'rgba(225, 48, 58, 0.45)');
    flankG.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctxA.fillStyle = flankG;
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad * 1.7, 0, Math.PI * 2);
    ctxA.fill();

    // Sunken caldera floor
    ctxA.fillStyle = '#1c0308';
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad, 0, Math.PI * 2);
    ctxA.fill();

    // Raised caldera rim fault scarp
    ctxA.strokeStyle = 'rgba(255, 140, 150, 0.85)';
    ctxA.lineWidth = 4;
    ctxA.stroke();

    // Inner fault ring
    ctxA.strokeStyle = 'rgba(220, 90, 105, 0.7)';
    ctxA.lineWidth = 2;
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad * 0.55, 0, Math.PI * 2);
    ctxA.stroke();

    // Glowing volcanic magma throat
    ctxA.fillStyle = 'rgba(255, 125, 45, 0.9)';
    ctxA.beginPath();
    ctxA.arc(cx, cy, rad * 0.18, 0, Math.PI * 2);
    ctxA.fill();
    ctxA.restore();

    // Bump map: High volcanic cone with deeply sunken central caldera
    ctxB.save();
    const bumpFlank = ctxB.createRadialGradient(cx, cy, rad, cx, cy, rad * 1.7);
    bumpFlank.addColorStop(0.0, 'rgba(240, 240, 240, 0.92)');
    bumpFlank.addColorStop(1.0, 'rgba(128, 128, 128, 0.0)');
    ctxB.fillStyle = bumpFlank;
    ctxB.beginPath();
    ctxB.arc(cx, cy, rad * 1.7, 0, Math.PI * 2);
    ctxB.fill();

    // High caldera rim
    ctxB.strokeStyle = '#ffffff';
    ctxB.lineWidth = 5;
    ctxB.beginPath();
    ctxB.arc(cx, cy, rad, 0, Math.PI * 2);
    ctxB.stroke();

    // Sunken caldera pit
    ctxB.fillStyle = '#141414';
    ctxB.beginPath();
    ctxB.arc(cx, cy, rad * 0.9, 0, Math.PI * 2);
    ctxB.fill();
    ctxB.restore();
  };

  // Primary iconic crater on upper-left continent
  drawImpactCrater(W * 0.38, H * 0.37, 36, true);
  // Great Shield Caldera near the central tectonic rift
  drawShieldCaldera(W * 0.55, H * 0.44, 42);
  // Secondary Shield Volcano in southern highlands
  drawShieldCaldera(W * 0.72, H * 0.62, 30);

  // Secondary impact crater fields
  drawImpactCrater(W * 0.32, H * 0.44, 18, true);
  drawImpactCrater(W * 0.43, H * 0.52, 14, false);
  drawImpactCrater(W * 0.65, H * 0.36, 22, false);
  drawImpactCrater(W * 0.58, H * 0.68, 16, false);
  drawImpactCrater(W * 0.78, H * 0.32, 20, false);
  drawImpactCrater(W * 0.84, H * 0.54, 25, false);
  drawImpactCrater(W * 0.48, H * 0.82, 19, false);

  /* --- STEP 5: POLAR FROST & SWIRLING CLOUD VORTEXES --- */
  // White & icy-cyan polar ice sheet along upper latitudes
  const polarGrad = ctxA.createLinearGradient(0, 0, 0, H * 0.25);
  polarGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.92)');
  polarGrad.addColorStop(0.45, 'rgba(205, 242, 255, 0.75)');
  polarGrad.addColorStop(0.85, 'rgba(160, 225, 250, 0.35)');
  polarGrad.addColorStop(1.0, 'rgba(120, 200, 240, 0.0)');

  ctxA.fillStyle = polarGrad;
  ctxA.fillRect(0, 0, W, H * 0.28);

  // Swirling polar ice storm filament details on Albedo & Clouds
  for (let c = 0; c < 45; c++) {
    const cx = random() * W;
    const cy = random() * (H * 0.32);
    const radius = 35 + random() * 140;

    const cloudG = ctxC.createRadialGradient(cx, cy, 0, cx, cy, radius);
    cloudG.addColorStop(0.0, 'rgba(255, 255, 255, 0.75)');
    cloudG.addColorStop(0.5, 'rgba(215, 245, 255, 0.45)');
    cloudG.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctxC.fillStyle = cloudG;
    ctxC.beginPath();
    ctxC.ellipse(cx, cy, radius * (0.8 + random() * 0.6), radius * 0.5, random() * Math.PI, 0, Math.PI * 2);
    ctxC.fill();
  }

  // Atmospheric cloud ribbons across the temperate zones
  for (let c = 0; c < 35; c++) {
    const cx = random() * W;
    const cy = H * 0.25 + random() * (H * 0.65);
    const radius = 60 + random() * 220;

    const cloudG = ctxC.createRadialGradient(cx, cy, 0, cx, cy, radius);
    cloudG.addColorStop(0.0, 'rgba(255, 255, 255, 0.35)');
    cloudG.addColorStop(0.6, 'rgba(220, 245, 255, 0.15)');
    cloudG.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

    ctxC.fillStyle = cloudG;
    ctxC.beginPath();
    ctxC.ellipse(cx, cy, radius, radius * 0.3, (random() - 0.5) * 0.4, 0, Math.PI * 2);
    ctxC.fill();
  }

  /* --- CONVERT CANVASES TO THREE.JS TEXTURES --- */
  const albedoTexture = new THREE.CanvasTexture(canvasA);
  albedoTexture.colorSpace = THREE.SRGBColorSpace;
  albedoTexture.wrapS = THREE.RepeatWrapping;
  albedoTexture.wrapT = THREE.ClampToEdgeWrapping;

  const bumpTexture = new THREE.CanvasTexture(canvasB);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

  const cloudsTexture = new THREE.CanvasTexture(canvasC);
  cloudsTexture.colorSpace = THREE.SRGBColorSpace;
  cloudsTexture.wrapS = THREE.RepeatWrapping;
  cloudsTexture.wrapT = THREE.ClampToEdgeWrapping;

  return {
    albedo: albedoTexture,
    bump: bumpTexture,
    clouds: cloudsTexture,
  };
}

/* ============================================================
   KEPLER HERO SCENE COMPONENT
   ============================================================ */

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
       - Deep cosmic void with rich atmospheric red fog
       ============================================================ */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0205);
    scene.fog = new THREE.FogExp2(0x180307, 0.014);

    /* ============================================================
       CAMERA
       ============================================================ */
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    // Initial camera position gives the exact composition of the reference photo
    camera.position.set(0, 0.4, 13.8);
    camera.lookAt(0.3, -0.4, 0);

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
       - Decreased strength & higher threshold for sleek, refined glow
       ============================================================ */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      isMobile ? 0.45 : 0.65, // decreased glow strength
      0.32,                   // tighter bloom radius
      0.82                    // higher threshold so only hottest star core blooms
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
       PROCEDURAL TEXTURES FOR KEPLER-186F
       ============================================================ */
    const { albedo, bump, clouds } = createKeplerProceduralTextures();
    track(albedo);
    track(bump);
    track(clouds);

    /* ============================================================
       STAR & SUNLIGHT POSITION (TOP-LEFT CORNER AS IN REFERENCE)
       ============================================================ */
    // Top-left corner of space
    const STAR_POSITION = new THREE.Vector3(-8.8, 6.2, -6.0);
    const sunLightDir = new THREE.Vector3().subVectors(STAR_POSITION, new THREE.Vector3(0.5, -2.2, 0)).normalize();

    /* ============================================================
       1. KEPLER-186F PLANET ROOT & SPHERE
       ============================================================ */
    const PLANET_RADIUS = 5.8;
    const planetRoot = new THREE.Group();
    // Positioned so that Kepler-186f dominates the center and lower view
    planetRoot.position.set(0.5, -2.4, 0);
    planetRoot.rotation.z = THREE.MathUtils.degToRad(-24.0); // Axial tilt
    scene.add(planetRoot);

    // Planet Core Mesh with Custom GLSL Shader
    const planetGeo = track(
      new THREE.SphereGeometry(PLANET_RADIUS, isMobile ? 64 : 128, isMobile ? 64 : 128)
    );

    const planetMat = track(
      new THREE.ShaderMaterial({
        transparent: false,
        uniforms: {
          uMap: { value: albedo },
          uBumpMap: { value: bump },
          uSunDir: { value: sunLightDir },
          uCyanRimColor: { value: new THREE.Color(0x3ae7ff) },
          uBumpScale: { value: 0.085 },
          uTime: { value: 0 },
          uAlpha: { value: 1.0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying vec3 vViewDir;

          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            vViewDir = normalize(cameraPosition - worldPos.xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          uniform sampler2D uBumpMap;
          uniform vec3 uSunDir;
          uniform vec3 uCyanRimColor;
          uniform float uBumpScale;
          uniform float uTime;
          uniform float uAlpha;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          // Robust normal perturbation for tectonic rift cliffs without extension dependencies
          vec3 perturbNormal(vec3 surf_norm, vec2 uv) {
            float epsX = 1.0 / 2048.0;
            float epsY = 1.0 / 1024.0;
            float h = texture2D(uBumpMap, uv).r;
            float hR = texture2D(uBumpMap, uv + vec2(epsX, 0.0)).r;
            float hU = texture2D(uBumpMap, uv + vec2(0.0, epsY)).r;

            float dX = (h - hR) * uBumpScale * 45.0;
            float dY = (h - hU) * uBumpScale * 45.0;

            vec3 up = abs(surf_norm.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
            vec3 T = normalize(cross(up, surf_norm));
            vec3 B = cross(surf_norm, T);

            return normalize(surf_norm + T * dX + B * dY);
          }

          void main() {
            vec4 albedoCol = texture2D(uMap, vUv);
            vec3 N = perturbNormal(normalize(vNormal), vUv);
            vec3 V = normalize(vViewDir);
            vec3 L = normalize(uSunDir);

            // Grazing sunlight diffuse with rich red-orange balance
            float NdotL = dot(N, L);
            float directLight = clamp(NdotL * 0.75 + 0.25, 0.0, 1.0);

            // Deep canyon & crater shadowing
            float bumpHeight = texture2D(uBumpMap, vUv).r;
            float chasmDepth = smoothstep(0.18, 0.48, bumpHeight);
            float shadowMultiplier = mix(0.10, 1.0, chasmDepth);

            // Geothermal volcanic fissure glow inside the deepest tectonic chasms
            float fissureMask = (1.0 - smoothstep(0.12, 0.36, bumpHeight)) * (1.0 - albedoCol.r * 0.35);
            vec3 thermalFissure = vec3(1.0, 0.28, 0.08) * fissureMask * 0.85;

            // Warm twilight scattering along the day-night terminator line
            float terminator = smoothstep(-0.25, 0.25, NdotL) * (1.0 - smoothstep(0.02, 0.60, NdotL));
            vec3 twilightColor = vec3(1.0, 0.22, 0.12) * terminator * 1.6;

            // Day surface: rich alien red coloration
            vec3 redBalancedAlbedo = albedoCol.rgb * vec3(1.28, 0.88, 0.82);
            vec3 dayColor = (redBalancedAlbedo * (directLight * 1.35 + 0.12) + thermalFissure) * shadowMultiplier;
            vec3 nightColor = albedoCol.rgb * 0.025 * shadowMultiplier;
            vec3 surface = mix(nightColor, dayColor, smoothstep(-0.15, 0.35, NdotL)) + twilightColor;

            // --- REFINED CYAN ATMOSPHERIC RIM (Decreased glow) ---
            float fresnel = 1.0 - max(dot(V, normalize(vNormal)), 0.0);
            float rimFactor = pow(fresnel, 3.4);
            // Lit side has crisp electric-cyan rim glow
            float sunFacing = clamp(dot(normalize(vNormal), L) * 0.6 + 0.4, 0.0, 1.0);
            vec3 cyanRimGlow = uCyanRimColor * rimFactor * sunFacing * 1.45;

            // Subtle specular reflection on ice caps and smooth mineral basins
            vec3 H = normalize(L + V);
            float spec = pow(max(dot(N, H), 0.0), 32.0) * clamp(NdotL, 0.0, 1.0) * (1.0 - albedoCol.r * 0.35);
            vec3 specHighlight = vec3(1.0, 0.75, 0.85) * spec * 0.55;

            vec3 finalColor = surface + cyanRimGlow + specHighlight;

            // Red cosmic fog atmospheric blend
            float camDist = length(cameraPosition - vWorldPos);
            float fogFactor = clamp((camDist - 8.0) / 48.0, 0.0, 0.45);
            vec3 redFogColor = vec3(0.10, 0.015, 0.03);
            finalColor = mix(finalColor, redFogColor, fogFactor);

            gl_FragColor = vec4(finalColor, uAlpha);
          }
        `,
      })
    );

    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetRoot.add(planetMesh);

    // Dynamic Clouds Mesh (drifting slightly above the surface)
    const cloudsGeo = track(
      new THREE.SphereGeometry(PLANET_RADIUS * 1.014, isMobile ? 48 : 96, isMobile ? 48 : 96)
    );
    const cloudsMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uCloudMap: { value: clouds },
          uSunDir: { value: sunLightDir },
          uTime: { value: 0 },
          uAlpha: { value: 0.85 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uCloudMap;
          uniform vec3 uSunDir;
          uniform float uAlpha;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;

          void main() {
            vec4 cTex = texture2D(uCloudMap, vUv);
            if (cTex.a < 0.02) discard;

            vec3 N = normalize(vNormal);
            vec3 L = normalize(uSunDir);
            float NdotL = clamp(dot(N, L) * 0.7 + 0.3, 0.0, 1.0);

            vec3 dayCloud = cTex.rgb * vec3(1.18, 0.98, 1.02) * NdotL;
            vec3 nightCloud = cTex.rgb * vec3(0.04, 0.015, 0.025);

            vec3 finalCloud = mix(nightCloud, dayCloud, smoothstep(-0.1, 0.25, dot(N, L)));
            gl_FragColor = vec4(finalCloud, cTex.a * uAlpha);
          }
        `,
      })
    );
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    planetRoot.add(cloudsMesh);

    // Glowing Atmospheric Outer Shell (BackSide Additive Rayleigh Scattering)
    const atmosGeo = track(
      new THREE.SphereGeometry(PLANET_RADIUS * 1.036, isMobile ? 48 : 64, isMobile ? 48 : 64)
    );
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

            vec3 L = normalize(uSunDir);
            float sunAlign = max(dot(N, L), 0.0);
            float flare = pow(sunAlign, 1.4) * 1.3 + 0.25;

            // Electric cyan on lit horizon, blending into warm red atmospheric haze
            vec3 cyanColor = vec3(0.18, 0.85, 1.0);
            vec3 redAtmos = vec3(0.85, 0.12, 0.22);
            vec3 atmosColor = mix(redAtmos, cyanColor, pow(sunAlign, 1.3));

            float a = rim * flare * 0.75 * uAlpha;
            gl_FragColor = vec4(atmosColor * a, a);
          }
        `,
      })
    );
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    planetRoot.add(atmosMesh);

    /* ============================================================
       2. THE HOST STAR (KEPLER-186) IN THE TOP-LEFT CORNER
       - White-hot core sphere
       - Sleek Anamorphic Lens Flare Beam (at -28° angle as in photo)
       - Soft optical glow halo
       ============================================================ */
    const starGroup = new THREE.Group();
    starGroup.position.copy(STAR_POSITION);
    scene.add(starGroup);

    // 2.1 Star Core Sphere
    const starCoreGeo = track(new THREE.SphereGeometry(0.72, 32, 32));
    const starCoreMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 1.0 },
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
          varying vec3 vNormal;

          void main() {
            float pulse = sin(uTime * 2.2) * 0.05 + 0.95;
            vec3 core = vec3(1.05, 0.98, 1.0) * pulse;
            gl_FragColor = vec4(core, uAlpha);
          }
        `,
      })
    );
    const starCoreMesh = new THREE.Mesh(starCoreGeo, starCoreMat);
    starGroup.add(starCoreMesh);

    // 2.2 Sleek Anamorphic Lens Flare Beam (Decreased glow for refined aesthetic)
    const flareBeamGeo = track(new THREE.PlaneGeometry(36.0, 2.6));
    const flareBeamMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 1.0 },
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

          void main() {
            vec2 p = vUv - 0.5;

            // Horizontal streak along X: crisp laser core along Y
            float core = exp(-abs(p.y) * 44.0) * exp(-abs(p.x) * 1.6);
            float softHalo = exp(-abs(p.y) * 10.0) * exp(-abs(p.x) * 2.4);
            float centerGlow = exp(-length(p * vec2(1.0, 3.5)) * 14.0);

            // Shimmering micro-scintillation
            float shimmer = sin(uTime * 3.5 + p.x * 20.0) * 0.05 + 0.95;

            vec3 coreCol = vec3(1.0, 0.95, 0.98) * core * 1.6;
            vec3 magentaFlare = vec3(1.0, 0.16, 0.40) * (core * 1.1 + softHalo * 0.7 + centerGlow * 1.3);

            vec3 finalFlare = (coreCol + magentaFlare) * shimmer;
            float a = clamp((core * 1.6 + softHalo * 0.6 + centerGlow * 1.2) * uAlpha, 0.0, 1.0);

            gl_FragColor = vec4(finalFlare * a, a);
          }
        `,
      })
    );
    const flareBeamMesh = new THREE.Mesh(flareBeamGeo, flareBeamMat);
    flareBeamMesh.rotation.z = THREE.MathUtils.degToRad(-28.0);
    starGroup.add(flareBeamMesh);

    // 2.3 Secondary Radial Glow Halo around Star Core
    const starHaloGeo = track(new THREE.PlaneGeometry(7.5, 7.5));
    const starHaloMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 1.0 },
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

          void main() {
            vec2 p = vUv - 0.5;
            float dist = length(p) * 2.0;
            float glow = exp(-dist * 3.4);

            // Subtle optical diffraction rays
            float angle = atan(p.y, p.x);
            float rays = sin(angle * 8.0 + uTime * 0.5) * 0.06 + 0.94;
            glow *= rays;

            vec3 col = mix(vec3(1.0, 0.18, 0.45), vec3(1.0, 0.85, 0.92), glow * 0.7);
            float a = glow * 0.75 * uAlpha;
            gl_FragColor = vec4(col * a, a);
          }
        `,
      })
    );
    const starHaloMesh = new THREE.Mesh(starHaloGeo, starHaloMat);
    starGroup.add(starHaloMesh);

    /* ============================================================
       3. DEEP COSMIC STARFIELD
       ============================================================ */
    const starCount = isMobile ? 600 : 1300;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const starPalettes = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xff859c),
      new THREE.Color(0xffc2d1),
      new THREE.Color(0x9ee8ff),
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 200 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = radius * Math.cos(phi);
      starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const col = starPalettes[Math.floor(Math.random() * starPalettes.length)];
      starColors[i3] = col.r;
      starColors[i3 + 1] = col.g;
      starColors[i3 + 2] = col.b;

      starSizes[i] = 1.0 + Math.random() * 2.2;
    }

    const starGeo = track(new THREE.BufferGeometry());
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
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
            vTwinkle = 0.55 + 0.45 * sin(uTime * 2.0 + seed * 6.28);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * vTwinkle * uPixelRatio * (160.0 / -mv.z);
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
            float a = smoothstep(0.5, 0.05, dist) * 0.9 * uAlpha;
            gl_FragColor = vec4(vColor * vTwinkle, a);
          }
        `,
      })
    );
    const starMesh = new THREE.Points(starGeo, starMat);
    scene.add(starMesh);

    /* ============================================================
       4. INTERACTION STATE & MOUSE PARALLAX
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
        mouse.dragX += dx * 2.2;
        mouse.dragY += dy * 2.2;
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
       ANIMATION LOOP & CINEMATIC SCROLL CHOREOGRAPHY
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
      smoothScroll = lerp(smoothScroll, targetScroll, reducedMotion ? 1 : 0.065);
      const s = smoothScroll;

      // Mouse Parallax & Drag Damping
      mouse.x = lerp(mouse.x, mouse.targetX, 0.06);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.06);
      mouse.dragX *= 0.94;
      mouse.dragY *= 0.94;

      camSmoothX = lerp(camSmoothX, mouse.x * 0.9 + mouse.dragX * 2.8, 0.06);
      camSmoothY = lerp(camSmoothY, mouse.y * 0.6 + mouse.dragY * 1.8, 0.06);

      // Slow stately axial rotation of Kepler-186f
      planetMesh.rotation.y = elapsed * 0.028 + mouse.dragX * 0.8 + s * 1.1;
      // Independent cloud drift across the surface
      cloudsMesh.rotation.y = elapsed * 0.035 + mouse.dragX * 0.8 + s * 1.15;

      // Star & Flare Billboarding towards camera
      flareBeamMesh.lookAt(camera.position);
      flareBeamMesh.rotation.z = THREE.MathUtils.degToRad(-28.0) + (mouse.x * 0.04);
      starHaloMesh.lookAt(camera.position);

      // Update shader uniforms
      planetMat.uniforms.uTime.value = elapsed;
      cloudsMat.uniforms.uTime.value = elapsed;
      starCoreMat.uniforms.uTime.value = elapsed;
      flareBeamMat.uniforms.uTime.value = elapsed;
      starHaloMat.uniforms.uTime.value = elapsed;
      starMat.uniforms.uTime.value = elapsed;

      /* ============================================================
         CINEMATIC CAMERA CHOREOGRAPHY ACROSS SCROLL
         - At scroll = 0: Perfect framing matching reference image
         - As scroll -> 1: Dramatic push-in towards the grand tectonic
           chasm and glowing cyan limb of Kepler-186f!
         ============================================================ */
      const camZ = lerp(13.8, 7.2, s);
      const camX = lerp(0.0, 1.4, s) + camSmoothX;
      const camY = lerp(0.4, -0.6, s) + camSmoothY;

      camera.position.set(camX, camY, camZ);

      // Camera look target tracks the grand tectonic rift valley
      const targetLookX = lerp(0.3, 0.8, s) + (camSmoothX * 0.3);
      const targetLookY = lerp(-0.4, -1.2, s) + (camSmoothY * 0.3);
      camera.lookAt(targetLookX, targetLookY, 0);

      // Subtle roll banking on horizontal parallax
      camera.rotation.z = -mouse.x * 0.025;

      // Soft overall scene fade at very bottom of hero for seamless handoff
      const sceneAlpha = 1.0 - Math.pow(Math.max(0, (s - 0.88) / 0.12), 2.0);
      planetMat.uniforms.uAlpha.value = sceneAlpha;
      cloudsMat.uniforms.uAlpha.value = sceneAlpha * 0.85;
      atmosMat.uniforms.uAlpha.value = sceneAlpha;
      starCoreMat.uniforms.uAlpha.value = sceneAlpha;
      flareBeamMat.uniforms.uAlpha.value = sceneAlpha;
      starHaloMat.uniforms.uAlpha.value = sceneAlpha;
      starMat.uniforms.uAlpha.value = sceneAlpha;

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
