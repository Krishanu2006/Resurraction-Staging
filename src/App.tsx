import React from 'react';

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

const App: React.FC = () => {
  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--void)',
      }}
    >
      {/* Rocky custom cursor */}
      <RockyCursor />

      <Header />

      <main id="main-content">
        <HeroSection />

        {/* About section must be active so its cinematic layer is visible */}
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
  );
};

export default App;