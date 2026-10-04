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

import RockyCursor from './components/ui/RockyCursor';
import { BootLoader } from './components/ui/BootLoader';
import { ThemeSelector } from './components/ui/ThemeSelector';

import AdrianEnvironment from './components/Environment/AdrianEnvironment';

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

  const palette = themePalettes[selectedTheme];

  /* ============================================================
     APPLY THEME VARIABLES
     ============================================================ */

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty(
      '--theme-primary',
      palette.primary
    );

    root.style.setProperty(
      '--theme-secondary',
      palette.secondary
    );

    root.style.setProperty(
      '--theme-accent',
      palette.accent
    );

    root.style.setProperty(
      '--theme-background',
      palette.background
    );

    root.style.setProperty(
      '--theme-surface',
      palette.surface
    );

    root.style.setProperty(
      '--theme-text',
      palette.text
    );

    root.style.setProperty(
      '--theme-muted',
      palette.muted
    );

    root.style.setProperty(
      '--theme-border',
      palette.border
    );
  }, [palette]);

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
        <>
          {/* Persistent interactive space environment.
              This sits behind the entire website. */}
          <AdrianEnvironment />

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

                backgroundColor: 'transparent',

                color: 'var(--theme-text)',

                minHeight: '100vh',
              } as React.CSSProperties
            }
          >
            <div className="app-container">

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

                <HeroSection />

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
        </>
      )}

      {/* ========================================================
          ROCKY CUSTOM CURSOR

          Rendered after everything else so Rocky stays above
          the Three.js environment, hero, sections and overlays.
         ======================================================== */}

      {bootComplete && <RockyCursor />}
    </>
  );
};

export default App;