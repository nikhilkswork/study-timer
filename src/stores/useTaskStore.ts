'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, PomodoroState } from '@/lib/types';
import { generateId, getTodayKey, calculatePomodorosNeeded } from '@/lib/utils';

interface TaskStore {
  tasks: Task[];
  lastResetDate: string;
  pomodoro: PomodoroState;

  // Study entry setup state
  setupStep: 'subject' | 'split' | 'countdown' | 'inactive';
  setupSubject: string;
  setupSplit: 25 | 50;

  // Study entry setup actions
  setSetupStep: (step: 'subject' | 'split' | 'countdown' | 'inactive') => void;
  setSetupSubject: (subject: string) => void;
  setSetupSplit: (split: 25 | 50) => void;
  startStudySession: () => void;
  exitStudySession: () => void;

  // Task CRUD
  addTask: (title: string, totalDuration: number, isInfinite?: boolean, isInfiniteLoop?: boolean) => void;
  editTask: (id: string, title: string, totalDuration: number, isInfinite?: boolean, isInfiniteLoop?: boolean) => void;
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
  tickPomodoro: () => void;
  skipBreak: (focusDuration: number) => void;
  startBreak: (breakDuration: number) => void;
  startNextFocus: (focusDuration: number) => void;
  resetPomodoro: () => void;

  // Daily
  checkDailyReset: () => void;
  resetTasks: () => void;
}

