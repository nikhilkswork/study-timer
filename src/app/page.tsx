'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/useTaskStore';
import { TaskList } from '@/components/TaskList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StudySetupFlow } from '@/components/StudySetupFlow';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const checkDailyReset = useTaskStore((s) => s.checkDailyReset);
  const setupStep = useTaskStore((s) => s.setupStep);

  useEffect(() => {
    setMounted(true);
    checkDailyReset();
  }, [checkDailyReset]);

  if (!mounted) return null;

  // Render setup wizard if setup is active
  if (setupStep !== 'inactive') {
    return <StudySetupFlow />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto px-6 py-12 md:py-20 space-y-10"
    >
      {/* ── Sanctuary Header ── */}
      <header className="flex items-end justify-between border-b border-[hsl(var(--border))]/40 pb-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]"
          >
            Sanctuary
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[10px] font-bold tracking-widest uppercase text-[hsl(var(--muted))]"
          >
            {format(new Date(), 'EEEE, MMMM d')}
          </motion.p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Intentions List ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="space-y-4"
      >
        <TaskList />
      </motion.div>

      <footer className="pt-12 text-center opacity-30 hover:opacity-50 transition-opacity">
        <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[hsl(var(--muted))]">
          Silence · Focus · Rest
        </p>
      </footer>
    </motion.div>
  );
}
