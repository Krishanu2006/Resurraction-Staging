import React from 'react';
import {
  Trophy,
  ArrowUpRight,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  prizePoolOverview,
  prizesData,
} from '../../data/prizes';

export const PrizesSection: React.FC = () => {
  return (
    <section id="prize" className="section">
      <div className="container">
        <Reveal>
          <SectionHeading
            code="03 — Prizes"
            title="Good ideas should travel further."
            subtitle="The final prize structure is being prepared with our partners. Official amounts will be published before registration."
          />
        </Reveal>

        {/* Featured prize panel using shadcn Card & Tailwind */}
        <Reveal delay={80}>
          <Card className="prize-feature relative overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] min-h-[390px] border-[var(--theme-card-border)] bg-gradient-to-br from-[color-mix(in_srgb,var(--theme-card-bg)_95%,black)] to-[color-mix(in_srgb,var(--theme-surface)_80%,var(--theme-primary)_20%)] shadow-[var(--theme-glow)] backdrop-blur-xl">
            <div className="p-8 sm:p-12 lg:p-16 relative z-10 flex flex-col justify-center">
              <Badge variant="accent" className="w-fit flex items-center gap-2 mb-6">
                <Trophy size={15} strokeWidth={1.5} />
                {prizePoolOverview.title}
              </Badge>

              <div className="font-nasalization text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter text-[var(--theme-text)] leading-none">
                {prizePoolOverview.highlight}
              </div>

              <p className="mt-6 max-w-[600px] text-sm sm:text-base text-[var(--theme-muted)] leading-relaxed font-sans">
                {prizePoolOverview.description}
              </p>
            </div>

            {/* Orbital prize visual */}
            <div
              aria-hidden="true"
              className="relative min-h-[260px] lg:min-h-[300px] overflow-hidden flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,.14),transparent_35%)]"
            >
              <div className="absolute w-[270px] h-[100px] rounded-full border border-[var(--theme-accent)] opacity-40 -rotate-[18deg]" />
              <div className="absolute w-[220px] h-[80px] rounded-full border border-[var(--theme-primary)] opacity-30 rotate-[25deg]" />
              <div className="absolute w-24 h-24 rounded-full bg-[radial-gradient(circle_at_35%_28%,var(--theme-accent),var(--theme-primary)_38%,var(--theme-background)_78%)] shadow-[var(--theme-glow)]" />
            </div>
          </Card>
        </Reveal>

        {/* Prize cards using shadcn Card & Tailwind */}
        <div className="prize-grid grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {prizesData.map((prize, index) => (
            <Reveal
              key={prize.id}
              delay={130 + index * 60}
            >
              <Card className="prize-card group min-h-[240px] p-7 border-[var(--theme-card-border)] bg-[var(--theme-card-bg)] backdrop-blur-xl hover:border-[var(--theme-accent)] hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0">
                  <Badge variant="outline" className="font-mono text-[10px] tracking-wider text-[var(--theme-accent)] border-[var(--theme-card-border)]">
                    {prize.tier}
                  </Badge>
                  <ArrowUpRight
                    size={16}
                    className="text-[var(--theme-muted)] group-hover:text-[var(--theme-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </CardHeader>

                <CardContent className="p-0 mt-6">
                  <CardTitle className="font-nasalization text-xl font-bold tracking-tight text-[var(--theme-text)]">
                    {prize.title}
                  </CardTitle>
                  <div className="mt-2 text-lg font-nasalization font-semibold text-[var(--theme-accent)]">
                    {prize.amount}
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--theme-muted)] leading-relaxed font-sans">
                    {prize.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};