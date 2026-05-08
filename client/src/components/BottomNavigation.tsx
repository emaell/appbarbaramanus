import { Home, TrendingUp, BookOpen, FileText, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Hoje', icon: <Home size={22} />, path: '/' },
  { id: 'growth', label: 'Crescer', icon: <TrendingUp size={22} />, path: '/growth' },
  { id: 'diary', label: 'Diário', icon: <BookOpen size={22} />, path: '/diary' },
  { id: 'content', label: 'Conteúdos', icon: <FileText size={22} />, path: '/content' },
  { id: 'profile', label: 'Perfil', icon: <User size={22} />, path: '/profile' },
];

export function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.25rem)] max-w-xl -translate-x-1/2 rounded-[1.75rem] border border-white/70 bg-white/88 px-2 py-2 shadow-[0_18px_50px_rgba(66,48,57,0.18)] backdrop-blur-xl safe-area-inset-bottom dark:border-white/10 dark:bg-card/90">
      <div className="grid grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl px-1 py-2 transition-all duration-200',
                isActive
                  ? 'bg-primary/18 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mb-0.5">{item.icon}</div>
              <span className="text-[11px] font-semibold leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
