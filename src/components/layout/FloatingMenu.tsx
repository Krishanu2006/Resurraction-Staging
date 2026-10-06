import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import * as THREE from 'three';
import {
  X,
  Compass,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useScrollSection } from '../../hooks/useScrollSection';
import { Button } from '../ui/button';

const NAV_ITEMS = [
  { id: 'about', label: 'About', num: '01', href: '#about', desc: 'Mission & Vision' },
  { id: 'tracks', label: 'Tracks', num: '02', href: '#tracks', desc: 'Themes & Challenges' },
  { id: 'prize', label: 'Prizes', num: '03', href: '#prize', desc: 'Bounties & Rewards' },
  { id: 'timeline', label: 'Timeline', num: '04', href: '#timeline', desc: 'Schedule & Rounds' },
  { id: 'sponsors', label: 'Partners', num: '05', href: '#sponsors', desc: 'Allies & Backers' },
  { id: 'organizers', label: 'Jury', num: '06', href: '#organizers', desc: 'Judges & Mentors' },
  { id: 'rules', label: 'Rules', num: '07', href: '#rules', desc: 'Protocol & Conduct' },
  { id: 'faq', label: 'FAQ', num: '08', href: '#faq', desc: 'Briefing & Answers' },
];

/* ============================================================
   THREE.JS 3D ANIMATED MENU ORB
   ============================================================ */
interface Menu3DOrbProps {
  isOpen: boolean;
  isHovered: boolean;
}

