'use client';

import { useTaskStore } from '@/stores/useTaskStore';

export function useLocalTimer() {
  const pomodoro = useTaskStore((s) => s.pomodoro);
  const isInfinite = pomodoro.isInfinite;

  let timeString = '00:00';
  let progress = 0;

  if (isInfinite && pomodoro.sessionType === 'focus') {
    // --- INFINITE SESSION COUNT UP ---
    const totalSeconds = pomodoro.elapsedSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');

    timeString = `${hStr}${mStr}:${sStr}`;
    progress = 0;
  } else {
    // --- COUNT DOWN SESSION ---
    const remainingSeconds = pomodoro.remainingSeconds;
    const totalDurationSecs = (pomodoro.sessionType === 'focus' ? pomodoro.focusDuration : pomodoro.breakDuration) * 60;

    const currentProgress = totalDurationSecs > 0
      ? Math.min(100, Math.max(0, ((totalDurationSecs - remainingSeconds) / totalDurationSecs) * 100))
      : 0;

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');

    timeString = `${hStr}${mStr}:${sStr}`;
    progress = currentProgress;
  }

  return { timeString, progress, isInfinite: isInfinite && pomodoro.sessionType === 'focus' };
}
