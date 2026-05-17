'use client';

import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAmbientSoundSync } from '@/hooks/useAmbientSoundSync';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { playNotificationSound, playCompletionSound } from '@/lib/audio';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useAmbientSoundSync();

  const pomodoro = useTaskStore((s) => s.pomodoro);
  const tasks = useTaskStore((s) => s.tasks);
  const startBreak = useTaskStore((s) => s.startBreak);
  const startNextFocus = useTaskStore((s) => s.startNextFocus);
  const stopPomodoro = useTaskStore((s) => s.stopPomodoro);
  const completeTask = useTaskStore((s) => s.completeTask);
  const updateTaskProgress = useTaskStore((s) => s.updateTaskProgress);

  const focusDuration = useSettingsStore((s) => s.focusDuration);
  const breakDuration = useSettingsStore((s) => s.breakDuration);
  const notificationSound = useSettingsStore((s) => s.notificationSound);

  const recordFocusMinutes = useStatsStore((s) => s.recordFocusMinutes);
  const recordTaskCompletion = useStatsStore((s) => s.recordTaskCompletion);

  const lastCommittedRef = useRef(0);

  // Sync / Reset committed seconds on start/stop/pause
  useEffect(() => {
    if (!pomodoro.isRunning) {
      lastCommittedRef.current = 0;
    }
  }, [pomodoro.isRunning, pomodoro.startTime]);

  useEffect(() => {
    if (!pomodoro.isRunning || !pomodoro.activeTaskId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const activeTask = useTaskStore.getState().tasks.find((t) => t.id === pomodoro.activeTaskId);
      if (!activeTask) return;

      if (pomodoro.isInfinite) {
        // --- INFINITE COUNT-UP PROGRESS AUTO-COMMIT ENGINE (Once a minute) ---
        const totalElapsed = Math.floor((now - (pomodoro.startTime || now)) / 1000);
        const delta = totalElapsed - lastCommittedRef.current;
        if (delta >= 60) {
          const focusMins = Math.floor(delta / 60);
          if (focusMins > 0) recordFocusMinutes(focusMins);
          updateTaskProgress(activeTask.id, activeTask.elapsedTime + delta, activeTask.pomodorosCompleted);
          lastCommittedRef.current = totalElapsed;
        }
      } else {
        // --- COUNTDOWN EXPIRY ENGINE ---
        if (pomodoro.targetEndTime && now >= pomodoro.targetEndTime) {
          if (pomodoro.sessionType === 'focus') {
            recordFocusMinutes(focusDuration);
            const newElapsed = activeTask.elapsedTime + focusDuration * 60;
            const newPomodoros = activeTask.pomodorosCompleted + 1;
            updateTaskProgress(activeTask.id, newElapsed, newPomodoros);

            if (!activeTask.isInfinite && newElapsed >= activeTask.totalDuration * 60) {
              completeTask(activeTask.id);
              recordTaskCompletion();
              if (notificationSound) playCompletionSound();
              stopPomodoro();
              return;
            }

            if (notificationSound) playNotificationSound();
            startBreak(breakDuration);
          } else {
            // Break is over!
            if (notificationSound) playNotificationSound();
            if (pomodoro.isInfiniteLoop) {
              startNextFocus(focusDuration);
            } else {
              stopPomodoro();
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    pomodoro.isRunning,
    pomodoro.activeTaskId,
    pomodoro.isInfinite,
    pomodoro.sessionType,
    pomodoro.targetEndTime,
    pomodoro.startTime,
    pomodoro.isInfiniteLoop,
    focusDuration,
    breakDuration,
    notificationSound,
    recordFocusMinutes,
    recordTaskCompletion,
    updateTaskProgress,
    completeTask,
    startBreak,
    startNextFocus,
    stopPomodoro,
  ]);

  return (
    <ThemeProvider>
      <AmbientBackground />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1 pb-20 md:pt-16 md:pb-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Navigation />
    </ThemeProvider>
  );
}
