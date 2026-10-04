import React from 'react';
import { UsersRound } from 'lucide-react';

import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  juryMembersData,
  juryOverview,
} from '../../data/jury';

export const JurySection: React.FC = () => {
  return (
    <section id="organizers" className="section relative py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <Reveal>
          <SectionHeading
            code="06 — Jury"
            title="The people who will look at the work."
            subtitle={juryOverview.description}
          />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {juryMembersData.map((member, index) => (
            <Reveal key={member.id} delay={index * 60}>
              <Card className="h-full min-h-[300px] flex flex-col justify-between p-6 sm:p-7 hover:border-theme-primary/50 hover:shadow-lg hover:shadow-theme-primary/10 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-theme-primary/10 border border-theme-primary/20 text-theme-accent">
                      <UsersRound className="w-5 h-5" strokeWidth={1.5} />
                    </div>

                    <span className="font-mono text-xs text-muted-foreground/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="mt-8">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] tracking-wider px-2 py-0.5 text-theme-accent border-theme-accent/20 bg-theme-accent/5"
                    >
                      {member.seatCode}
                    </Badge>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-medium text-foreground tracking-tight">
                    {member.name}
                  </h3>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-1">
                  <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground/70 text-[11px]">
                    {member.organization}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};