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
  }, [activeTask, pomodoro.sessionType, focusDuration, breakDuration, notificationSound, completeTask, recordFocusMinutes, recordTaskCompletion, startBreak, startNextFocus, updateTaskProgress]);

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

  if (!mounted) return null;

  if (!activeTask) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="w-24 h-24 rounded-[2rem] bg-[hsl(var(--hover))] flex items-center justify-center mx-auto shadow-inner">
            <Play size={32} className="text-[hsl(var(--muted))] ml-1" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Quiet Workspace</h2>
            <p className="text-sm text-[hsl(var(--muted))] max-w-xs mx-auto text-balance">
              Start a session from your sanctuary to enter this focus space.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[hsl(var(--accent))] text-white text-sm font-medium hover:opacity-90 transition-all active:scale-95 glow-soft">
            <ArrowLeft size={16} />
            Back to Sanctuary
          </Link>
        </motion.div>
      </div>
    );
  }

  const sessionDuration = pomodoro.sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const sessionProgress = getProgressPercentage(sessionDuration - pomodoro.timeRemaining, sessionDuration);
  const totalProgress = getProgressPercentage(activeTask.elapsedTime, activeTask.totalDuration * 60);

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 relative select-none overflow-hidden" onMouseMove={resetIdleTimer} onTouchStart={resetIdleTimer}>
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* ── Atmospheric Background ── */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <motion.div 
          animate={{ opacity: isIdle ? 0.08 : 0.03, scale: isIdle ? 1.2 : 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror' }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[hsl(var(--accent))] blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: isIdle ? 0.06 : 0.02, scale: isIdle ? 1.1 : 1 }}
          transition={{ duration: 15, repeat: Infinity, repeatType: 'mirror', delay: 2 }}
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--accent))] blur-[100px]"
        />
      </div>

      {/* ── Navigation ── */}
      <motion.div animate={{ opacity: isIdle ? 0 : 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="absolute top-8 left-8 z-10">
        <Link href="/" className="p-3 rounded-2xl glass hover:bg-[hsl(var(--hover))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all block group">
          <Minimize2 size={20} className="group-hover:scale-90 transition-transform" />
        </Link>
      </motion.div>

      <div className="flex-1 min-h-[15vh]" />

      {/* ── Status ── */}
      <motion.div animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? -20 : 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
        <motion.div key={pomodoro.sessionType} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-12 glass ${
          pomodoro.sessionType === 'focus' ? 'text-[hsl(var(--accent))]' : 'text-emerald-400'
        }`}>
          {pomodoro.sessionType === 'focus' ? 'Deep Focus' : 'Soft Break'}
        </motion.div>
      </motion.div>

      {/* ── Core Timer ── */}
      <motion.div animate={{ scale: isIdle ? 1.15 : 1, y: isIdle ? 20 : 0 }} transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}>
        <ProgressRing progress={sessionProgress} size={isIdle ? 320 : 280} strokeWidth={4} color={pomodoro.sessionType === 'focus' ? undefined : '#34d399'}>
          <div className="text-center">
            <AnimatedTimer time={pomodoro.timeRemaining} enlarged={isIdle} />
            <motion.p animate={{ opacity: isIdle ? 0 : 0.4 }} transition={{ duration: 1.2 }} className="text-xs font-medium tracking-[0.2em] uppercase text-[hsl(var(--muted))] mt-6 max-w-[200px] truncate mx-auto">
              {activeTask.title}
            </motion.p>
          </div>
        </ProgressRing>
      </motion.div>

      {/* ── Inactivity Feedback ── */}
      <motion.div animate={{ opacity: isIdle ? 0.3 : 0, y: isIdle ? 0 : 10 }} transition={{ duration: 2 }} className="mt-8 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${pomodoro.sessionType === 'focus' ? 'bg-[hsl(var(--accent))]' : 'bg-emerald-400'} animate-pulse`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--muted))]">
            Focus Breathing
          </span>
        </div>
      </motion.div>

      {/* ── Progress & Controls ── */}
      <div className="w-full max-w-sm mt-auto pb-12 flex flex-col items-center">
        <motion.div animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? 40 : 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="w-full space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] opacity-60">
              <span>Overall Journey</span>
              <span>{totalProgress}%</span>
            </div>
            <div className="w-full h-[3px] rounded-full bg-[hsl(var(--hover))] overflow-hidden">
              <motion.div className="h-full bg-[hsl(var(--accent))] glow-soft" animate={{ width: `${totalProgress}%` }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button onClick={pomodoro.isRunning ? pausePomodoro : resumePomodoro} className="p-6 rounded-[2rem] glass text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all glow-soft">
              {pomodoro.isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" fill="currentColor" />}
            </button>

            {pomodoro.sessionType === 'break' && (
              <button onClick={() => skipBreak(focusDuration)} className="p-6 rounded-[2rem] glass text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] hover:scale-105 active:scale-95 transition-all">
                <SkipForward size={24} />
              </button>
            )}

            <button onClick={stopPomodoro} className="p-6 rounded-[2rem] glass text-[hsl(var(--muted))] hover:text-red-400 hover:scale-105 active:scale-95 transition-all">
              <Square size={24} />
            </button>
          </div>

          <div className="pt-4">
            <AmbientSounds />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
