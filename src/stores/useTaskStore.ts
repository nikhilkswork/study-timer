'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, PomodoroState } from '@/lib/types';
import { generateId, getTodayKey, calculatePomodorosNeeded } from '@/lib/utils';

interface TaskStore {
  tasks: Task[];
  lastResetDate: string;
  pomodoro: PomodoroState;

  // Task CRUD
  addTask: (title: string, totalDuration: number) => void;
  editTask: (id: string, title: string, totalDuration: number) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  updateTaskProgress: (id: string, elapsedSeconds: number, pomodorosCompleted: number) => void;

  // Pomodoro
  startPomodoro: (taskId: string, focusDuration: number) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: () => void;
  tickPomodoro: () => void;
  skipBreak: (focusDuration: number) => void;
  startBreak: (breakDuration: number) => void;
  startNextFocus: (focusDuration: number) => void;
  resetPomodoro: (durationInSeconds: number) => void;

  // Daily
  checkDailyReset: () => void;
  resetTasks: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastResetDate: getTodayKey(),
      pomodoro: {
        activeTaskId: null,
        sessionType: 'focus',
        timeRemaining: 0,
        isRunning: false,
        currentPomodoro: 0,
      },

      addTask: (title, totalDuration) => {
        const focusDuration = 25; // default, can be overridden
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: generateId(),
              title,
              totalDuration,
              elapsedTime: 0,
              completed: false,
              createdAt: new Date().toISOString(),
              pomodorosCompleted: 0,
              pomodorosTotal: calculatePomodorosNeeded(totalDuration, focusDuration),
            },
          ],
        }));
      },

      editTask: (id, title, totalDuration) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title,
                  totalDuration,
                  pomodorosTotal: calculatePomodorosNeeded(totalDuration, 25),
                }
              : t
          ),
        }));
      },

      deleteTask: (id) => {
        const { pomodoro } = get();
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          pomodoro:
            pomodoro.activeTaskId === id
              ? { activeTaskId: null, sessionType: 'focus' as const, timeRemaining: 0, isRunning: false, currentPomodoro: 0 }
              : state.pomodoro,
        }));
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: true, completedAt: new Date().toISOString(), elapsedTime: t.totalDuration * 60 }
              : t
          ),
          pomodoro:
            state.pomodoro.activeTaskId === id
              ? { activeTaskId: null, sessionType: 'focus' as const, timeRemaining: 0, isRunning: false, currentPomodoro: 0 }
              : state.pomodoro,
        }));
      },

      updateTaskProgress: (id, elapsedSeconds, pomodorosCompleted) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, elapsedTime: elapsedSeconds, pomodorosCompleted } : t
          ),
        }));
      },

      startPomodoro: (taskId, focusDuration) => {
        set({
          pomodoro: {
            activeTaskId: taskId,
            sessionType: 'focus',
            timeRemaining: focusDuration * 60,
            isRunning: true,
            currentPomodoro: get().pomodoro.activeTaskId === taskId ? get().pomodoro.currentPomodoro : 0,
          },
        });
      },

      pausePomodoro: () => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning: false },
        }));
      },

      resumePomodoro: () => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning: true },
        }));
      },

      stopPomodoro: () => {
        set({
          pomodoro: {
            activeTaskId: null,
            sessionType: 'focus',
            timeRemaining: 0,
            isRunning: false,
            currentPomodoro: 0,
          },
        });
      },

      tickPomodoro: () => {
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            timeRemaining: Math.max(0, state.pomodoro.timeRemaining - 1),
          },
        }));
      },

      skipBreak: (focusDuration) => {
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            sessionType: 'focus',
            timeRemaining: focusDuration * 60,
            isRunning: true,
          },
        }));
      },

      startBreak: (breakDuration) => {
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            sessionType: 'break',
            timeRemaining: breakDuration * 60,
            isRunning: true,
            currentPomodoro: state.pomodoro.currentPomodoro + 1,
          },
        }));
      },

      startNextFocus: (focusDuration) => {
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            sessionType: 'focus',
            timeRemaining: focusDuration * 60,
            isRunning: true,
          },
        }));
      },

      resetPomodoro: (durationInSeconds) => {
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            timeRemaining: durationInSeconds,
            isRunning: false,
          },
        }));
      },

      checkDailyReset: () => {
        const today = getTodayKey();
        const { lastResetDate } = get();
        if (lastResetDate !== today) {
          set((state) => ({
            lastResetDate: today,
            tasks: state.tasks.map((t) => ({
              ...t,
              completed: false,
              completedAt: undefined,
              elapsedTime: 0,
              pomodorosCompleted: 0,
            })),
            pomodoro: {
              activeTaskId: null,
              sessionType: 'focus' as const,
              timeRemaining: 0,
              isRunning: false,
              currentPomodoro: 0,
            },
          }));
        }
      },

      resetTasks: () => {
        set({
          tasks: [],
          lastResetDate: getTodayKey(),
          pomodoro: {
            activeTaskId: null,
            sessionType: 'focus',
            timeRemaining: 0,
            isRunning: false,
            currentPomodoro: 0,
          },
        });
      },
    }),
    {
      name: 'study-timer-tasks',
    }
  )
);
