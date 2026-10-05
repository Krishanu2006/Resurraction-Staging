import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

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

/*
 * GLOBAL THREE.JS SPACE BACKGROUND
 *
 * This is intentionally separate from ThemeSelector.
 * It appears behind the website after Hero/About begins.
 */
import GlobalThemeBackground from './components/ui/GlobalThemeBackground';

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

  const handleBootComplete =
    useCallback(() => {
      setBootComplete(true);
    }, []);


  /* ============================================================
     THEME SELECTION
     ============================================================ */

  const handleThemeSelect =
    useCallback(
      (themeId: ThemeId) => {
        setSelectedTheme(themeId);
        setThemeSelected(true);
      },
      []
    );


  /* ============================================================
     ACTIVE THEME PALETTE
     ============================================================ */

  const palette =
    themePalettes[selectedTheme];


  /* ============================================================
     APPLY THEME VARIABLES
     ============================================================ */

  useEffect(() => {

    const root =
      document.documentElement;


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

          BootLoader
              ↓
          ThemeSelector
              ↓
          Website
         ====================================================== */}

      {!bootComplete && (
        <BootLoader
          onComplete={
            handleBootComplete
          }
        />
      )}


      {/* ======================================================
          THEME SELECTOR

          UNCHANGED
         ====================================================== */}

      {bootComplete &&
        !themeSelected && (
          <ThemeSelector
            onSelect={(themeId) => {
              handleThemeSelect(
                themeId as ThemeId
              );
            }}
          />
        )}


      {/* ======================================================
          MAIN WEBSITE
         ====================================================== */}

      {bootComplete &&
        themeSelected && (
          <>

            {/* ==================================================
                EXISTING ADRIAN ENVIRONMENT

                Kept unchanged.
               ================================================== */}

            <AdrianEnvironment />


            {/* ==================================================
                GLOBAL THREE.JS SPACE BACKGROUND

                IMPORTANT:

                - Behind all website content
                - Not inside Hero
                - Not inside ThemeSelector
                - Starts becoming visible around About
                - Tau Ceti gets green/orange background
                - Tau Ceti planets are static
               ================================================== */}

            <GlobalThemeBackground
              themeId={selectedTheme}
            />


            {/* ==================================================
                MAIN THEMED WEBSITE

                zIndex 1 keeps all actual website content
                above the Three.js background.
               ================================================== */}

            <div
              id="app-theme"
              style={
                {
                  '--theme-primary':
                    palette.primary,

                  '--theme-secondary':
                    palette.secondary,

                  '--theme-accent':
                    palette.accent,

                  '--theme-background':
                    palette.background,

                  '--theme-surface':
                    palette.surface,

                  '--theme-text':
                    palette.text,

                  '--theme-muted':
                    palette.muted,

                  '--theme-border':
                    palette.border,

                  /*
                   * IMPORTANT:
                   *
                   * Do NOT give this wrapper an opaque
                   * background because that would cover
                   * the Three.js planets/background.
                   */
                  backgroundColor:
                    'transparent',

                  color:
                    'var(--theme-text)',

                  minHeight:
                    '100vh',

                  position:
                    'relative',

                  zIndex:
                    1,
                } as React.CSSProperties
              }
            >

              {/* ==================================================
                  APPLICATION CONTAINER
                 ================================================== */}

              <div
                className="app-container"
                style={{
                  position:
                    'relative',

                  zIndex:
                    1,
                }}
              >

                {/* ==================================================
                    HEADER
                   ================================================== */}

                <Header />


                {/* ==================================================
                    MAIN CONTENT
                   ================================================== */}

                <main
                  id="main-content"
                  style={{
                    position:
                      'relative',

                    zIndex:
                      1,
                  }}
                >

                  {/* ==============================================
                      HERO

                      NO CHANGES.

                      The GlobalThemeBackground remains hidden
                      while Hero is visible.
                     ============================================== */}

                  <HeroSection
                    themeId={selectedTheme}
                  />


                  {/* ==============================================
                      ABOUT

                      Tau Ceti background begins appearing here.
                     ============================================== */}

                  <AboutSection
                    active
                  />


                  {/* ==============================================
                      TRACKS
                     ============================================== */}

                  <TracksSection />


                  {/* ==============================================
                      PRIZES
                     ============================================== */}

                  <PrizesSection />


                  {/* ==============================================
                      TIMELINE
                     ============================================== */}

                  <TimelineSection />


                  {/* ==============================================
                      SPONSORS
                     ============================================== */}

                  <SponsorsSection />


                  {/* ==============================================
                      JURY
                     ============================================== */}

                  <JurySection />


                  {/* ==============================================
                      RULES
                     ============================================== */}

                  <RulesSection />


                  {/* ==============================================
                      FAQ
                     ============================================== */}

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

          Kept unchanged.

          Rendered after the website so it stays above:
          - Three.js background
          - website sections
          - images
          - overlays
         ======================================================== */}

      {bootComplete && (
        <RockyCursor />
      )}

    </>
  );
};


export default App;