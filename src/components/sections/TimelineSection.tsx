import React from 'react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { timelineData } from '../../data/timeline';

export const TimelineSection: React.FC = () => {
  return (
    <section id="timeline" className="section relative py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <SectionHeading
            code="04 — Timeline"
            title="From first signal to final demo."
            subtitle="The dates are still being confirmed. The journey itself is simple: discover, register, build, present and celebrate."
          />
        </Reveal>

        <div className="relative max-w-[1050px] mx-auto mt-12">
          {/* Vertical timeline line */}
          <div
            className="absolute left-[38px] sm:left-[80px] top-6 bottom-6 w-[2px] opacity-30"
            style={{
              background:
                'linear-gradient(180deg, var(--theme-accent) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <div className="space-y-6">
            {timelineData.map((item, index) => (
              <Reveal key={item.id} delay={index * 55}>
                <Card className="relative grid grid-cols-[50px_1fr] sm:grid-cols-[70px_30px_230px_1fr] gap-4 sm:gap-6 items-start p-4 sm:p-6 hover:border-theme-primary/50 transition-all duration-300">
                  <div className="hidden sm:block">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] tracking-wider text-theme-accent border-theme-accent/20 bg-theme-accent/5"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Badge>
                  </div>

                  <div className="hidden sm:flex justify-center pt-1.5">
                    <div className="w-3 h-3 rounded-full bg-theme-accent shadow-[0_0_12px_var(--theme-glow-color)] relative z-10" />
                  </div>

                  <div className="col-span-2 sm:col-span-1 space-y-1.5">
                    <div className="flex sm:hidden items-center gap-3 mb-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] text-theme-accent border-theme-accent/20"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </Badge>
                      <div className="w-2.5 h-2.5 rounded-full bg-theme-accent" />
                    </div>

                    <h3 className="font-display text-lg font-medium text-foreground tracking-tight">
                      {item.title}
                    </h3>

                    <div className="font-mono text-xs text-theme-accent/80">
                      {item.date}
                    </div>
                  </div>

                  <p className="col-span-2 sm:col-span-1 text-muted-foreground text-sm leading-relaxed sm:pt-0.5">
                    {item.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};