const initialPomodoro: PomodoroState = {
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
  baseElapsed: 0,
  baseRemaining: 1500,
  elapsedSeconds: 0,
  remainingSeconds: 1500,
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastResetDate: getTodayKey(),
      pomodoro: { ...initialPomodoro },

      // Study Setup state defaults (default to 'subject' on fresh entries)
      setupStep: 'subject',
      setupSubject: '',
      setupSplit: 25,

      setSetupStep: (step) => set({ setupStep: step }),
      setSetupSubject: (subject) => set({ setupSubject: subject }),
      setSetupSplit: (split) => set({ setupSplit: split }),

      startStudySession: () => {
        const { setupSubject, setupSplit } = get();
        const taskId = generateId();
        const focusDuration = setupSplit;
        const breakDuration = setupSplit === 25 ? 5 : 10;
        
        const newTask: Task = {
          id: taskId,
          title: setupSubject.trim() || 'No Subject',
          totalDuration: focusDuration,
          elapsedTime: 0,
          completed: false,
          createdAt: new Date().toISOString(),
          pomodorosCompleted: 0,
          pomodorosTotal: 0,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
          setupStep: 'inactive',
        }));

        const now = Date.now();
        const secs = focusDuration * 60;
        set({
          pomodoro: {
            activeTaskId: taskId,
            sessionType: 'focus',
            isRunning: true,
            currentPomodoro: 1,
            isInfinite: false,
            isInfiniteLoop: true,
            startTime: now,
            targetEndTime: now + secs * 1000,
            pausedAt: null,
            focusDuration,
            breakDuration,
            baseElapsed: 0,
            baseRemaining: secs,
            elapsedSeconds: 0,
            remainingSeconds: secs,
          },
        });
      },

      exitStudySession: () => {
        const { pomodoro, tasks } = get();
        if (pomodoro.activeTaskId) {
          const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);
          if (activeTask) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === activeTask.id
                  ? {
                      ...t,
                      completed: true,
                      completedAt: new Date().toISOString(),
                    }
                  : t
              ),
            }));
          }
        }

        set({
          pomodoro: { ...initialPomodoro },
          setupStep: 'inactive',
          setupSubject: '',
        });
      },

      addTask: (title, totalDuration, isInfinite = false, isInfiniteLoop = false) => {
        const focusDuration = 25;
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
              isInfiniteLoop,
            },
          ],
        }));
      },

      editTask: (id, title, totalDuration, isInfinite = false, isInfiniteLoop = false) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title,
                  totalDuration: isInfinite ? 0 : totalDuration,
                  pomodorosTotal: isInfinite ? 0 : calculatePomodorosNeeded(totalDuration, 25),
                  isInfinite,
                  isInfiniteLoop,
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
              ? { ...initialPomodoro }
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
              ? { ...initialPomodoro }
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
        const secs = focusDuration * 60;
        set({
          pomodoro: {
            activeTaskId: taskId,
            sessionType: 'focus',
            isRunning: true,
            currentPomodoro: get().pomodoro.activeTaskId === taskId ? get().pomodoro.currentPomodoro : 1,
            isInfinite,
            isInfiniteLoop,
            startTime: now,
            targetEndTime: isInfinite ? null : now + secs * 1000,
            pausedAt: null,
            focusDuration,
            breakDuration,
            baseElapsed: 0,
            baseRemaining: isInfinite ? 0 : secs,
            elapsedSeconds: 0,
            remainingSeconds: isInfinite ? 0 : secs,
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
            baseElapsed: pomodoro.elapsedSeconds,
            baseRemaining: pomodoro.remainingSeconds,
            startTime: null,
          },
        });
      },

      resumePomodoro: () => {
        const { pomodoro } = get();
        if (pomodoro.isRunning) return;
        
        const now = Date.now();
        set({
          pomodoro: {
            ...pomodoro,
            isRunning: true,
            startTime: now,
            pausedAt: null,
          },
        });
      },

      stopPomodoro: () => {
        const { pomodoro, tasks } = get();
        if (pomodoro.activeTaskId && pomodoro.sessionType === 'focus') {
          const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);
          if (activeTask) {
            const elapsedSecs = pomodoro.elapsedSeconds;
            if (elapsedSecs > 0) {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === activeTask.id
                    ? {
                        ...t,
                        elapsedTime: t.elapsedTime + elapsedSecs,
                        pomodorosCompleted: t.pomodorosCompleted + (pomodoro.isInfinite ? 0 : Math.floor(elapsedSecs / (pomodoro.focusDuration * 60))),
                      }
                    : t
                ),
              }));
            }
          }
        }

        set({ pomodoro: { ...initialPomodoro } });
      },

      tickPomodoro: () => {
        const { pomodoro } = get();
        if (!pomodoro.isRunning || !pomodoro.startTime) return;

        const now = Date.now();
        const deltaSecs = Math.floor((now - pomodoro.startTime) / 1000);
        
        const elapsedSeconds = pomodoro.baseElapsed + deltaSecs;
        const remainingSeconds = pomodoro.isInfinite
          ? 0
          : Math.max(0, pomodoro.baseRemaining - deltaSecs);

        set({
          pomodoro: {
            ...pomodoro,
            elapsedSeconds,
            remainingSeconds,
          },
        });
      },

      skipBreak: (focusDuration) => {
        const { pomodoro } = get();
        const now = Date.now();
        const secs = focusDuration * 60;
        set({
          pomodoro: {
            ...pomodoro,
            sessionType: 'focus',
            startTime: now,
            targetEndTime: pomodoro.isInfinite ? null : now + secs * 1000,
            pausedAt: null,
            isRunning: true,
            baseElapsed: 0,
            baseRemaining: pomodoro.isInfinite ? 0 : secs,
            elapsedSeconds: 0,
            remainingSeconds: pomodoro.isInfinite ? 0 : secs,
          },
        });
      },

      startBreak: (breakDuration) => {
        const { pomodoro } = get();
        const now = Date.now();
        const secs = breakDuration * 60;
        set({
          pomodoro: {
            ...pomodoro,
            sessionType: 'break',
            startTime: now,
            targetEndTime: now + secs * 1000,
            pausedAt: null,
            isRunning: true,
            baseElapsed: 0,
            baseRemaining: secs,
            elapsedSeconds: 0,
            remainingSeconds: secs,
          },
        });
      },

      startNextFocus: (focusDuration) => {
        const { pomodoro } = get();
        const now = Date.now();
        const secs = focusDuration * 60;
        set({
          pomodoro: {
            ...pomodoro,
            sessionType: 'focus',
            currentPomodoro: pomodoro.currentPomodoro + 1,
            startTime: now,
            targetEndTime: pomodoro.isInfinite ? null : now + secs * 1000,
            pausedAt: null,
            isRunning: true,
            baseElapsed: 0,
            baseRemaining: pomodoro.isInfinite ? 0 : secs,
            elapsedSeconds: 0,
            remainingSeconds: pomodoro.isInfinite ? 0 : secs,
          },
        });
      },

      resetPomodoro: () => {
        const { pomodoro } = get();
        const secs = pomodoro.focusDuration * 60;
        set({
          pomodoro: {
            ...pomodoro,
            isRunning: false,
            startTime: null,
            targetEndTime: null,
            pausedAt: null,
            baseElapsed: 0,
            baseRemaining: pomodoro.isInfinite ? 0 : secs,
            elapsedSeconds: 0,
            remainingSeconds: pomodoro.isInfinite ? 0 : secs,
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
            pomodoro: { ...initialPomodoro },
          }));
        }
      },

      resetTasks: () => {
        set({
          tasks: [],
          lastResetDate: getTodayKey(),
          pomodoro: { ...initialPomodoro },
        });
      },
    }),
    {
      name: 'study-timer-tasks',
    }
  )
);
