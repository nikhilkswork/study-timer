'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, SkipForward, Square, Maximize2, RotateCcw } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { ProgressRing } from './ui/ProgressRing';
import { getProgressPercentage, cn } from '@/lib/utils';
import { useLocalTimer } from '@/hooks/useLocalTimer';
import Link from 'next/link';

interface ActiveSessionProps {
  compact?: boolean;
}

export function ActiveSession({ compact = false }: ActiveSessionProps) {
  const pomodoro = useTaskStore((s) => s.pomodoro);
  const tasks = useTaskStore((s) => s.tasks);
  const pausePomodoro = useTaskStore((s) => s.pausePomodoro);
  const resumePomodoro = useTaskStore((s) => s.resumePomodoro);
  const stopPomodoro = useTaskStore((s) => s.stopPomodoro);
  const skipBreak = useTaskStore((s) => s.skipBreak);
  const resetPomodoro = useTaskStore((s) => s.resetPomodoro);

  const focusDuration = useSettingsStore((s) => s.focusDuration);
  const breakDuration = useSettingsStore((s) => s.breakDuration);

  const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);

  const handleReset = useCallback(() => {
    resetPomodoro();
  }, [resetPomodoro]);

  const wakeLockRef = useRef<any>(null);
  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wakeLockRef.current) return;
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
    } catch (err: any) { console.error(err); }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pomodoro.isRunning) requestWakeLock();
    else releaseWakeLock();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pomodoro.isRunning) requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [pomodoro.isRunning, requestWakeLock, releaseWakeLock]);

  const { timeString, progress: sessionProgress } = useLocalTimer({
    startTime: pomodoro.startTime,
    targetEndTime: pomodoro.targetEndTime,
    pausedAt: pomodoro.pausedAt,
    isRunning: pomodoro.isRunning,
    isInfinite: pomodoro.isInfinite,
    focusDuration,
    breakDuration,
    sessionType: pomodoro.sessionType,
  });

  if (!activeTask || !pomodoro.activeTaskId) return null;

  const totalProgress = activeTask.isInfinite
    ? 0
    : getProgressPercentage(activeTask.elapsedTime, activeTask.totalDuration * 60);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-[2.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden",
        compact ? 'p-8' : 'p-10'
      )}
    >
      <div className="flex flex-col items-center space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pomodoro.sessionType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] glass",
              pomodoro.sessionType === 'focus' ? 'text-[hsl(var(--accent))]' : 'text-emerald-400'
            )}
          >
            {pomodoro.sessionType === 'focus' ? 'Active Focus' : 'Soft Break'}
          </motion.div>
        </AnimatePresence>

        <ProgressRing
          progress={sessionProgress}
          size={compact ? 160 : 240}
          strokeWidth={compact ? 3 : 5}
          color={pomodoro.sessionType === 'focus' ? undefined : '#34d399'}
          isRippling={pomodoro.isRunning && pomodoro.sessionType === 'focus'}
        >
          <div className="text-center">
            <motion.p
              className={cn(
                "font-mono font-medium tracking-tight text-[hsl(var(--foreground))] glow-text",
                compact ? 'text-3xl' : 'text-5xl'
              )}
            >
              {timeString}
            </motion.p>
          </div>
        </ProgressRing>

        <div className="w-full space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] opacity-60">
            <span>Overall Path</span>
            <span>{activeTask.isInfinite ? 'Infinite Mode' : `${totalProgress}%`}</span>
          </div>
          {activeTask.isInfinite ? (
            <p className="text-[11px] text-[hsl(var(--muted))] text-center italic tracking-wide">
              {Math.floor(activeTask.elapsedTime / 60)}m focus logged
            </p>
          ) : (
            <div className="w-full h-[2px] rounded-full bg-[hsl(var(--hover))] overflow-hidden">
              <motion.div
                className="h-full bg-[hsl(var(--accent))] glow-soft"
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={pomodoro.isRunning ? pausePomodoro : resumePomodoro}
            className="p-5 rounded-2xl bg-[hsl(var(--accent))] text-white hover:scale-105 active:scale-95 transition-all glow-soft"
          >
            {pomodoro.isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
          </button>

          <button
            onClick={handleReset}
            className="p-5 rounded-2xl glass text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all"
          >
            <RotateCcw size={20} />
          </button>

          {pomodoro.sessionType === 'break' && (
            <button
              onClick={() => skipBreak(focusDuration)}
              className="p-5 rounded-2xl glass text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all"
            >
              <SkipForward size={20} />
            </button>
          )}

          <button
            onClick={stopPomodoro}
            className="p-5 rounded-2xl glass text-[hsl(var(--muted))] hover:text-red-400 hover:scale-105 active:scale-95 transition-all"
          >
            <Square size={20} />
          </button>

          {!compact && (
            <Link
              href="/focus"
              className="p-5 rounded-2xl glass text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all"
            >
              <Maximize2 size={20} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
