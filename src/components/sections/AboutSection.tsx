import React from 'react';

import {
  Atom,
  BrainCircuit,
  Code2,
  Cpu,
  Orbit,
  Rocket,
  Users,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';

import '../../styles/about-scroll.css';


/* =========================================================
   DATA
   ========================================================= */

const principlesData = [
  {
    id: 'build',
    icon: Code2,
    tag: 'PILLAR 01',
    title: 'Build',
    description:
      'Turn ideas into real, working technology. From the first commit to the final demo, everything you create moves the mission forward.',
  },
  {
    id: 'think',
    icon: BrainCircuit,
    tag: 'PILLAR 02',
    title: 'Think',
    description:
      'Question assumptions. Solve difficult problems. The best solutions come from looking at a challenge from an angle nobody else considered.',
  },
  {
    id: 'launch',
    icon: Rocket,
    tag: 'PILLAR 03',
    title: 'Launch',
    description:
      'Take your solution from concept to execution. Ideas only matter when they leave the notebook and reach the world.',
  },
];


const focusAreasData = [
  {
    id: 'technology',
    icon: Cpu,
    title: 'Technology',
    description:
      'Explore modern technologies and turn them into practical solutions for real-world problems.',
  },
  {
    id: 'collaboration',
    icon: Users,
    title: 'Collaboration',
    description:
      'Work with people who bring different perspectives, skills, and ideas to the same mission.',
  },
  {
    id: 'exploration',
    icon: Atom,
    title: 'Exploration',
    description:
      'Push into fields like AI, software engineering, and quantum computing — wherever curiosity leads.',
  },
];


/* =========================================================
   ABOUT SECTION
   ========================================================= */

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="section about-section"
    >

      <div className="container">

        {/* =================================================
            SECTION HEADING
            ================================================= */}

        <Reveal>
          <SectionHeading
            code="02 — About"
            title="Build beyond the known."
            subtitle="Resurrection is a space where ambitious minds come together to transform ideas into technology. From the first spark of an idea to a working prototype, the journey is about experimentation, collaboration and building something that makes a difference."
          />

        </Reveal>


        {/* =================================================
            INTRO PANEL — two-column split
            ================================================= */}

        <Reveal delay={80}>
          <div className="about-intro-panel">

            <div className="about-intro-left">
              <span className="about-eyebrow">
                <Orbit size={15} strokeWidth={1.4} />
                MISSION BRIEF
              </span>

              <h3 className="about-intro-heading">
                One mission.
                <br />
                <span>Infinite possibilities.</span>
              </h3>
            </div>

            <div className="about-intro-right">
              <p className="about-intro-text">
                The challenge is not
                simply to participate.
                It is to explore,
                experiment and build
                solutions that push the
                boundaries of what is
                possible.
              </p>

              <div className="about-meta-row">
                <span>MISSION</span>
                <span className="about-meta-line" />
                <strong>RESURRECTION</strong>
              </div>
            </div>

          </div>
        </Reveal>


        {/* =================================================
            PRINCIPLES — 3 across
            ================================================= */}

        <div className="about-principles">
          {principlesData.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <Reveal
                key={principle.id}
                delay={130 + index * 60}
              >
                <article className="about-card interactive-card">

                  <div className="about-card-top">
                    <Icon
                      size={22}
                      strokeWidth={1.4}
                      className="about-card-icon"
                    />

                    <span className="about-card-tag">
                      {principle.tag}
                    </span>
                  </div>

                  <h3 className="about-card-title">
                    {principle.title}
                  </h3>

                  <p className="about-card-description">
                    {principle.description}
                  </p>

                </article>
              </Reveal>
            );
          })}
        </div>


        {/* =================================================
            FOCUS AREAS — 3 across, compact
            ================================================= */}

        <div className="about-focus">
          {focusAreasData.map((area, index) => {
            const Icon = area.icon;

            return (
              <Reveal
                key={area.id}
                delay={180 + index * 60}
              >
                <article className="about-focus-card interactive-card">

                  <div className="about-focus-icon">
                    <Icon
                      size={18}
                      strokeWidth={1.4}
                    />
                  </div>

                  <div className="about-focus-body">
                    <h4 className="about-focus-title">
                      {area.title}
                    </h4>

                    <p className="about-focus-description">
                      {area.description}
                    </p>
                  </div>

                </article>
              </Reveal>
            );
          })}
        </div>


        {/* =================================================
            CLOSING STATEMENT
            ================================================= */}

        <Reveal delay={260}>
          <div className="about-closing-panel">

            <span className="about-closing-label">
              RESURRECTION
            </span>

            <h2 className="about-closing-heading">
              Your next idea
              <br />
              <span>starts here.</span>
            </h2>

            <p className="about-closing-text">
              Keep exploring.
              The mission has only
              just begun.
            </p>

          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default AboutSection;