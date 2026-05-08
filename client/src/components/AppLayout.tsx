import React from 'react';
import { BottomNavigation } from './BottomNavigation';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export function AppLayout({ children, showNavigation = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(252,234,229,0.95),transparent_34%),radial-gradient(circle_at_top_right,rgba(234,245,239,0.85),transparent_30%),linear-gradient(180deg,#FFFAF7_0%,#FFF6F2_46%,#FFFFFF_100%)] text-foreground flex flex-col">
      <main className={cn('flex-1 overflow-y-auto', showNavigation && 'pb-28')}>
        <div className="mx-auto min-h-screen w-full max-w-5xl bg-white/62 backdrop-blur-sm shadow-[0_0_80px_rgba(173,98,132,0.08)] sm:my-4 sm:rounded-[2rem] sm:border sm:border-white/70">
          {children}
        </div>
      </main>
      {showNavigation && <BottomNavigation />}
    </div>
  );
}
