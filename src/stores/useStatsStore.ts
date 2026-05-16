'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Stats, DayStats } from '@/lib/types';
import { getTodayKey, daysBetween } from '@/lib/utils';
import { format, subDays } from 'date-fns';

interface StatsStore extends Stats {
  recordFocusMinutes: (minutes: number) => void;
  recordTaskCompletion: () => void;
  setTotalTasksForToday: (count: number) => void;
  checkStreak: () => void;
  resetStats: () => void;
}

function getEmptyWeek(): DayStats[] {
  const week: DayStats[] = [];
  for (let i = 6; i >= 0; i--) {
    week.push({
      date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
      completedTasks: 0,
      focusMinutes: 0,
      totalTasks: 0,
    });
  }
  return week;
}

function ensureWeeklyDataCurrent(weeklyData: DayStats[]): DayStats[] {
  const today = getTodayKey();
  const freshWeek = getEmptyWeek();

  return freshWeek.map((day) => {
    const existing = weeklyData.find((d) => d.date === day.date);
    return existing || day;
  });
}

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      totalFocusMinutes: 0,
      totalCompletedTasks: 0,
      weeklyData: getEmptyWeek(),
      lastActiveDate: getTodayKey(),

      recordFocusMinutes: (minutes) => {
        const today = getTodayKey();
        set((state) => {
          const weeklyData = ensureWeeklyDataCurrent(state.weeklyData).map((d) =>
            d.date === today ? { ...d, focusMinutes: d.focusMinutes + minutes } : d
          );
          return {
            totalFocusMinutes: state.totalFocusMinutes + minutes,
            weeklyData,
            lastActiveDate: today,
          };
        });
      },

      recordTaskCompletion: () => {
        const today = getTodayKey();
        set((state) => {
          const weeklyData = ensureWeeklyDataCurrent(state.weeklyData).map((d) =>
            d.date === today ? { ...d, completedTasks: d.completedTasks + 1 } : d
          );
          return {
            totalCompletedTasks: state.totalCompletedTasks + 1,
            weeklyData,
            lastActiveDate: today,
          };
        });
        get().checkStreak();
      },

      setTotalTasksForToday: (count) => {
        const today = getTodayKey();
        set((state) => {
          const weeklyData = ensureWeeklyDataCurrent(state.weeklyData).map((d) =>
            d.date === today ? { ...d, totalTasks: count } : d
          );
          return { weeklyData };
        });
      },

      checkStreak: () => {
        const today = getTodayKey();
        set((state) => {
          const { lastActiveDate } = state;
          const gap = daysBetween(lastActiveDate, today);

          let newStreak = state.currentStreak;
          if (gap <= 1) {
            if (lastActiveDate !== today) {
              newStreak = state.currentStreak + 1;
            }
          } else {
            newStreak = 1;
          }

          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActiveDate: today,
          };
        });
      },

      resetStats: () =>
        set({
          currentStreak: 0,
          longestStreak: 0,
          totalFocusMinutes: 0,
          totalCompletedTasks: 0,
          weeklyData: getEmptyWeek(),
          lastActiveDate: getTodayKey(),
        }),
    }),
    {
      name: 'study-timer-stats',
    }
  )
);
