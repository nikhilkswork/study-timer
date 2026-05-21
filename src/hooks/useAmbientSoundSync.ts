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
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const prevIsRunning = useRef(false);
  const prevSound = useRef(ambientSound);
  const prevSoundEnabled = useRef(soundEnabled);

  // Sync play/stop states when timer running or selected sound changes
  useEffect(() => {
    const shouldPlay = isRunning && activeTaskId !== null && ambientSound !== 'none' && soundEnabled;

    if (shouldPlay) {
      const wasRunning = prevIsRunning.current;
      const soundChanged = prevSound.current !== ambientSound;
      const soundEnabledChanged = prevSoundEnabled.current !== soundEnabled;

      if (!wasRunning || soundChanged || soundEnabledChanged) {
        startAmbientSound(ambientSound, ambientVolume);
      }
    } else {
      const wasRunning = prevIsRunning.current;
      const soundDeselected = ambientSound === 'none';
      const soundDisabled = !soundEnabled;

      if (wasRunning || soundDeselected || soundDisabled) {
        stopAmbientSound();
      }
    }

    prevIsRunning.current = isRunning && activeTaskId !== null && soundEnabled;
    prevSound.current = ambientSound;
    prevSoundEnabled.current = soundEnabled;
  }, [isRunning, activeTaskId, ambientSound, ambientVolume, soundEnabled]);

  // Sync volume adjustments in real-time
  useEffect(() => {
    const isCurrentlyPlaying = isRunning && activeTaskId !== null && ambientSound !== 'none' && soundEnabled;
    if (isCurrentlyPlaying) {
      setAmbientVolume(ambientVolume);
    }
  }, [ambientVolume, isRunning, activeTaskId, ambientSound, soundEnabled]);

  // Stop ambient sound on component unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);
}
