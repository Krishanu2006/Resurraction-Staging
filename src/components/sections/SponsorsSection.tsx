import React from 'react';
import {
  Handshake,
  ArrowUpRight,
} from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  sponsorTiers,
  sponsorsOverview,
} from '../../data/sponsors';

export const SponsorsSection: React.FC = () => {
  return (
    <section id="sponsors" className="section relative py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <SectionHeading
            code="05 — Partners"
            title="Built with people who back good ideas."
            subtitle={sponsorsOverview.description}
          />
        </Reveal>

        <div className="space-y-6 mt-10">
          {sponsorTiers.map((tier, index) => (
            <Reveal key={tier.id} delay={index * 60}>
              <Card className="hover:border-theme-primary/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] tracking-wider px-2 py-0.5 text-theme-accent border-theme-accent/20 bg-theme-accent/5 uppercase"
                    >
                      {tier.badge}
                    </Badge>
                    <CardTitle className="mt-2 text-2xl font-display font-medium text-foreground">
                      {tier.tierName}
                    </CardTitle>
                  </div>

                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-theme-primary/10 border border-theme-primary/20 text-theme-accent shrink-0">
                    <Handshake className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                </CardHeader>

                <CardContent>
                  <div
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
                    }}
                  >
                    {tier.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="min-h-[110px] p-4 flex flex-col justify-between rounded-lg border border-[color-mix(in_srgb,var(--theme-border)_45%,rgba(255,255,255,0.08))] bg-[color-mix(in_srgb,var(--theme-surface)_72%,rgba(0,0,0,0.65))] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-theme-accent/50 hover:bg-theme-accent/10 transition-all duration-200"
                        style={{
                          WebkitBackdropFilter: 'blur(12px)',
                          backdropFilter: 'blur(12px)',
                        }}
                      >
                        <span className="text-foreground/90 text-sm font-medium">
                          {slot.label.replace(' // INCOMING', '')}
                        </span>

                        <span className="flex items-center gap-2 font-mono text-[9px] tracking-wider text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-theme-accent shadow-[0_0_8px_var(--theme-glow-color)] animate-pulse" />
                          {slot.note.replace(
                            'CLEARANCE IN PROGRESS',
                            'COMING SOON'
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={220}>
          <a
            href="#faq"
            className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-theme-accent hover:underline transition-colors"
          >
            Partnership information
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};