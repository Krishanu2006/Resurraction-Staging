import React, { useCallback, useState } from 'react';

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

const App: React.FC = () => {
  const [bootComplete, setBootComplete] =
    useState(false);

  const [themeSelected, setThemeSelected] =
    useState(false);

  const handleBootComplete = useCallback(() => {
    setBootComplete(true);
  }, []);

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
          onSelect={() => {
            setThemeSelected(true);
          }}
        />
      )}

      {/* =====================================================
          MAIN WEBSITE
         ===================================================== */}

      {bootComplete && themeSelected && (
        <div
          className="app-container"
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--void)',
          }}
        >
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
      )}

      {/* =====================================================
          ROCKY CURSOR
          MUST BE LAST SO IT STAYS ABOVE EVERYTHING
         ===================================================== */}

      {bootComplete && (
        <RockyCursor />
      )}
    </>
  );
};

export default App;