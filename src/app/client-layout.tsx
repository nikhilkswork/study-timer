'use client';

import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAmbientSoundSync } from '@/hooks/useAmbientSoundSync';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { useEffect } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { playNotificationSound, playCompletionSound } from '@/lib/audio';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useAmbientSoundSync();

  const pomodoro = useTaskStore((s) => s.pomodoro);
  const startBreak = useTaskStore((s) => s.startBreak);
  const startNextFocus = useTaskStore((s) => s.startNextFocus);
  const updateTaskProgress = useTaskStore((s) => s.updateTaskProgress);

  const notificationSound = useSettingsStore((s) => s.notificationSound);
  const recordFocusMinutes = useStatsStore((s) => s.recordFocusMinutes);
  const tickPomodoro = useTaskStore((s) => s.tickPomodoro);



  // --- INTERVAL TIMER ---
  useEffect(() => {
    if (!pomodoro.isRunning) return;

    const interval = setInterval(() => {
      // 1. Tick the store state to update live seconds
      tickPomodoro();

      // 2. Fetch fresh state for transitions
      const currentPomodoro = useTaskStore.getState().pomodoro;
      const activeTask = useTaskStore.getState().tasks.find((t) => t.id === currentPomodoro.activeTaskId);

      // 3. Live increment elapsed seconds for focus phase
      if (currentPomodoro.sessionType === 'focus' && activeTask) {
        const newElapsed = activeTask.elapsedTime + 1;
        updateTaskProgress(activeTask.id, newElapsed, activeTask.pomodorosCompleted);

        // Every 60 seconds of focus, record 1 minute to stats
        if (newElapsed > 0 && newElapsed % 60 === 0) {
          recordFocusMinutes(1);
        }
      }

      // 4. Expiry transitions
      if (currentPomodoro.mode !== 'stopwatch' && currentPomodoro.remainingSeconds <= 0) {
        if (currentPomodoro.mode === 'timer') {
          // Timer finished
          if (notificationSound) {
            playCompletionSound();
          }
          const exitStudySession = useTaskStore.getState().exitStudySession;
          exitStudySession();
        } else {
          // Pomodoro mode work/break loop
          if (currentPomodoro.sessionType === 'focus') {
            if (activeTask) {
              // Log completed pomodoro count
              const newPomodoros = activeTask.pomodorosCompleted + 1;
              updateTaskProgress(activeTask.id, activeTask.elapsedTime, newPomodoros);
            }

            if (notificationSound) {
              playNotificationSound();
            }
            startBreak(currentPomodoro.breakDuration);
          } else {
            // Break is over
            if (notificationSound) {
              playNotificationSound();
            }
            startNextFocus(currentPomodoro.focusDuration);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    pomodoro.isRunning,
    tickPomodoro,
    recordFocusMinutes,
    updateTaskProgress,
    startBreak,
    startNextFocus,
    notificationSound,
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
