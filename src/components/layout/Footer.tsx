import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { eventData } from '../../data/event';

const links = [
  ['About', '#about'],
  ['Tracks', '#tracks'],
  ['Prizes', '#prize'],
  ['Timeline', '#timeline'],
  ['Partners', '#sponsors'],
  ['Jury', '#organizers'],
  ['Rules', '#rules'],
  ['FAQ', '#faq'],
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden pt-24 pb-8 bg-gradient-to-b from-background/80 via-background/95 to-black border-t border-theme-border/40 backdrop-blur-md">
      {/* Atmospheric glow */}
      <div
        aria-hidden="true"
        className="absolute -right-36 -bottom-36 w-[500px] h-[300px] rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, var(--theme-glow-color), transparent 70%)',
        }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-16">
          {/* Brand */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <img
              src="/assets/brand/resurraction-logo.png"
              alt="RESURRACTION"
              className="w-48 h-auto object-contain"
            />

            <p className="max-w-md text-muted-foreground text-sm leading-relaxed">
              A student hackathon organised by the Department of Computer
              Science & Engineering at {eventData.institution}.
            </p>

            <a
              href="#hero"
              className="inline-flex items-center gap-2 pt-2 text-xs font-mono uppercase tracking-widest text-theme-accent hover:opacity-80 transition-opacity"
            >
              Back to top
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-foreground text-xs font-bold uppercase tracking-wider mb-4">
              Explore
            </h4>

            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              {links.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-muted-foreground text-sm hover:text-theme-accent transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Event */}
          <div className="md:col-span-3 lg:col-span-4 space-y-4">
            <h4 className="text-foreground text-xs font-bold uppercase tracking-wider mb-4">
              Event
            </h4>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {eventData.edition}
              <br />
              {eventData.venue}
              <br />
              More details coming soon.
            </p>

            <div className="font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase">
              SECTOR 01 • RESURRECTION
            </div>
          </div>
        </div>

        {/* Bottom */}
        <Separator className="bg-theme-border/30 my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground font-mono text-[11px] tracking-wider">
          <span>
            © {new Date().getFullYear()} RESURRECTION
          </span>

          <span>
            {eventData.department}
          </span>
        </div>
      </div>
    </footer>
  );
};