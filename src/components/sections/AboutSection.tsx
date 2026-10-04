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
  Compass,
  Zap,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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

        {/* Rocky Transmission Hero Card */}
        <div className="mt-10">
          <Reveal delay={40}>
            <Card className="relative overflow-hidden p-8 sm:p-10 transition-all duration-300 hover:border-theme-accent/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              {/* Subtle Atmospheric Light Pools */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-theme-accent/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-theme-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] tracking-widest text-theme-accent border-theme-accent/30 bg-theme-accent/10 uppercase flex items-center gap-2 py-1 px-3"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse text-theme-accent" />
                      INCOMING TRANSMISSION
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground/70 hidden sm:inline">
                      FREQ 1420.405 MHz
                    </span>
                  </div>

                  <h2 className="font-nasalization text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Hello Earthlings! <span className="text-theme-accent">I am Rocky.</span>
                  </h2>

                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
                    I have travelled across the stars to see what you are building. Join us on this journey of experimentation, collaboration, and breakthrough engineering.
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-theme-accent/10 border border-theme-accent/30 text-theme-accent shadow-[0_0_20px_color-mix(in_srgb,var(--theme-accent)_20%,transparent)]">
                  <Compass className="w-8 h-8 animate-spin-slow" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Core Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* About Overview Card */}
          <Reveal delay={80}>
            <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:border-theme-accent/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase flex items-center gap-1.5"
                  >
                    <Orbit className="w-3.5 h-3.5" />
                    ABOUT RESURRECTION
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground/60">01 / OVERVIEW</span>
                </div>

                <CardTitle className="text-xl sm:text-2xl font-nasalization text-foreground">
                  Build beyond the known.
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                <p>
                  Resurrection is a space where ambitious minds come together to transform ideas into technology. It brings together developers, designers, innovators and problem-solvers to create meaningful solutions to real-world challenges.
                </p>
                <p>
                  From the first spark of an idea to a working prototype, the journey is about experimentation, collaboration and building something that can make a difference.
                </p>
              </CardContent>

              <CardFooter className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-muted-foreground/70">
                <span>MISSION PROTOCOL</span>
                <span className="text-theme-accent font-semibold tracking-wider">RESURRECTION 2026</span>
              </CardFooter>
            </Card>
          </Reveal>

          {/* Mission Card */}
          <Reveal delay={120}>
            <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:border-theme-accent/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase flex items-center gap-1.5"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    THE MISSION
                  </Badge>
                  <span className="font-mono text-[10px] text-muted-foreground/60">02 / TARGET</span>
                </div>

                <CardTitle className="text-xl sm:text-2xl font-nasalization text-foreground">
                  One mission. <span className="text-theme-accent">Infinite possibilities.</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  The challenge is not simply to participate. It is to explore, experiment and build solutions that push the boundaries of what is possible.
                </p>

                {/* Feature Node Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl border border-[color-mix(in_srgb,var(--theme-border)_55%,rgba(255,255,255,0.1))] bg-[color-mix(in_srgb,var(--theme-surface)_70%,rgba(0,0,0,0.6))] backdrop-blur-md hover:border-theme-accent/50 hover:bg-[color-mix(in_srgb,var(--theme-surface)_85%,rgba(0,0,0,0.5))] transition-all space-y-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <strong className="block text-foreground text-xs font-mono tracking-wider">
                      BUILD
                    </strong>
                    <span className="text-muted-foreground text-[11px] leading-tight block">
                      Turn ideas into real technology.
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-[color-mix(in_srgb,var(--theme-border)_55%,rgba(255,255,255,0.1))] bg-[color-mix(in_srgb,var(--theme-surface)_70%,rgba(0,0,0,0.6))] backdrop-blur-md hover:border-theme-accent/50 hover:bg-[color-mix(in_srgb,var(--theme-surface)_85%,rgba(0,0,0,0.5))] transition-all space-y-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <strong className="block text-foreground text-xs font-mono tracking-wider">
                      THINK
                    </strong>
                    <span className="text-muted-foreground text-[11px] leading-tight block">
                      Solve hard problems & question norms.
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-[color-mix(in_srgb,var(--theme-border)_55%,rgba(255,255,255,0.1))] bg-[color-mix(in_srgb,var(--theme-surface)_70%,rgba(0,0,0,0.6))] backdrop-blur-md hover:border-theme-accent/50 hover:bg-[color-mix(in_srgb,var(--theme-surface)_85%,rgba(0,0,0,0.5))] transition-all space-y-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-theme-accent/10 text-theme-accent border border-theme-accent/20">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <strong className="block text-foreground text-xs font-mono tracking-wider">
                      LAUNCH
                    </strong>
                    <span className="text-muted-foreground text-[11px] leading-tight block">
                      Execute from concept to prototype.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        {/* Why Resurrection & Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Reveal delay={160} className="lg:col-span-2">
            <Card className="h-full p-8 flex flex-col justify-between transition-all duration-300 hover:border-theme-accent/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase flex items-center gap-1.5"
                  >
                    <Atom className="w-3.5 h-3.5" />
                    WHY RESURRECTION?
                  </Badge>
                </div>

                <h3 className="font-nasalization text-xl sm:text-2xl font-bold text-foreground mb-4">
                  Ideas deserve <span className="text-theme-accent">more than gravity.</span>
                </h3>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Resurrection encourages you to think beyond conventional solutions. Whether you are exploring artificial intelligence, software engineering, quantum computing or another emerging field, the focus is on learning, creating and solving.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-theme-accent">
                <Zap className="w-4 h-4" />
                <span>INTERSTELLAR HACKATHON EXPERIENCE</span>
              </div>
            </Card>
          </Reveal>

          <div className="space-y-4 flex flex-col justify-between">
            <Reveal delay={200}>
              <Card className="p-6 transition-all duration-300 hover:border-theme-accent/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-theme-accent/10 text-theme-accent shrink-0 border border-theme-accent/20 shadow-inner">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-foreground text-sm font-mono tracking-wider">
                      TECHNOLOGY
                    </strong>
                    <span className="text-muted-foreground text-xs leading-relaxed block mt-1">
                      Explore modern tech stacks and build practical solutions.
                    </span>
                  </div>
                </div>
              </Card>
            </Reveal>

            <Reveal delay={240}>
              <Card className="p-6 transition-all duration-300 hover:border-theme-accent/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-theme-accent/10 text-theme-accent shrink-0 border border-theme-accent/20 shadow-inner">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-foreground text-sm font-mono tracking-wider">
                      COLLABORATION
                    </strong>
                    <span className="text-muted-foreground text-xs leading-relaxed block mt-1">
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

export default AboutSection;