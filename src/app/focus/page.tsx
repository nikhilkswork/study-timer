'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, SkipForward, Square, ArrowLeft, Minimize2 } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AnimatedTimer } from '@/components/ui/AnimatedTimer';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { AmbientSounds } from '@/components/AmbientSounds';
import { getProgressPercentage } from '@/lib/utils';
import { playNotificationSound, playCompletionSound } from '@/lib/audio';
import Link from 'next/link';

export default function FocusPage() {
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================
  // INACTIVITY DETECTION
  // ==========================================
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (pomodoro.isRunning) {
      idleTimerRef.current = setTimeout(() => setIsIdle(true), 5000);
    }
  }, [pomodoro.isRunning]);

  useEffect(() => {
    resetIdleTimer();

    const events = ['mousemove', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'keydown'];
    const handler = () => resetIdleTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // ==========================================
  // POMODORO SESSION END HANDLER
  // ==========================================
  const handleSessionEnd = useCallback(() => {
    if (!activeTask) return;

    if (pomodoro.sessionType === 'focus') {
      const focusMins = Math.floor(focusSecondsRef.current / 60);
      if (focusMins > 0) recordFocusMinutes(focusMins);
      focusSecondsRef.current = 0;

      const newElapsed = activeTask.elapsedTime + focusDuration * 60;
      const newPomodoros = activeTask.pomodorosCompleted + 1;
      updateTaskProgress(activeTask.id, newElapsed, newPomodoros);

      if (newElapsed >= activeTask.totalDuration * 60) {
        completeTask(activeTask.id);
        recordTaskCompletion();
        if (notificationSound) playCompletionSound();
        setShowConfetti(true);
        return;
      }

      if (notificationSound) playNotificationSound();
      startBreak(breakDuration);
    } else {
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

  // ==========================================
  // TIMER TICK
  // ==========================================
  useEffect(() => {
    if (!pomodoro.isRunning || !pomodoro.activeTaskId) {
      lastTickRef.current = null;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current && pomodoro.sessionType === 'focus') {
        focusSecondsRef.current += (now - lastTickRef.current) / 1000;
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

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ==========================================
  // NO ACTIVE TASK
  // ==========================================
  if (!activeTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[var(--hover)] flex items-center justify-center mx-auto">
            <Play size={32} className="text-[var(--muted)] ml-1" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">No Active Session</h2>
          <p className="text-sm text-[var(--muted)] max-w-xs">
            Start a Pomodoro session from your dashboard to enter focus mode.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
                       hover:opacity-90 transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // COMPUTED VALUES
  // ==========================================
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

  // ==========================================
  // RENDER — ACTIVE FOCUS MODE
  // ==========================================
  return (
    <div
      className="flex flex-col items-center min-h-dvh px-4 relative select-none"
      onMouseMove={resetIdleTimer}
      onTouchStart={resetIdleTimer}
    >
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* ── Back button ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0 : 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="absolute top-6 left-6 z-10"
      >
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)]
                     hover:text-[var(--foreground)] transition-all block"
        >
          <Minimize2 size={20} />
        </Link>
      </motion.div>

      {/* ── Top spacer ── */}
      <div className="flex-1 min-h-8" />

      {/* ── Session Type Badge ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? -10 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <motion.div
          key={pomodoro.sessionType}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${
            pomodoro.sessionType === 'focus'
              ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
              : 'bg-emerald-500/15 text-emerald-400'
          }`}
        >
          {pomodoro.sessionType === 'focus' ? '🎯 Deep Focus' : '☕ Take a Break'}
        </motion.div>
      </motion.div>

      {/* ── Main Timer Ring + Animated Timer ── */}
      <motion.div
        animate={{
          scale: isIdle ? 1.12 : 1,
        }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <ProgressRing
          progress={sessionProgress}
          size={isIdle ? 280 : 240}
          strokeWidth={isIdle ? 5 : 7}
          color={pomodoro.sessionType === 'focus' ? undefined : '#34d399'}
        >
          <div className="text-center">
            <AnimatedTimer
              time={pomodoro.timeRemaining}
              enlarged={isIdle}
            />
            {/* Task title — fades out in idle */}
            <motion.p
              animate={{ opacity: isIdle ? 0 : 0.5 }}
              transition={{ duration: 0.6 }}
              className="text-sm text-[var(--muted)] mt-2 max-w-[180px] truncate"
            >
              {activeTask.title}
            </motion.p>
          </div>
        </ProgressRing>
      </motion.div>

      {/* ── Minimal session indicator (visible in idle) ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0.4 : 0, y: isIdle ? 0 : 5 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="mt-3 pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              pomodoro.sessionType === 'focus' ? 'bg-[var(--accent)]' : 'bg-emerald-400'
            } animate-pulse`}
          />
          <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-widest">
            {pomodoro.sessionType === 'focus' ? 'Focusing' : 'Break'}
          </span>
        </div>
      </motion.div>

      {/* ── Task Progress Bar ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? 10 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="w-full max-w-xs mt-6 space-y-2"
      >
        <div className="flex justify-between text-xs text-[var(--muted)]">
          <span>Overall progress</span>
          <span>{totalProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--hover)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-center text-[var(--muted)]">
          Pomodoro {activeTask.pomodorosCompleted + 1} of {activeTask.pomodorosTotal}
        </p>
      </motion.div>

      {/* ── Controls ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? 20 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="flex items-center gap-3 mt-8"
        style={{ pointerEvents: isIdle ? 'none' : 'auto' }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            pomodoro.isRunning ? pausePomodoro() : resumePomodoro();
          }}
          className="p-4 rounded-2xl bg-[var(--accent)] text-white hover:opacity-90 
                     transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20"
        >
          {pomodoro.isRunning ? <Pause size={24} /> : <Play size={24} fill="white" />}
        </button>

        {pomodoro.sessionType === 'break' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              skipBreak(focusDuration);
            }}
            className="p-4 rounded-2xl bg-[var(--hover)] text-[var(--foreground)]
                       hover:bg-[var(--border)] transition-all active:scale-95"
          >
            <SkipForward size={24} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            stopPomodoro();
          }}
          className="p-4 rounded-2xl bg-[var(--hover)] text-[var(--muted)]
                     hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95"
        >
          <Square size={24} />
        </button>
      </motion.div>

      {/* ── Bottom spacer ── */}
      <div className="flex-1 min-h-4" />

      {/* ── Ambient Sounds ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? 15 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="w-full max-w-xs pb-6"
        style={{ pointerEvents: isIdle ? 'none' : 'auto' }}
      >
        <AmbientSounds />
      </motion.div>
    </div>
  );
}
