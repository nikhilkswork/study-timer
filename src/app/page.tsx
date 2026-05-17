'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { TaskList } from '@/components/TaskList';
import { ActiveSession } from '@/components/ActiveSession';
import { StatsOverview } from '@/components/StatsOverview';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { format } from 'date-fns';
import { initAudioContext } from '@/lib/audio';

export default function DashboardPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  const checkDailyReset = useTaskStore((s) => s.checkDailyReset);
  const startPomodoro = useTaskStore((s) => s.startPomodoro);
  const activeTaskId = useTaskStore((s) => s.pomodoro.activeTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const focusDuration = useSettingsStore((s) => s.focusDuration);
  const setTotalTasksForToday = useStatsStore((s) => s.setTotalTasksForToday);

  useEffect(() => {
    setMounted(true);
    checkDailyReset();
  }, [checkDailyReset]);

  useEffect(() => {
    setTotalTasksForToday(tasks.length);
  }, [tasks.length, setTotalTasksForToday]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const lastCompletedCountRef = useState(completedCount);

  useEffect(() => {
    if (completedCount > lastCompletedCountRef[0] && mounted) {
      setShowConfetti(true);
    }
    lastCompletedCountRef[0] = completedCount;
  }, [completedCount, mounted, lastCompletedCountRef]);

  const handleStartTask = useCallback(
    (taskId: string) => {
      initAudioContext();
      startPomodoro(taskId, focusDuration);
      router.push('/focus');
    },
    [startPomodoro, focusDuration, router]
  );

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-xl mx-auto px-6 py-12 md:py-20 space-y-12"
    >
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* ── Sanctuary Header ── */}
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))] glow-text"
          >
            Sanctuary
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-sm font-medium tracking-wide uppercase text-[hsl(var(--muted))]"
          >
            {format(new Date(), 'EEEE, MMMM d')}
          </motion.p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Journey Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <StatsOverview />
      </motion.div>

      {/* ── Active Session ── */}
      <AnimatePresence mode="popLayout">
        {activeTaskId && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <ActiveSession compact />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Intentions List ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted))] opacity-60">
            Today&apos;s Intentions
          </h2>
        </div>
        <TaskList onStartTask={handleStartTask} />
      </motion.div>

      <footer className="pt-12 text-center opacity-20 hover:opacity-40 transition-opacity">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold">
          Rest. Focus. Repeat.
        </p>
      </footer>
    </motion.div>
  );
}
