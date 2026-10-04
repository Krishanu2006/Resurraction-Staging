import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { faqData } from '../../data/faq';
import { cn } from '@/lib/utils';

export const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="faq" className="section relative py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <SectionHeading
            code="08 — FAQ"
            title="Questions, answered."
            subtitle="A few things people usually want to know before joining. More information will be added as the event gets closer."
          />
        </Reveal>

        <div className="max-w-[950px] mx-auto mt-10 space-y-3">
          {faqData.map((item, index) => {
            const active = open === item.id;

            return (
              <Reveal key={item.id} delay={index * 35}>
                <Card
                  className={cn(
                    'overflow-hidden transition-all duration-300 border border-theme-border/50 bg-theme-card-bg/60 backdrop-blur-md hover:border-theme-primary/40',
                    active && 'border-theme-primary/60 shadow-lg shadow-theme-primary/10'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(active ? null : item.id)}
                    aria-expanded={active}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      <Badge
                        variant={active ? 'default' : 'outline'}
                        className="font-mono text-[10px] tracking-wider px-2 py-0.5 shrink-0"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </Badge>
                      <span
                        className={cn(
                          'font-display text-base sm:text-lg font-medium transition-colors',
                          active ? 'text-theme-accent' : 'text-foreground'
                        )}
                      >
                        {item.question}
                      </span>
                    </div>

                    <ChevronDown
                      className={cn(
                        'w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-300',
                        active && 'rotate-180 text-theme-accent'
                      )}
                    />
                  </button>

                  {active && (
                    <CardContent className="pt-0 pb-6 px-5 sm:px-6">
                      <div className="w-8 h-[2px] mb-4 bg-theme-accent rounded-full opacity-80" />
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                        {item.answer}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};