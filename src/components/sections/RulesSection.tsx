import React from 'react';
import { ChevronDown } from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  rulesData,
  rulesOverview,
} from '../../data/rules';

export const RulesSection: React.FC = () => {
  return (
    <section id="rules" className="section relative py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <SectionHeading
            code="07 — Rules"
            title="A few things worth knowing."
            subtitle={rulesOverview.description}
          />
        </Reveal>

        <div className="max-w-[1050px] mx-auto mt-10 space-y-4">
          {rulesData.map((category, index) => (
            <Reveal key={category.id} delay={index * 40}>
              <Card className="group overflow-hidden hover:border-theme-primary/50 transition-all duration-300">
                <details className="rule-item">
                  <summary className="list-none cursor-pointer flex items-center justify-between gap-4 p-5 sm:p-6 select-none transition-colors">
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] tracking-wider px-2 py-0.5 text-theme-accent border-theme-accent/30 shrink-0"
                      >
                        {category.code}
                      </Badge>

                      <div>
                        <strong className="block text-foreground font-display text-base sm:text-lg font-medium group-hover:text-theme-accent transition-colors">
                          {category.category}
                        </strong>
                        <small className="block mt-1 text-muted-foreground text-xs sm:text-sm leading-relaxed">
                          {category.summary}
                        </small>
                      </div>
                    </div>

                    <ChevronDown className="rule-chevron w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300" />
                  </summary>

                  <CardContent className="pt-2 pb-6 px-5 sm:px-8 border-t border-theme-border/30">
                    <div className="space-y-4 pt-4">
                      {category.rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="pt-3 border-t border-white/5 first:border-0 first:pt-0"
                        >
                          <strong className="text-foreground text-sm font-semibold tracking-wide">
                            {rule.title}
                          </strong>
                          <p className="mt-1 text-muted-foreground text-xs sm:text-sm leading-relaxed">
                            {rule.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </details>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .rule-item summary::-webkit-details-marker {
          display: none;
        }

        .rule-item[open] .rule-chevron {
          transform: rotate(180deg);
          color: var(--theme-accent);
        }
      `}</style>
    </section>
  );
};