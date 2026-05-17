'use client';

import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { startAmbientSound, stopAmbientSound, setAmbientVolume } from '@/lib/audio';

export function useAmbientSoundSync() {
  const isRunning = useTaskStore((s) => s.pomodoro.isRunning);
  const activeTaskId = useTaskStore((s) => s.pomodoro.activeTaskId);
  const ambientSound = useSettingsStore((s) => s.ambientSound);
  const ambientVolume = useSettingsStore((s) => s.ambientVolume);

  const prevIsRunning = useRef(false);
  const prevSound = useRef(ambientSound);

  // Sync play/stop states when timer running or selected sound changes
  useEffect(() => {
    const shouldPlay = isRunning && activeTaskId !== null && ambientSound !== 'none';

    if (shouldPlay) {
      const wasRunning = prevIsRunning.current;
      const soundChanged = prevSound.current !== ambientSound;

      if (!wasRunning || soundChanged) {
        startAmbientSound(ambientSound, ambientVolume);
      }
    } else {
      const wasRunning = prevIsRunning.current;
      const soundDeselected = ambientSound === 'none';

      if (wasRunning || soundDeselected) {
        stopAmbientSound();
      }
    }

    prevIsRunning.current = isRunning && activeTaskId !== null;
    prevSound.current = ambientSound;
  }, [isRunning, activeTaskId, ambientSound, ambientVolume]);

  // Sync volume adjustments in real-time
  useEffect(() => {
    const isCurrentlyPlaying = isRunning && activeTaskId !== null && ambientSound !== 'none';
    if (isCurrentlyPlaying) {
      setAmbientVolume(ambientVolume);
    }
  }, [ambientVolume, isRunning, activeTaskId, ambientSound]);

  // Stop ambient sound on component unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);
}
