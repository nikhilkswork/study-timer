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
  addTask: (title: string, totalDuration: number, isInfinite?: boolean) => void;
  editTask: (id: string, title: string, totalDuration: number, isInfinite?: boolean) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  updateTaskProgress: (id: string, elapsedSeconds: number, pomodorosCompleted: number) => void;

  // Pomodoro
  startPomodoro: (
    taskId: string,
    focusDuration: number,
    isInfinite?: boolean,
    isInfiniteLoop?: boolean,
    breakDuration?: number
  ) => void;
  pausePomodoro: () => void;
  resumePomodoro: () => void;
  stopPomodoro: () => void;
  tickPomodoro: (delta?: number) => void;
  skipBreak: (focusDuration: number) => void;
  startBreak: (breakDuration: number) => void;
  startNextFocus: (focusDuration: number) => void;
  resetPomodoro: () => void;

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
        isRunning: false,
        currentPomodoro: 0,
        isInfinite: false,
        isInfiniteLoop: false,
        startTime: null,
        targetEndTime: null,
        pausedAt: null,
        focusDuration: 25,
        breakDuration: 5,
      },

      addTask: (title, totalDuration, isInfinite = false) => {
        const focusDuration = 25; // default, can be overridden
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: generateId(),
              title,
              totalDuration: isInfinite ? 0 : totalDuration,
              elapsedTime: 0,
              completed: false,
              createdAt: new Date().toISOString(),
              pomodorosCompleted: 0,
              pomodorosTotal: isInfinite ? 0 : calculatePomodorosNeeded(totalDuration, focusDuration),
              isInfinite,
            },
          ],
        }));
      },

      editTask: (id, title, totalDuration, isInfinite = false) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title,
                  totalDuration: isInfinite ? 0 : totalDuration,
                  pomodorosTotal: isInfinite ? 0 : calculatePomodorosNeeded(totalDuration, 25),
                  isInfinite,
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
              ? {
                  activeTaskId: null,
                  sessionType: 'focus' as const,
                  isRunning: false,
                  currentPomodoro: 0,
                  isInfinite: false,
                  isInfiniteLoop: false,
                  startTime: null,
                  targetEndTime: null,
                  pausedAt: null,
                  focusDuration: 25,
                  breakDuration: 5,
                }
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
              ? {
                  activeTaskId: null,
                  sessionType: 'focus' as const,
                  isRunning: false,
                  currentPomodoro: 0,
                  isInfinite: false,
                  isInfiniteLoop: false,
                  startTime: null,
                  targetEndTime: null,
                  pausedAt: null,
                  focusDuration: 25,
                  breakDuration: 5,
                }
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

      startPomodoro: (taskId, focusDuration, isInfinite = false, isInfiniteLoop = false, breakDuration = 5) => {
        const now = Date.now();
        set({
          pomodoro: {
            activeTaskId: taskId,
            sessionType: 'focus',
            isRunning: true,
            currentPomodoro: get().pomodoro.activeTaskId === taskId ? get().pomodoro.currentPomodoro : 1,
            isInfinite,
            isInfiniteLoop,
            startTime: now,
            targetEndTime: isInfinite ? null : now + focusDuration * 60 * 1000,
            pausedAt: null,
            focusDuration,
            breakDuration,
          },
        });
      },

      pausePomodoro: () => {
        const { pomodoro } = get();
        if (!pomodoro.isRunning) return;
        set({
          pomodoro: {
            ...pomodoro,
            isRunning: false,
            pausedAt: Date.now(),
          },
        });
      },

      resumePomodoro: () => {
        const { pomodoro } = get();
        if (pomodoro.isRunning || !pomodoro.pausedAt) return;
        
        const now = Date.now();
        const pausedDuration = now - pomodoro.pausedAt;
        
        const newStartTime = pomodoro.startTime ? pomodoro.startTime + pausedDuration : now;
        const newTargetEndTime = pomodoro.targetEndTime ? pomodoro.targetEndTime + pausedDuration : null;

        set({
          pomodoro: {
            ...pomodoro,
            isRunning: true,
            startTime: newStartTime,
            targetEndTime: newTargetEndTime,
            pausedAt: null,
          },
        });
      },

      stopPomodoro: () => {
        const { pomodoro, tasks } = get();
        if (pomodoro.activeTaskId && pomodoro.startTime && pomodoro.sessionType === 'focus') {
          const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);
          if (activeTask) {
            const now = pomodoro.pausedAt || Date.now();
            const elapsedSeconds = Math.max(0, Math.floor((now - pomodoro.startTime) / 1000));
            if (elapsedSeconds > 0) {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === activeTask.id
                    ? {
                        ...t,
                        elapsedTime: t.elapsedTime + elapsedSeconds,
                        pomodorosCompleted: t.pomodorosCompleted + (pomodoro.isInfinite ? 0 : Math.floor(elapsedSeconds / (pomodoro.focusDuration * 60))),
                      }
                    : t
                ),
              }));
            }
          }
        }

        set({
          pomodoro: {
            activeTaskId: null,
            sessionType: 'focus',
            isRunning: false,
            currentPomodoro: 0,
            isInfinite: false,
            isInfiniteLoop: false,
            startTime: null,
            targetEndTime: null,
            pausedAt: null,
            focusDuration: 25,
            breakDuration: 5,
          },
        });
      },

      tickPomodoro: (delta = 1) => {
        // Timestamp-driven ticks are handled visual-only in components.
        // This is a no-op in the store to eliminate global parent-level re-render storms!
      },

      skipBreak: (focusDuration) => {
        const { pomodoro } = get();
        const now = Date.now();
        set({
          pomodoro: {
            ...pomodoro,
            sessionType: 'focus',
            startTime: now,
            targetEndTime: pomodoro.isInfinite ? null : now + focusDuration * 60 * 1000,
            pausedAt: null,
            isRunning: true,
          },
        });
      },

      startBreak: (breakDuration) => {
        const { pomodoro } = get();
        const now = Date.now();
        set({
          pomodoro: {
            ...pomodoro,
            sessionType: 'break',
            startTime: now,
            targetEndTime: now + breakDuration * 60 * 1000,
            pausedAt: null,
            isRunning: true,
          },
        });
      },

      startNextFocus: (focusDuration) => {
        const { pomodoro } = get();
        const now = Date.now();
        set({
          pomodoro: {
            ...pomodoro,
            sessionType: 'focus',
            currentPomodoro: pomodoro.currentPomodoro + 1,
            startTime: now,
            targetEndTime: pomodoro.isInfinite ? null : now + focusDuration * 60 * 1000,
            pausedAt: null,
            isRunning: true,
          },
        });
      },

      resetPomodoro: () => {
        const { pomodoro } = get();
        set({
          pomodoro: {
            ...pomodoro,
            isRunning: false,
            startTime: null,
            targetEndTime: null,
            pausedAt: null,
          },
        });
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
              isRunning: false,
              currentPomodoro: 0,
              isInfinite: false,
              isInfiniteLoop: false,
              startTime: null,
              targetEndTime: null,
              pausedAt: null,
              focusDuration: 25,
              breakDuration: 5,
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
            isRunning: false,
            currentPomodoro: 0,
            isInfinite: false,
            isInfiniteLoop: false,
            startTime: null,
            targetEndTime: null,
            pausedAt: null,
            focusDuration: 25,
            breakDuration: 5,
          },
        });
      },
    }),
    {
      name: 'study-timer-tasks',
    }
  )
);
