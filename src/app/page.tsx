'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/useTaskStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { TaskList } from '@/components/TaskList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StudySetupFlow } from '@/components/StudySetupFlow';
import { FocusSession } from '@/components/FocusSession';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const checkDailyReset = useTaskStore((s) => s.checkDailyReset);
  const setupStep = useTaskStore((s) => s.setupStep);
  const activeTaskId = useTaskStore((s) => s.pomodoro.activeTaskId);
  const totalFocusMinutes = useStatsStore((s) => s.totalFocusMinutes);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    checkDailyReset();
    return () => cancelAnimationFrame(handle);
  }, [checkDailyReset]);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {setupStep !== 'inactive' ? (
        <motion.div
          key="setup-flow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <StudySetupFlow />
        </motion.div>
      ) : activeTaskId !== null ? (
        <motion.div
          key="focus-session"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <FocusSession />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto px-6 py-12 md:py-20 space-y-8"
        >
          {/* ── Header ── */}
          <header className="flex items-end justify-between border-b border-[hsl(var(--border))]/40 pb-6">
            <div className="space-y-1">
              <motion.h1
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl text-[hsl(var(--foreground))] font-serif italic tracking-wide font-light"
              >
                Comodoro
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-[10px] font-bold tracking-widest uppercase text-[hsl(var(--muted))]"
              >
                {format(new Date(), 'EEEE, MMMM d')}
              </motion.p>
            </div>
            <ThemeToggle />
          </header>

          {/* ── Intentions List ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <TaskList />
          </motion.div>

          <footer className="pt-12 text-center opacity-30 hover:opacity-50 transition-opacity duration-300">
            <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[hsl(var(--muted))]">
              Silence · Focus · Rest
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
