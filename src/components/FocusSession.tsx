'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, LogOut } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AnimatedTimer } from '@/components/ui/AnimatedTimer';
import { AmbientSounds } from '@/components/AmbientSounds';
import { useLocalTimer } from '@/hooks/useLocalTimer';
import { initAudioContext } from '@/lib/audio';

export function FocusSession() {
  const [mounted, setMounted] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pomodoro = useTaskStore((s) => s.pomodoro);
  const tasks = useTaskStore((s) => s.tasks);
  const pausePomodoro = useTaskStore((s) => s.pausePomodoro);
  const resumePomodoro = useTaskStore((s) => s.resumePomodoro);
  const exitStudySession = useTaskStore((s) => s.exitStudySession);

  const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inactivity detection
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    // Only trigger idle mode if running in focus phase
    if (pomodoro.isRunning && pomodoro.sessionType === 'focus') {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    }
  }, [pomodoro.isRunning, pomodoro.sessionType]);

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

  const { timeString, progress: sessionProgress } = useLocalTimer();

  if (!mounted) return null;
  if (!activeTask) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 overflow-hidden flex flex-col items-center justify-between py-12 px-6 bg-[hsl(var(--background))] select-none z-40"
      onMouseMove={resetIdleTimer}
      onTouchStart={resetIdleTimer}
    >
      {/* ── Fixed Exit Button (Top Right) ── */}
      <motion.button
        animate={{ opacity: isIdle ? 0.15 : 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={exitStudySession}
        className="fixed top-6 right-6 px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold
                   hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer z-50 flex items-center gap-1.5 shadow-sm"
      >
        <LogOut size={13} />
        Exit Study Session
      </motion.button>

      {/* Spacer top */}
      <div className="h-6" />

      {/* ── Centered Focus Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full max-w-md">
        {/* Phase Indicator */}
        <motion.div
          animate={{ opacity: isIdle ? 0.3 : 1, y: isIdle ? 10 : 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-sm ${
              pomodoro.sessionType === 'focus'
                ? 'bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/35 text-[hsl(var(--accent))]'
                : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-500'
            }`}
          >
            {pomodoro.sessionType === 'focus' ? 'Focusing' : 'Taking a Break'}
          </span>
        </motion.div>

        {/* Large Timer (Scales smoothly on idle) */}
        <motion.div
          animate={{
            scale: isIdle ? 1.08 : 1.0,
            y: isIdle ? 4 : 0,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          <ProgressRing
            progress={sessionProgress}
            size={280}
            strokeWidth={4}
            color={pomodoro.sessionType === 'focus' ? undefined : 'hsl(142, 70%, 45%)'}
          >
            <div className="text-center space-y-1">
              <AnimatedTimer timeString={timeString} />
              
              {activeTask.title && activeTask.title !== 'No Subject' && (
                <motion.p
                  animate={{ opacity: isIdle ? 0.4 : 0.8 }}
                  transition={{ duration: 0.8 }}
                  className="text-[10px] font-bold tracking-[0.15em] uppercase text-[hsl(var(--muted))] max-w-[170px] truncate mx-auto pt-2"
                >
                  {activeTask.title}
                </motion.p>
              )}
            </div>
          </ProgressRing>
        </motion.div>

        {/* Play/Pause Button */}
        <motion.button
          animate={{ opacity: isIdle ? 0 : 1, y: isIdle ? 10 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            initAudioContext();
            if (pomodoro.isRunning) pausePomodoro();
            else resumePomodoro();
          }}
          className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))] active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          {pomodoro.isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
        </motion.button>
      </div>

      {/* ── Fixed Ambient Audio Selector (Bottom Center) ── */}
      <motion.div
        animate={{ opacity: isIdle ? 0.08 : 1, y: isIdle ? 15 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm mt-auto z-40"
      >
        <AmbientSounds />
      </motion.div>
    </motion.div>
  );
}