const Menu3DOrb: React.FC<Menu3DOrbProps> = ({ isOpen, isHovered }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ isOpen, isHovered });
  stateRef.current = { isOpen, isHovered };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 38;
    const height = 38;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(renderer.domElement);

    // Dynamic color resolution from CSS variable or fallback
    const getAccentColor = () => {
      const cssVal = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-accent')
        .trim();
      return cssVal ? new THREE.Color(cssVal) : new THREE.Color(0xf97316);
    };

    const getPrimaryColor = () => {
      const cssVal = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-primary')
        .trim();
      return cssVal ? new THREE.Color(cssVal) : new THREE.Color(0x22c55e);
    };

    const accentColor = getAccentColor();
    const primaryColor = getPrimaryColor();

    // 1. Core: Glowing wireframe icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(0.78, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Inner solid core node
    const innerNodeGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const innerNodeMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.95,
    });
    const innerNode = new THREE.Mesh(innerNodeGeo, innerNodeMat);
    scene.add(innerNode);

    // 2. Gimbal Outer Ring 1
    const ring1Geo = new THREE.TorusGeometry(1.22, 0.045, 12, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    // 3. Gimbal Outer Ring 2 (Orthogonal)
    const ring2Geo = new THREE.TorusGeometry(1.36, 0.035, 12, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.65,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // 4. Swirling constellation particles
    const particleCount = 42;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 1.05 + Math.random() * 0.55;
      particlePositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = rad * Math.cos(phi);
      particleScales[i] = 0.5 + Math.random() * 0.8;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: accentColor,
      size: 1.8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation loop
    let animId = 0;
    let clock = new THREE.Clock();
    let currentSpeed = 1.0;
    let targetScale = 1.0;
    let currentScale = 1.0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const { isOpen: open, isHovered: hovered } = stateRef.current;

      // Speed transition
      const targetSpeed = open ? 3.2 : hovered ? 2.4 : 1.0;
      currentSpeed += (targetSpeed - currentSpeed) * (delta * 6.0);

      // Scale transition
      targetScale = open ? 1.18 : hovered ? 1.08 : 1.0;
      currentScale += (targetScale - currentScale) * (delta * 8.0);
      core.scale.setScalar(currentScale);
      ring1.scale.setScalar(currentScale);
      ring2.scale.setScalar(currentScale);

      // Rotations
      core.rotation.x += delta * 1.2 * currentSpeed;
      core.rotation.y += delta * 1.6 * currentSpeed;

      ring1.rotation.x += delta * 0.9 * currentSpeed;
      ring1.rotation.z += delta * 1.4 * currentSpeed;

      ring2.rotation.y += delta * 1.5 * currentSpeed;
      ring2.rotation.z -= delta * 0.8 * currentSpeed;

      particles.rotation.y -= delta * 0.7 * currentSpeed;
      particles.rotation.x += delta * 0.4 * currentSpeed;

      // Gentle breathing pulse on inner node
      const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.15;
      innerNode.scale.setScalar(pulse * (open ? 1.3 : 1.0));

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerNodeGeo.dispose();
      innerNodeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

/* ============================================================
   FLOATING MENU COMPONENT
   ============================================================ */
export const FloatingMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const activeSection = useScrollSection(
    NAV_ITEMS.map((item) => item.id),
    140
  );

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Delay slightly to avoid triggering on the opening click
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  const handleNavClick = useCallback((href: string) => {
    setOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div ref={menuRef}>
      {/* ---------------- Top-Left Brand Logo ---------------- */}
      <a
        href="#hero"
        aria-label="RESURRACTION home"
        className="fixed top-6 left-6 z-50 flex items-center gap-3 px-3.5 py-2 rounded-full border transition-all duration-300 hover:scale-105"
        style={{
          background: 'color-mix(in srgb, var(--theme-surface) 75%, rgba(6, 8, 14, 0.75))',
          borderColor: 'color-mix(in srgb, var(--theme-border) 65%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        }}
      >
        <img
          src="/assets/brand/resurraction-logo.png"
          alt="RESURRACTION"
          style={{ height: 22, width: 'auto' }}
        />
        <span
          className="hidden sm:inline-block font-mono text-[10px] tracking-[0.2em] uppercase font-bold opacity-80"
          style={{ color: 'var(--theme-accent)' }}
        >
          2026
        </span>
      </a>

      {/* ---------------- Navigation HUD Modal / Overlay ---------------- */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-0 z-[990] flex items-end sm:items-center justify-center p-4 sm:p-6 transition-all duration-300"
          style={{
            background: 'rgba(2, 4, 10, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="w-full max-w-xl rounded-2xl sm:rounded-3xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95"
            style={{
              background: 'color-mix(in srgb, var(--theme-surface) 92%, rgba(5, 7, 14, 0.95))',
              borderColor: 'color-mix(in srgb, var(--theme-accent) 40%, var(--theme-border))',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px color-mix(in srgb, var(--theme-accent) 20%, transparent)',
              marginBottom: '76px', // Leaves breathing room above the floating button
            }}
          >
            {/* Header / Mission telemetry */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[var(--theme-accent)] animate-spin-slow" />
                <span className="font-mono text-xs uppercase tracking-[0.25em] font-bold text-[var(--theme-text)]">
                  Mission Navigation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[var(--theme-muted)] hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links Grid */}
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all duration-200 ${
                      isActive
                        ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                        : 'border-[var(--theme-border)]/60 hover:border-[var(--theme-accent)]/60 bg-white/[0.02] hover:bg-white/[0.06] text-[var(--theme-text)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="font-mono text-[10px] tracking-wider opacity-60 font-semibold"
                        style={{ color: isActive ? 'var(--theme-accent)' : 'var(--theme-muted)' }}
                      >
                        {item.num}
                      </span>
                      <div>
                        <div className="font-mono text-sm uppercase tracking-wider font-bold">
                          {item.label}
                        </div>
                        <div className="text-[10px] opacity-60 font-sans tracking-normal">
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <span
                        className="w-2 h-2 rounded-full bg-[var(--theme-accent)] shadow-[0_0_8px_var(--theme-accent)]"
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 group-hover:opacity-80 transition-opacity text-[var(--theme-accent)]"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Bottom Action Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--theme-border)]/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--theme-muted)]">
                <Sparkles size={13} className="text-[var(--theme-accent)]" />
                <span>RESURRACTION HACKATHON</span>
              </div>
              <Button
                asChild
                size="sm"
                variant="default"
                className="font-mono text-[11px] uppercase tracking-wider font-bold shadow-[var(--theme-glow)]"
                onClick={() => setOpen(false)}
              >
                <a href="#about" className="inline-flex items-center gap-1.5">
                  Explore
                  <ArrowUpRight size={13} />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Floating 3JS Menu Button ---------------- */}
      <aside
        aria-label="Floating Navigation Trigger"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] select-none"
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-expanded={open}
          aria-label={open ? 'Close Menu' : 'Open Menu'}
          className="group relative flex items-center gap-3 pl-2 pr-5 py-1.5 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)]"
          style={{
            background: open
              ? 'color-mix(in srgb, var(--theme-surface) 90%, rgba(12, 16, 28, 0.95))'
              : 'color-mix(in srgb, var(--theme-surface) 82%, rgba(5, 7, 14, 0.88))',
            borderColor: open
              ? 'var(--theme-accent)'
              : 'color-mix(in srgb, var(--theme-accent) 45%, rgba(255, 255, 255, 0.15))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: open
              ? '0 12px 40px rgba(0, 0, 0, 0.75), 0 0 25px color-mix(in srgb, var(--theme-accent) 50%, transparent)'
              : hovered
              ? '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 20px color-mix(in srgb, var(--theme-accent) 35%, transparent)'
              : '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 12px color-mix(in srgb, var(--theme-accent) 20%, transparent)',
          }}
        >
          {/* 3JS Orbiting Astrolabe Orb */}
          <Menu3DOrb isOpen={open} isHovered={hovered} />

          {/* Label */}
          <span className="font-mono text-xs uppercase tracking-[0.25em] font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors">
            {open ? 'CLOSE' : 'MENU'}
          </span>

          {/* Status Indicator Pip */}
          <span
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: open ? '#ef4444' : 'var(--theme-accent)',
              boxShadow: open
                ? '0 0 8px #ef4444'
                : '0 0 8px var(--theme-accent)',
              transform: hovered ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        </button>
      </aside>
    </div>
  );
};
