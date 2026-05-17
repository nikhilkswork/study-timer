'use client';

import { useState, useEffect } from 'react';

interface LocalTimerProps {
  startTime: number | null;
  targetEndTime: number | null;
  pausedAt: number | null;
  isRunning: boolean;
  isInfinite: boolean;
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  sessionType: 'focus' | 'break';
}

export function useLocalTimer({
  startTime,
  targetEndTime,
  pausedAt,
  isRunning,
  isInfinite,
  focusDuration,
  breakDuration,
  sessionType,
}: LocalTimerProps) {
  const [timeString, setTimeString] = useState('00:00');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      if (isInfinite) {
        // --- INFINITE MODE: COUNT UP ---
        if (!startTime) {
          setTimeString('00:00:00');
          setProgress(0);
          return;
        }

        const now = isRunning ? Date.now() : (pausedAt || Date.now());
        const elapsedMs = now - startTime;
        const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
        const mStr = minutes.toString().padStart(2, '0');
        const sStr = seconds.toString().padStart(2, '0');

        setTimeString(`${hStr}${mStr}:${sStr}`);
        setProgress(0);
      } else {
        // --- COUNTDOWN MODE ---
        if (!startTime || !targetEndTime) {
          const defaultSecs = (sessionType === 'focus' ? focusDuration : breakDuration) * 60;
          const m = Math.floor(defaultSecs / 60).toString().padStart(2, '0');
          const s = (defaultSecs % 60).toString().padStart(2, '0');
          setTimeString(`${m}:${s}`);
          setProgress(0);
          return;
        }

        const now = isRunning ? Date.now() : (pausedAt || Date.now());
        const remainingMs = targetEndTime - now;
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        const totalDurationSecs = (sessionType === 'focus' ? focusDuration : breakDuration) * 60;
        const currentProgress = Math.min(
          100,
          Math.max(0, ((totalDurationSecs - remainingSeconds) / totalDurationSecs) * 100)
        );

        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
        const mStr = minutes.toString().padStart(2, '0');
        const sStr = seconds.toString().padStart(2, '0');

        setTimeString(`${hStr}${mStr}:${sStr}`);
        setProgress(currentProgress);
      }
    };

    // Initial update
    updateTimer();

    if (!isRunning) return;

    // Use requestAnimationFrame for super-smooth visually-isolated updates!
    let animId: number;
    const tick = () => {
      updateTimer();
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [startTime, targetEndTime, pausedAt, isRunning, isInfinite, focusDuration, breakDuration, sessionType]);

  return { timeString, progress };
}
