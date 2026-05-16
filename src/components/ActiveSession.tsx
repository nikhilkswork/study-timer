'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, SkipForward, Square, Maximize2 } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { ProgressRing } from './ui/ProgressRing';
import { formatTime, getProgressPercentage } from '@/lib/utils';
import { playNotificationSound, playCompletionSound } from '@/lib/audio';
import Link from 'next/link';

interface ActiveSessionProps {
  compact?: boolean;
}

export function ActiveSession({ compact = false }: ActiveSessionProps) {
  const pomodoro = useTaskStore((s) => s.pomodoro);
  const tasks = useTaskStore((s) => s.tasks);
  const tickPomodoro = useTaskStore((s) => s.tickPomodoro);
  const pausePomodoro = useTaskStore((s) => s.pausePomodoro);
  const resumePomodoro = useTaskStore((s) => s.resumePomodoro);
  const stopPomodoro = useTaskStore((s) => s.stopPomodoro);
  const skipBreak = useTaskStore((s) => s.skipBreak);
  const startBreak = useTaskStore((s) => s.startBreak);
  const startNextFocus = useTaskStore((s) => s.startNextFocus);
  const completeTask = useTaskStore((s) => s.completeTask);
  const updateTaskProgress = useTaskStore((s) => s.updateTaskProgress);

  const focusDuration = useSettingsStore((s) => s.focusDuration);
  const breakDuration = useSettingsStore((s) => s.breakDuration);
  const notificationSound = useSettingsStore((s) => s.notificationSound);

  const recordFocusMinutes = useStatsStore((s) => s.recordFocusMinutes);
  const recordTaskCompletion = useStatsStore((s) => s.recordTaskCompletion);

  const focusSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);

  const handleSessionEnd = useCallback(() => {
    if (!activeTask) return;

    if (pomodoro.sessionType === 'focus') {
      // Record accumulated focus time
      const focusMins = Math.floor(focusSecondsRef.current / 60);
      if (focusMins > 0) {
        recordFocusMinutes(focusMins);
      }
      focusSecondsRef.current = 0;

      // Check if task is complete
      const newElapsed = activeTask.elapsedTime + focusDuration * 60;
      const newPomodoros = activeTask.pomodorosCompleted + 1;
      updateTaskProgress(activeTask.id, newElapsed, newPomodoros);

      if (newElapsed >= activeTask.totalDuration * 60) {
        // Task complete!
        completeTask(activeTask.id);
        recordTaskCompletion();
        if (notificationSound) playCompletionSound();
        return;
      }

      // Start break
      if (notificationSound) playNotificationSound();
      startBreak(breakDuration);
    } else {
      // Break ended → start next focus
      if (notificationSound) playNotificationSound();
      startNextFocus(focusDuration);
    }
  }, [
    activeTask, pomodoro.sessionType, focusDuration, breakDuration,
    notificationSound, completeTask, recordFocusMinutes, recordTaskCompletion,
    startBreak, startNextFocus, updateTaskProgress
  ]);

  // ==========================================
  // SCREEN WAKE LOCK
  // ==========================================
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wakeLockRef.current) return;
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      console.log('Wake Lock is active');
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Wake Lock released');
    }
  }, []);

  useEffect(() => {
    if (pomodoro.isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pomodoro.isRunning) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [pomodoro.isRunning, requestWakeLock, releaseWakeLock]);

  // Timer tick
  useEffect(() => {
    if (!pomodoro.isRunning || !pomodoro.activeTaskId) {
      lastTickRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();

      if (lastTickRef.current) {
        const elapsed = (now - lastTickRef.current) / 1000;
        if (pomodoro.sessionType === 'focus') {
          focusSecondsRef.current += elapsed;
        }
      }
      lastTickRef.current = now;

      const currentTime = useTaskStore.getState().pomodoro.timeRemaining;
      if (currentTime <= 1) {
        handleSessionEnd();
      } else {
        tickPomodoro();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoro.isRunning, pomodoro.activeTaskId, pomodoro.sessionType, tickPomodoro, handleSessionEnd]);

  if (!activeTask || !pomodoro.activeTaskId) return null;

  const sessionDuration =
    pomodoro.sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const sessionProgress = getProgressPercentage(
    sessionDuration - pomodoro.timeRemaining,
    sessionDuration
  );

  const totalProgress = getProgressPercentage(
    activeTask.elapsedTime,
    activeTask.totalDuration * 60
  );

  const ringSize = compact ? 120 : 200;
  const strokeW = compact ? 4 : 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Session type badge */}
        <motion.div
          key={pomodoro.sessionType}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
            pomodoro.sessionType === 'focus'
              ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
              : 'bg-emerald-500/15 text-emerald-400'
          }`}
        >
          {pomodoro.sessionType === 'focus' ? '🎯 Focus' : '☕ Break'}
        </motion.div>

        {/* Progress ring with timer */}
        <ProgressRing
          progress={sessionProgress}
          size={ringSize}
          strokeWidth={strokeW}
          color={pomodoro.sessionType === 'focus' ? undefined : '#34d399'}
        >
          <div className="text-center">
            <motion.p
              key={pomodoro.timeRemaining}
              className={`font-mono font-bold text-[var(--foreground)] ${
                compact ? 'text-2xl' : 'text-4xl'
              }`}
            >
              {formatTime(pomodoro.timeRemaining)}
            </motion.p>
            {!compact && (
              <p className="text-xs text-[var(--muted)] mt-1 truncate max-w-[150px]">
                {activeTask.title}
              </p>
            )}
          </div>
        </ProgressRing>

        {/* Task progress */}
        {!compact && (
          <div className="w-full mt-4 space-y-1">
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Task progress</span>
              <span>{totalProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--hover)]">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={pomodoro.isRunning ? pausePomodoro : resumePomodoro}
            className="p-3 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 
                       transition-all duration-200 active:scale-95"
          >
            {pomodoro.isRunning ? <Pause size={18} /> : <Play size={18} fill="white" />}
          </button>

          {pomodoro.sessionType === 'break' && (
            <button
              onClick={() => skipBreak(focusDuration)}
              className="p-3 rounded-xl bg-[var(--hover)] text-[var(--foreground)]
                         hover:bg-[var(--border)] transition-all duration-200 active:scale-95"
              title="Skip break"
            >
              <SkipForward size={18} />
            </button>
          )}

          <button
            onClick={stopPomodoro}
            className="p-3 rounded-xl bg-[var(--hover)] text-[var(--muted)]
                       hover:bg-red-500/10 hover:text-red-400 
                       transition-all duration-200 active:scale-95"
            title="Stop"
          >
            <Square size={18} />
          </button>

          {!compact && (
            <Link
              href="/focus"
              className="p-3 rounded-xl bg-[var(--hover)] text-[var(--muted)]
                         hover:text-[var(--foreground)] transition-all duration-200 active:scale-95"
              title="Focus mode"
            >
              <Maximize2 size={18} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
