import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { FloatingMenu } from './components/layout/FloatingMenu';

/*
 * HeroSection.tsx now exports both:
 *   - named   → export const HeroSection
 *   - default → export default HeroSection
 *
 * App.tsx uses the default export, which is fine.
 */
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

/* ============================================================
   APP
   ============================================================ */

const App: React.FC = () => {
  /* ============================================================
     BOOT STATE
     ============================================================ */

  const [bootComplete, setBootComplete] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('theme') || params.has('skipBoot');
    }
    return false;
  });

  /* ============================================================
     THEME STATE
     ============================================================ */

  const [themeSelected, setThemeSelected] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('theme');
    }
    return false;
  });

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('theme');
      if (t === 'kepler' || t === 'miller' || t === 'pandora' || t === 'tau-ceti') {
        return t;
      }
    }
    return 'tau-ceti';
  });

  /* ============================================================
     BOOT COMPLETE
     ============================================================ */

  const handleBootComplete =
    useCallback(() => {
      setBootComplete(true);
    }, []);

  /* ============================================================
     THEME SELECTION
     ============================================================ */

  const handleThemeSelect =
    useCallback((themeId: ThemeId) => {
      setSelectedTheme(themeId);
      setThemeSelected(true);
    }, []);

  /* ============================================================
     ACTIVE THEME PALETTE
     ============================================================ */

  const palette =
    themePalettes[selectedTheme];

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
     RENDER
     ============================================================ */

  return (
    <>
      {/* ======================================================
          BOOT SEQUENCE
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
          <GlobalThemeBackground
            themeId={selectedTheme}
          />

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
                position: 'relative',
                zIndex: 1,
              } as React.CSSProperties
            }
          >
            <div
              className="app-container"
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <FloatingMenu />

              <main
                id="main-content"
                style={{
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* ==============================================
                    HERO
                   ============================================== */}

                <HeroSection
                  themeId={selectedTheme}
                />

                {/* ==============================================
                    ABOUT
                   ============================================== */}

                <AboutSection active />

                {/* ==============================================
                    OTHER SECTIONS
                   ============================================== */}

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
          </div>
        </>
      )}

      {/* ======================================================
          ROCKY CURSOR
         ====================================================== */}

      {bootComplete && <RockyCursor />}
    </>
  );
};

export default App;