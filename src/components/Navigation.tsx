'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, BarChart3, Settings, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskStore } from '@/stores/useTaskStore';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/focus', icon: Timer, label: 'Focus' },
  { href: '/stats', icon: BarChart3, label: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const pathname = usePathname();
  const isRunning = useTaskStore((s) => s.pomodoro.isRunning);

  // Hide nav in focus mode when timer is running
  if (pathname === '/focus' && isRunning) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:top-0 md:bottom-auto">
      <div className="mx-auto max-w-lg md:max-w-4xl">
        <div
          className="flex items-center justify-around py-2 px-4 mx-3 mb-3 md:mt-3 md:mb-0
                      rounded-2xl bg-[var(--card)]/80 backdrop-blur-xl
                      border border-[var(--border)] shadow-lg gap-2"
        >
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
