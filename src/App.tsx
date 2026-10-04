import React, { useCallback, useState, useEffect } from 'react';

import { Header } from './components/layout/Header';
import { HeroSection } from './components/hero/HeroSection';

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

import {
  themePalettes,
  type ThemeId,
} from './config/theme';

const App: React.FC = () => {
  const [bootComplete, setBootComplete] =
    useState(false);

  const [themeSelected, setThemeSelected] =
    useState(false);

  const [selectedTheme, setSelectedTheme] =
    useState<ThemeId>('tau-ceti');

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

  const palette = themePalettes[selectedTheme];
  console.log('THEME:', selectedTheme);
  console.log('BACKGROUND:', palette.background);
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

  return (
    <>
      {/* =====================================================
          BOOTLOADER
         ===================================================== */}

      {!bootComplete && (
        <BootLoader
          onComplete={handleBootComplete}
        />
      )}

      {/* =====================================================
          THEME SELECTOR
         ===================================================== */}

      {bootComplete && !themeSelected && (
        <ThemeSelector
          onSelect={(themeId) => {
            setSelectedTheme(themeId as ThemeId);
            setThemeSelected(true);
          }}
        />
      )}

      {/* =====================================================
          MAIN WEBSITE
         ===================================================== */}

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
            } as React.CSSProperties
          }
        >
          <div
            className="app-container">
            <Header />

            <main id="main-content">
              <HeroSection />

              <AboutSection active />

              <TracksSection />

              <PrizesSection />

              <TimelineSection />

              <SponsorsSection />

              <JurySection />

              <RulesSection />

              <FAQSection />
            </main>

            <Footer />
          </div>
        </div >
      )}

      {/* =====================================================
          ROCKY CURSOR
          MUST BE LAST SO IT STAYS ABOVE EVERYTHING
         ===================================================== */}

      {
        bootComplete && (
          <RockyCursor />
        )
      }
    </>
  );
};

export default App;