'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface AnimatedTimerProps {
  time: number; // seconds
  className?: string;
  enlarged?: boolean;
}

function AnimatedDigit({ digit, className }: { digit: string; className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AnimatedTimer({ time, className, enlarged }: AnimatedTimerProps) {
  const timeString = useMemo(() => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [time]);

  const chars = timeString.split('');

  return (
    <div
      className={`font-mono font-bold tracking-tight text-[var(--foreground)] flex items-center justify-center ${
        enlarged ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl'
      } ${className ?? ''}`}
      style={{ transition: 'font-size 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {chars.map((char, i) =>
        char === ':' ? (
          <span key={`colon-${i}`} className="mx-0.5 opacity-50">
            :
          </span>
        ) : (
          <AnimatedDigit
            key={`pos-${i}`}
            digit={char}
            className="w-[0.6em] text-center"
          />
        )
      )}
    </div>
  );
}
