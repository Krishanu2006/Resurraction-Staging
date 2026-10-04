import React, { useCallback, useEffect, useState } from 'react';

import { Header } from './components/layout/Header';
import HeroSection from './components/hero/HeroSection';

import { AboutSection } from './components/sections/AboutSection';
import { TracksSection } from './components/sections/TracksSection';
import { PrizesSection } from './components/sections/PrizesSection';
import { TimelineSection } from './components/sections/TimelineSection';
import { SponsorsSection } from './components/sections/SponsorsSection';
import { JurySection } from './components/sections/JurySection';
import { RulesSection } from './components/sections/RulesSection';
import { FAQSection } from './components/sections/FAQSection';

import { Footer } from './components/layout/Footer';

import { RockyCursor } from './components/ui/RockyCursor';
import { BootLoader } from './components/ui/BootLoader';
import { ThemeSelector } from './components/ui/ThemeSelector';
import GlobalThemeBackground from './components/ui/GlobalThemeBackground';

import {
  themePalettes,
  type ThemeId,
} from './config/theme';

const App: React.FC = () => {
  /* ============================================================
     BOOT STATE
     ============================================================ */

  const [bootComplete, setBootComplete] =
    useState(false);

  /* ============================================================
     THEME STATE
     ============================================================ */

  const [themeSelected, setThemeSelected] =
    useState(false);

  const [selectedTheme, setSelectedTheme] =
    useState<ThemeId>('tau-ceti');

  /* ============================================================
     BOOT COMPLETE
     ============================================================ */

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  /* ============================================================
     THEME SELECTION
     ============================================================ */

  const handleThemeSelect = useCallback(
    (themeId: ThemeId) => {
      setSelectedTheme(themeId);
      setThemeSelected(true);
    },
    []
  );

  /* ============================================================
     ACTIVE THEME PALETTE
     ============================================================ */

  const palette = themePalettes[selectedTheme] || themePalettes['tau-ceti'];

  /* ============================================================
     APPLY THEME VARIABLES
     ============================================================ */

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute('data-theme', selectedTheme);

    root.style.setProperty('--theme-primary', palette.primary);
    root.style.setProperty('--theme-secondary', palette.secondary);
    root.style.setProperty('--theme-accent', palette.accent);
    root.style.setProperty('--theme-cta', palette.cta);
    root.style.setProperty('--theme-cta-hover', palette.ctaHover);
    root.style.setProperty('--theme-background', palette.background);
    root.style.setProperty('--theme-surface', palette.surface);
    root.style.setProperty('--theme-text', palette.text);
    root.style.setProperty('--theme-muted', palette.muted);
    root.style.setProperty('--theme-border', palette.border);
    root.style.setProperty('--theme-gradient', palette.gradient);
    root.style.setProperty('--theme-glow', palette.glow);
    root.style.setProperty('--theme-glow-color', palette.glowColor);
    root.style.setProperty('--theme-card-bg', palette.cardBg);
    root.style.setProperty('--theme-card-border', palette.cardBorder);

    // Compatibility tokens for design system
    root.style.setProperty('--stellar-cyan', palette.accent);
    root.style.setProperty('--cyan-soft', palette.accent);
    root.style.setProperty('--cosmic-blue', palette.secondary);
    root.style.setProperty('--cosmic-blue-bright', palette.accent);
    root.style.setProperty('--surface-1', palette.cardBg);
    root.style.setProperty('--surface-2', `color-mix(in srgb, ${palette.surface} 80%, ${palette.primary} 20%)`);
    root.style.setProperty('--border-subtle', palette.cardBorder);
    root.style.setProperty('--border-cosmic', palette.border);
    root.style.setProperty('--hairline', palette.cardBorder);
  }, [palette, selectedTheme]);

  /* ============================================================
     APP
     ============================================================ */

  return (
    <>
      {/* ======================================================
          BOOT SEQUENCE
          BootLoader → ThemeSelector → Website
         ====================================================== */}

      {!bootComplete && (
        <BootLoader
          onComplete={handleBootComplete}
        />
      )}

      {/* ======================================================
          THEME SELECTOR
         ====================================================== */}

      {bootComplete && !themeSelected && (
        <ThemeSelector
          onSelect={(themeId) => {
            handleThemeSelect(themeId as ThemeId);
          }}
        />
      )}

      {/* ======================================================
          MAIN WEBSITE
         ====================================================== */}

      {bootComplete && themeSelected && (
        <div
          id="app-theme"
          style={
            {
              '--theme-primary': palette.primary,
              '--theme-secondary': palette.secondary,
              '--theme-accent': palette.accent,
              '--theme-background': palette.background,
              '--theme-surface': palette.surface,
              '--theme-text': palette.text,
              '--theme-muted': palette.muted,
              '--theme-border': palette.border,

              backgroundColor: 'var(--theme-background)',

              color: 'var(--theme-text)',

              minHeight: '100vh',
              position: 'relative',
            } as React.CSSProperties
          }
        >
          {/* ====================================================
              3D INTERACTIVE DEEP SPACE BACKGROUND
              Active from Tracks section downwards; Hero & About
              are excluded by internal scroll-bounds observer.
             ==================================================== */}
          <GlobalThemeBackground themeId={selectedTheme} />

          <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
            {/* ==================================================
                HEADER
               ================================================== */}

            <Header />

            {/* ==================================================
                MAIN CONTENT
               ================================================== */}

            <main id="main-content">
              {/* =================================================
                  HERO
                 ================================================= */}

              <HeroSection themeId={selectedTheme} />

              {/* =================================================
                  ABOUT
                 ================================================= */}

              <AboutSection active />

              {/* =================================================
                  TRACKS
                 ================================================= */}

              <TracksSection />

              {/* =================================================
                  PRIZES
                 ================================================= */}

              <PrizesSection />

              {/* =================================================
                  TIMELINE
                 ================================================= */}

              <TimelineSection />

              {/* =================================================
                  SPONSORS
                 ================================================= */}

              <SponsorsSection />

              {/* =================================================
                  JURY
                 ================================================= */}

              <JurySection />

              {/* =================================================
                  RULES
                 ================================================= */}

              <RulesSection />

              {/* =================================================
                  FAQ
                 ================================================= */}

              <FAQSection />
            </main>

            {/* ==================================================
                FOOTER
               ================================================== */}

            <Footer />
          </div>
        </div>
      )}

      {/* ========================================================
          ROCKY CUSTOM CURSOR

          Rendered after the website so that it remains above
          all sections, Three.js canvas, images and overlays.
         ======================================================== */}

      {bootComplete && <RockyCursor />}
    </>
  );
};

export default App;