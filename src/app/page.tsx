'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { TaskList } from '@/components/TaskList';
import { ActiveSession } from '@/components/ActiveSession';
import { StatsOverview } from '@/components/StatsOverview';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { format } from 'date-fns';

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

  // Watch for task completions to trigger confetti
  const completedCount = tasks.filter((t) => t.completed).length;
  const prevCompletedRef = useEffect(() => {
    // Skip initial mount
  }, []);

  const lastCompletedCountRef = useState(completedCount);

  useEffect(() => {
    if (completedCount > lastCompletedCountRef[0] && mounted) {
      setShowConfetti(true);
    }
    lastCompletedCountRef[0] = completedCount;
  }, [completedCount, mounted, lastCompletedCountRef]);

  const handleStartTask = useCallback(
    (taskId: string) => {
      startPomodoro(taskId, focusDuration);
      router.push('/focus');
    },
    [startPomodoro, focusDuration, router]
  );

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Focus</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Active Timer */}
      {activeTaskId && <ActiveSession compact />}

      {/* Task List */}
      <TaskList onStartTask={handleStartTask} />
    </div>
  );
}
