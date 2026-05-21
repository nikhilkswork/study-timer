'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Clock, Gauge, ArrowLeft } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { playCountdownTickSound, playCountdownStartSound, initAudioContext } from '@/lib/audio';

export function StudySetupFlow() {
  const setupStep = useTaskStore((s) => s.setupStep);
  const setupSubject = useTaskStore((s) => s.setupSubject);

  const setSetupStep = useTaskStore((s) => s.setSetupStep);
  const setSetupSubject = useTaskStore((s) => s.setSetupSubject);
  const setSetupSplit = useTaskStore((s) => s.setSetupSplit);
  const setSetupTimerDuration = useTaskStore((s) => s.setSetupTimerDuration);
  const setSetupMode = useTaskStore((s) => s.setSetupMode);
  const startStudySession = useTaskStore((s) => s.startStudySession);
  const cancelStudySetup = useTaskStore((s) => s.cancelStudySetup);

  const [inputValue, setInputValue] = useState(() => useTaskStore.getState().setupSubject);
  const [countdown, setCountdown] = useState(5);
  const [tempTimerDuration, setTempTimerDuration] = useState(() => useTaskStore.getState().setupTimerDuration);
  const startCalled = useRef(false);


  // Handle countdown ticking cleanly without running side-effects in state updater
  useEffect(() => {
    if (setupStep !== 'countdown') {
      startCalled.current = false;
      return;
    }

    initAudioContext();
    playCountdownTickSound();

    const handle = requestAnimationFrame(() => {
      setCountdown(5);
    });

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const nextVal = prev - 1;
        if (nextVal <= 0) {
          clearInterval(interval);
          if (!startCalled.current) {
            startCalled.current = true;
            playCountdownStartSound();
            setTimeout(() => {
              startStudySession();
            }, 300);
          }
        } else {
          playCountdownTickSound();
        }
        return nextVal;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(handle);
      clearInterval(interval);
    };
  }, [setupStep, startStudySession]);

  const handleSubjectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSetupSubject(inputValue);
    setSetupStep('mode-select');
  };

  const handleSkip = () => {
    setSetupSubject('No Subject');
    setSetupStep('mode-select');
  };

  const handleSelectMode = (mode: 'pomodoro' | 'timer' | 'stopwatch') => {
    setSetupMode(mode);
    if (mode === 'pomodoro') {
      setSetupStep('pomodoro-config');
    } else if (mode === 'timer') {
      setSetupStep('timer-config');
    } else if (mode === 'stopwatch') {
      setSetupStep('countdown');
    }
  };

  const selectSplit = (split: 25 | 50) => {
    setSetupSplit(split);
    setSetupStep('countdown');
  };

  const startTimerSession = () => {
    setSetupTimerDuration(tempTimerDuration);
    setSetupStep('countdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--background))] overflow-hidden select-none px-6">
      {/* Subtle atmospheric background glow */}
      <div className="absolute inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--accent))]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--accent))]/5 blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: What to study */}
        {setupStep === 'subject' && (
          <motion.div
            key="subject"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center space-y-8 relative"
          >
            {/* Cancel Button */}
            <button
              onClick={cancelStudySetup}
              className="absolute -top-16 right-0 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/35 text-[hsl(var(--muted))] text-xs font-semibold hover:bg-[hsl(var(--hover))] hover:text-[hsl(var(--foreground))] transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1"
              title="Cancel Setup"
            >
              <X size={13} />
              Cancel
            </button>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                What do you want to study?
              </h1>
              <p className="text-sm text-[hsl(var(--muted))] opacity-80">
                Enter a topic to anchor your focus session.
              </p>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-6">
              <input
                type="text"
                autoFocus
                placeholder="Physics, Calculus, Operating Systems..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-[hsl(var(--input-bg))] border border-[hsl(var(--border))] 
                           text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted))]/50 text-center text-lg
                           focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/30 focus:border-[hsl(var(--accent))]
                           transition-all duration-300 shadow-inner"
              />

              <div className="flex flex-col items-center gap-3">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[hsl(var(--accent))] text-white font-medium hover:opacity-95 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-xs font-semibold text-red-500/80 hover:text-red-600 hover:bg-red-500/5 rounded-xl border border-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Unified Mode Selection */}
        {setupStep === 'mode-select' && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl text-center space-y-8 relative"
          >
            {/* Cancel Button */}
            <button
              onClick={cancelStudySetup}
              className="absolute -top-16 right-0 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/35 text-[hsl(var(--muted))] text-xs font-semibold hover:bg-[hsl(var(--hover))] hover:text-[hsl(var(--foreground))] transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <X size={13} />
              Cancel
            </button>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Select your focus style
              </h1>
              <p className="text-sm text-[hsl(var(--muted))] opacity-80">
                Choose how you want to approach your session for <span className="text-[hsl(var(--foreground))] font-semibold">“{setupSubject || 'No Subject'}”</span>.
              </p>
            </div>

            {/* Mode Cards Grid (No separator, first-class equal layout) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Mode 1: Pomodoro */}
              <button
                onClick={() => handleSelectMode('pomodoro')}
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/40 hover:bg-[hsl(var(--card))]/80 text-center hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Timer size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Pomodoro</h3>
                  <p className="text-xs text-[hsl(var(--muted))] leading-relaxed">
                    Structured intervals with built-in breaks to maintain rhythm.
                  </p>
                </div>
              </button>

              {/* Mode 2: Timer */}
              <button
                onClick={() => handleSelectMode('timer')}
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/40 hover:bg-[hsl(var(--card))]/80 text-center hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Timer</h3>
                  <p className="text-xs text-[hsl(var(--muted))] leading-relaxed">
                    Single uninterrupted countdown for focused, deep flow.
                  </p>
                </div>
              </button>

              {/* Mode 3: Stopwatch */}
              <button
                onClick={() => handleSelectMode('stopwatch')}
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/40 hover:bg-[hsl(var(--card))]/80 text-center hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col items-center space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Gauge size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Stopwatch</h3>
                  <p className="text-xs text-[hsl(var(--muted))] leading-relaxed">
                    Open-ended upward count. Perfect for tracking flexible sessions.
                  </p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setSetupStep('subject')}
              className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={12} />
              Back to topic
            </button>
          </motion.div>
        )}

        {/* STEP 3A: Pomodoro Split Select */}
        {setupStep === 'pomodoro-config' && (
          <motion.div
            key="pomodoro-config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center space-y-8 relative"
          >
            {/* Cancel Button */}
            <button
              onClick={cancelStudySetup}
              className="absolute -top-16 right-0 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/35 text-[hsl(var(--muted))] text-xs font-semibold hover:bg-[hsl(var(--hover))] hover:text-[hsl(var(--foreground))] transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <X size={13} />
              Cancel
            </button>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Choose your Pomodoro split
              </h1>
              <p className="text-sm text-[hsl(var(--muted))] opacity-80">
                Select focus and break durations for this block.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => selectSplit(25)}
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">25 / 5 split</h3>
                    <p className="text-xs text-[hsl(var(--muted))] mt-1">25 min focus, 5 min break</p>
                  </div>
                  <span className="text-2xl opacity-40 group-hover:opacity-100 group-hover:text-[hsl(var(--accent))] transition-all">🌱</span>
                </div>
              </button>

              <button
                onClick={() => selectSplit(50)}
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">50 / 10 split</h3>
                    <p className="text-xs text-[hsl(var(--muted))] mt-1">50 min focus, 10 min break</p>
                  </div>
                  <span className="text-2xl opacity-40 group-hover:opacity-100 group-hover:text-[hsl(var(--accent))] transition-all">🌳</span>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setSetupStep('mode-select')}
              className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5 mx-auto active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={12} />
              Back to styles
            </button>
          </motion.div>
        )}

        {/* STEP 3B: Timer Duration Config */}
        {setupStep === 'timer-config' && (
          <motion.div
            key="timer-config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center space-y-8 relative"
          >
            {/* Cancel Button */}
            <button
              onClick={cancelStudySetup}
              className="absolute -top-16 right-0 px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/35 text-[hsl(var(--muted))] text-xs font-semibold hover:bg-[hsl(var(--hover))] hover:text-[hsl(var(--foreground))] transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <X size={13} />
              Cancel
            </button>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                How long to focus?
              </h1>
              <p className="text-sm text-[hsl(var(--muted))] opacity-80">
                Pick a duration for single uninterrupted focus.
              </p>
            </div>

            <div className="space-y-6">
              {/* Presets Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[15, 25, 30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTempTimerDuration(d)}
                    className={`py-3.5 rounded-xl border transition-all duration-300 font-semibold cursor-pointer active:scale-95 ${
                      tempTimerDuration === d
                        ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))] text-white shadow-sm'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]/50 hover:bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>

              {/* Slider for custom adjustments */}
              <div className="space-y-3 p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/30">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted))]">
                  <span>Custom Duration</span>
                  <span className="text-[hsl(var(--foreground))]">{tempTimerDuration} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={tempTimerDuration}
                  onChange={(e) => setTempTimerDuration(parseInt(e.target.value))}
                  className="w-full h-1 bg-[hsl(var(--border))] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--accent))]"
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={startTimerSession}
                  className="w-full py-4 rounded-2xl bg-[hsl(var(--accent))] text-white font-medium hover:opacity-95 active:scale-[0.98] transition-all shadow-md cursor-pointer"
                >
                  Start Focus Session
                </button>
                <button
                  onClick={() => setSetupStep('mode-select')}
                  className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  Back to styles
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Cinematic Countdown */}
        {setupStep === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <motion.div
              key={countdown}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-[12rem] font-bold text-white font-mono tracking-tighter leading-none select-none drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              {countdown > 0 ? countdown : 'Go!'}
            </motion.div>
            <p className="text-xs text-white/60 tracking-[0.3em] uppercase mt-8 font-semibold">
              Preparing your sanctuary...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
