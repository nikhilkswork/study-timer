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
          initial={{ y: '-60%', opacity: 0, scale: 0.9 }}
          animate={{ y: '0%', opacity: 1, scale: 1 }}
          exit={{ y: '60%', opacity: 0, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 24,
            mass: 1.2,
          }}
          className="inline-block glow-text"
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
      className={`font-mono font-medium tracking-tight text-[var(--foreground)] flex items-center justify-center ${
        enlarged ? 'text-8xl md:text-9xl' : 'text-5xl md:text-6xl'
      } ${className ?? ''}`}
      style={{ 
        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        filter: enlarged ? 'drop-shadow(0 0 20px hsla(var(--accent) / 0.15))' : 'none'
      }}
    >
      {chars.map((char, i) =>
        char === ':' ? (
          <span key={`colon-${i}`} className="mx-1 opacity-20 animate-pulse">
            :
          </span>
        ) : (
          <AnimatedDigit
            key={`pos-${i}`}
            digit={char}
            className="w-[0.65em] text-center"
          />
        )
      )}
    </div>
  );
}
