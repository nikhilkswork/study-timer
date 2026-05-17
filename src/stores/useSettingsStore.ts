'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@/lib/types';

interface SettingsStore extends Settings {
  setFocusDuration: (val: number) => void;
  setBreakDuration: (val: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSoundEnabled: (val: boolean) => void;
  setAmbientSound: (val: Settings['ambientSound']) => void;
  setAmbientVolume: (val: number) => void;
  setNotificationSound: (val: boolean) => void;
  setIsInfinite: (val: boolean) => void;
  setIsInfiniteLoop: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      focusDuration: 25,
      breakDuration: 5,
      theme: 'dark',
      soundEnabled: true,
      ambientSound: 'none',
      ambientVolume: 0.5,
      notificationSound: true,
      isInfinite: false,
      isInfiniteLoop: false,

      setFocusDuration: (val) => set({ focusDuration: val }),
      setBreakDuration: (val) => set({ breakDuration: val }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      setAmbientSound: (val) => set({ ambientSound: val }),
      setAmbientVolume: (val) => set({ ambientVolume: val }),
      setNotificationSound: (val) => set({ notificationSound: val }),
      setIsInfinite: (val) => set({ isInfinite: val }),
      setIsInfiniteLoop: (val) => set({ isInfiniteLoop: val }),
    }),
    {
      name: 'study-timer-settings',
    }
  )
);
