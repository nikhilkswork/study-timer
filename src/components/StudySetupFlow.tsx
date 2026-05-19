'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/stores/useTaskStore';
import { playCountdownTickSound, playCountdownStartSound, initAudioContext } from '@/lib/audio';

export function StudySetupFlow() {
  const setupStep = useTaskStore((s) => s.setupStep);
  const setupSubject = useTaskStore((s) => s.setupSubject);
  const setupSplit = useTaskStore((s) => s.setupSplit);

  const setSetupStep = useTaskStore((s) => s.setSetupStep);
  const setSetupSubject = useTaskStore((s) => s.setSetupSubject);
  const setSetupSplit = useTaskStore((s) => s.setSetupSplit);
  const startStudySession = useTaskStore((s) => s.startStudySession);

  const [inputValue, setInputValue] = useState(setupSubject);
  const [countdown, setCountdown] = useState(5);

  // Sync state if setupSubject changes
  useEffect(() => {
    setInputValue(setupSubject);
  }, [setupSubject]);

  // Handle countdown ticking
  useEffect(() => {
    if (setupStep !== 'countdown') {
      setCountdown(5);
      return;
    }

    initAudioContext();
    playCountdownTickSound();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          playCountdownStartSound();
          setTimeout(() => {
            startStudySession();
          }, 400);
          return 0;
        }
        playCountdownTickSound();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setupStep, startStudySession]);

  const handleSubjectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSetupSubject(inputValue);
    setSetupStep('split');
  };

  const handleSkip = () => {
    setSetupSubject('No Subject');
    setSetupStep('split');
  };

  const selectSplit = (split: 25 | 50) => {
    setSetupSplit(split);
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
        {setupStep === 'subject' && (
          <motion.div
            key="subject"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center space-y-8"
          >
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
                  className="w-full py-4 rounded-2xl bg-[hsl(var(--accent))] text-white font-medium hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-xs font-semibold text-red-500/80 hover:text-red-600 hover:bg-red-500/5 rounded-xl border border-red-500/20 active:scale-95 transition-all"
                >
                  Skip
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {setupStep === 'split' && (
          <motion.div
            key="split"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center space-y-8"
          >
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                Choose the pomodoro split
              </h1>
              <p className="text-sm text-[hsl(var(--muted))] opacity-80">
                Select your focus and break intervals.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => selectSplit(25)}
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98]"
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
                className="group relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-left hover:border-[hsl(var(--accent))] hover:shadow-lg hover:shadow-[hsl(var(--accent))]/5 transition-all duration-300 active:scale-[0.98]"
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
              onClick={() => setSetupStep('subject')}
              className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              ← Back to subject
            </button>
          </motion.div>
        )}

        {setupStep === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
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
