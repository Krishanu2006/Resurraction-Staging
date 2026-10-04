import React from 'react';
import {
  Sparkles,
  Orbit,
  Rocket,
  Code2,
  BrainCircuit,
  Atom,
  Cpu,
  Users,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AboutSectionProps {
  active?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = () => {
  return (
    <section id="about" className="section relative py-20 overflow-hidden bg-transparent">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <Reveal>
          <SectionHeading
            code="02 — About"
            title="Build beyond the known."
            subtitle="Resurrection brings together developers, designers, innovators and problem-solvers to transform ideas into technology."
          />
        </Reveal>

        {/* Rocky Greeting Card */}
        <div className="mt-10">
          <Reveal delay={40}>
            <Card className="relative overflow-hidden border border-theme-primary/30 bg-theme-card-bg/30 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-theme-primary/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] tracking-widest text-theme-accent border-theme-accent/30 bg-theme-accent/10 uppercase flex items-center gap-1.5 py-1 px-3"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  INCOMING TRANSMISSION
                </Badge>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                Hello Earthlings! <span className="text-theme-accent">I am Rocky.</span>
              </h2>

              <p className="mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
                I have travelled across the stars to see what you are building. Join us on this journey of experimentation, collaboration, and breakthrough engineering.
              </p>
            </Card>
          </Reveal>
        </div>

        {/* Core Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* About Overview */}
          <Reveal delay={80}>
            <Card className="h-full border border-theme-border/40 bg-theme-card-bg/25 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between hover:border-theme-primary/40 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase flex items-center gap-1.5"
                  >
                    <Orbit className="w-3.5 h-3.5" />
                    ABOUT RESURRECTION
                  </Badge>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-4">
                  Build beyond the known.
                </h3>

                <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  <p>
                    Resurrection is a space where ambitious minds come together to transform ideas into technology. It brings together developers, designers, innovators and problem-solvers to create meaningful solutions to real-world challenges.
                  </p>
                  <p>
                    From the first spark of an idea to a working prototype, the journey is about experimentation, collaboration and building something that can make a difference.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-muted-foreground/70">
                <span>MISSION</span>
                <span className="text-theme-accent font-semibold">RESURRECTION</span>
              </div>
            </Card>
          </Reveal>

          {/* Mission */}
          <Reveal delay={120}>
            <Card className="h-full border border-theme-border/40 bg-theme-card-bg/25 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between hover:border-theme-primary/40 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase flex items-center gap-1.5"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    THE MISSION
                  </Badge>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  One mission. <span className="text-theme-accent">Infinite possibilities.</span>
                </h3>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                  The challenge is not simply to participate. It is to explore, experiment and build solutions that push the boundaries of what is possible.
                </p>

                {/* Feature Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg border border-theme-border/30 bg-black/30 backdrop-blur-sm space-y-1">
                    <div className="text-theme-accent mb-1">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <strong className="block text-foreground text-xs font-semibold tracking-wider font-mono">
                      BUILD
                    </strong>
                    <span className="text-muted-foreground text-[11px] leading-tight block">
                      Turn ideas into real technology.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-theme-border/30 bg-black/30 backdrop-blur-sm space-y-1">
                    <div className="text-theme-accent mb-1">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <strong className="block text-foreground text-xs font-semibold tracking-wider font-mono">
                      THINK
                    </strong>
                    <span className="text-muted-foreground text-[11px] leading-tight block">
                      Question assumptions and solve hard problems.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-theme-border/30 bg-black/30 backdrop-blur-sm space-y-1">
                    <div className="text-theme-accent mb-1">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <strong className="block text-foreground text-xs font-semibold tracking-wider font-mono">
                      LAUNCH
                    </strong>
                    <span className="text-muted-foreground text-[11px] leading-tight block">
                      Take solutions from concept to execution.
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Why Resurrection & Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
            <Reveal delay={160}>
              <Card className="h-full border border-theme-border/40 bg-theme-card-bg/25 backdrop-blur-md p-6 sm:p-8 hover:border-theme-primary/40 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase flex items-center gap-1.5"
                  >
                    <Atom className="w-3.5 h-3.5" />
                    WHY RESURRECTION?
                  </Badge>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  Ideas deserve <span className="text-theme-accent">more than gravity.</span>
                </h3>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Resurrection encourages you to think beyond conventional solutions. Whether you are exploring artificial intelligence, software engineering, quantum computing or another emerging field, the focus is on learning, creating and solving.
                </p>
              </Card>
            </Reveal>
          </div>

          <div className="space-y-4">
            <Reveal delay={200}>
              <Card className="p-5 border border-theme-border/40 bg-theme-card-bg/25 backdrop-blur-md hover:border-theme-primary/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-theme-primary/10 text-theme-accent shrink-0 border border-theme-primary/20">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-foreground text-xs font-mono tracking-wider">
                      TECHNOLOGY
                    </strong>
                    <span className="text-muted-foreground text-xs leading-tight block mt-0.5">
                      Explore modern tech and build practical solutions.
                    </span>
                  </div>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={240}>
              <Card className="p-5 border border-theme-border/40 bg-theme-card-bg/25 backdrop-blur-md hover:border-theme-primary/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-theme-primary/10 text-theme-accent shrink-0 border border-theme-primary/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-foreground text-xs font-mono tracking-wider">
                      COLLABORATION
                    </strong>
                    <span className="text-muted-foreground text-xs leading-tight block mt-0.5">
                      Work with diverse minds and bold perspectives.
                    </span>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};