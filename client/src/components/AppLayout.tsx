import React from 'react';
import { BottomNavigation } from './BottomNavigation';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export function AppLayout({ children, showNavigation = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,232,240,0.95),transparent_32%),linear-gradient(180deg,#fffaf7_0%,#f9fbf8_48%,#fff_100%)] text-foreground flex flex-col">
      <main className={cn('flex-1 overflow-y-auto', showNavigation && 'pb-28')}>
        <div className="mx-auto min-h-screen w-full max-w-5xl bg-white/55 backdrop-blur-sm shadow-[0_0_80px_rgba(173,98,132,0.08)] sm:my-4 sm:rounded-[2rem] sm:border sm:border-white/70">
          {children}
        </div>
      </main>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
