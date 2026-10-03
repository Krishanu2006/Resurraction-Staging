import React, { useCallback, useState } from 'react';

// import { MissionIntro } from './components/hero/MissionIntro';
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

const App: React.FC = () => {
  /*
   * --------------------------------------------------------
   * HERO → ABOUT CROSSFADE
   * --------------------------------------------------------
   *
   * `handoff` flips to true the instant the hero has fully
   * scrolled (its progress reaches 1.0).
   *
   * When that happens:
   *
   *   • Hero begins a slow fade-out.
   *   • About begins a slow fade-in.
   *
   * The two fades run in parallel and use the same duration
   * and easing, so there is never an empty frame — the About
   * section is already behind the Hero and simply becomes
   * visible as the Hero fades away.
   *
   * No scroll involvement in the fade itself. The trigger is
   * scroll-based; the animation is purely time-based.
   */
  const [handoff, setHandoff] = useState(false);

  const handleHeroComplete = useCallback(() => {
    setHandoff(true);
  }, []);

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--void)',
      }}
    >

      {/* =====================================================
          INTRO
          ===================================================== */}

      {/* <MissionIntro /> */}

      {/* =====================================================
          GLOBAL NAVIGATION
          ===================================================== */}

      <Header />

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main id="main-content">

        {/* HERO
            -----------------------------------------------
            Fires onHeroComplete once progress hits 1.0.
            Fades out over the same duration as the About
            section fades in.
        */}
        <HeroSection
          onHeroComplete={handleHeroComplete}
        />

        {/* =================================================
            WEBSITE SECTIONS
            ================================================= */}

        <AboutSection active={handoff} />

        <TracksSection />

        <PrizesSection />

        <TimelineSection />

        <SponsorsSection />

        <JurySection />

        <RulesSection />

        <FAQSection />

      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <Footer />

    </div>
  );
};

export default App;