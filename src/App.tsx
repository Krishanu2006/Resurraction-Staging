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
import { BootLoader } from './components/ui/BootLoader';
import { RockyCursor } from './components/ui/RockyCursor';

const ThemeSelector = React.lazy(() =>
  import('./components/ui/ThemeSelector').then((m) => ({ default: m.ThemeSelector }))
);
const GlobalThemeBackground = React.lazy(() => import('./components/ui/GlobalThemeBackground'));

import {
  themePalettes,
  type ThemeId,
} from './config/theme';

const isBotCrawler = () => {
  if (typeof navigator === 'undefined') return false;
  return /bot|googlebot|bingbot|crawler|spider|slurp|facebookexternalhit|twitterbot/i.test(
    navigator.userAgent
  );
};

/* ============================================================
   APP
   ============================================================ */

const App: React.FC = () => {
  /* ============================================================
     THEME STATE
     ============================================================ */

  const [themeSelected, setThemeSelected] = useState(() => {
    if (typeof window !== 'undefined') {
      if (isBotCrawler()) return true;
      const params = new URLSearchParams(window.location.search);
      if (params.has('theme')) return true;
      const savedTheme = localStorage.getItem('resurrection_theme');
      return !!savedTheme;
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
      const saved = localStorage.getItem('resurrection_theme') as ThemeId;
      if (saved === 'kepler' || saved === 'miller' || saved === 'pandora' || saved === 'tau-ceti') {
        return saved;
      }
    }
    return 'tau-ceti';
  });

  /* ============================================================
     BOOT STATE
     ------------------------------------------------------------
     On both first-time selection and page refresh, the intro video
     and animation will ALWAYS play before the main website loads.
     Only bots or explicit ?skipBoot=true bypass it.
     ============================================================ */

  const [bootComplete, setBootComplete] = useState(() => {
    if (typeof window !== 'undefined') {
      if (isBotCrawler()) return true;
      const params = new URLSearchParams(window.location.search);
      return params.has('skipBoot');
    }
    return false;
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
     ------------------------------------------------------------
     When user selects a theme (first boot), save choice and
     reveal the main website.
     ============================================================ */

  const handleThemeSelect =
    useCallback((themeId: ThemeId) => {
      try {
        localStorage.setItem('resurrection_theme', themeId);
      } catch {
        // ignore
      }
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
          ROCKY CURSOR: ALWAYS MOUNTED IMMEDIATELY ACROSS ALL SCREENS
         ====================================================== */}
      <RockyCursor />

      {/* ======================================================
          STEP 1 (FIRST & SECOND BOOT): LOADER BAR & VIDEO ANIMATION
          Runs on first boot and second boot (refresh).
         ====================================================== */}
      {!bootComplete && (
        <BootLoader
          onComplete={handleBootComplete}
        />
      )}

      {/* ======================================================
          STEP 2 (FIRST BOOT ONLY): THEME SELECTOR
          Shown after video animation completes, only if theme
          has not been selected yet.
         ====================================================== */}
      {bootComplete && !themeSelected && (
        <React.Suspense fallback={null}>
          <ThemeSelector
            onSelect={(themeId) => {
              handleThemeSelect(themeId as ThemeId);
            }}
          />
        </React.Suspense>
      )}

      {/* ======================================================
          STEP 3: MAIN WEBSITE
          Shown after boot completes and theme is selected.
          On second boot, jumps directly here after the video animation.
         ====================================================== */}
      {bootComplete && themeSelected && (
        <>
          <React.Suspense fallback={null}>
            <GlobalThemeBackground
              themeId={selectedTheme}
            />
          </React.Suspense>

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
    </>
  );
};

export default App;