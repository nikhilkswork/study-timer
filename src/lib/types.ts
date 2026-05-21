export interface Task {
  id: string;
  title: string;
  totalDuration: number; // total minutes
  elapsedTime: number; // elapsed seconds
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  pomodorosCompleted: number;
  pomodorosTotal: number;
  isInfinite?: boolean;
  isInfiniteLoop?: boolean;
}

export type SessionType = 'focus' | 'break';
export type FocusMode = 'pomodoro' | 'timer' | 'stopwatch';

export interface PomodoroState {
  activeTaskId: string | null;
  sessionType: SessionType; // 'focus' | 'break'
  isRunning: boolean;
  currentPomodoro: number; // cycle/pomodoro number, e.g. 1, 2, 3...
  isInfinite: boolean; // is this session an infinite focus session?
  isInfiniteLoop: boolean; // is this an infinite Pomodoro loop?
  startTime: number | null; // Date.now() when session started
  targetEndTime: number | null; // Date.now() when session should end
  pausedAt: number | null; // Date.now() when session was paused
  focusDuration: number; // duration of focus in minutes
  breakDuration: number; // duration of break in minutes
  baseElapsed: number; // elapsed seconds before current run
  baseRemaining: number; // remaining seconds before current run
  elapsedSeconds: number; // live calculated elapsed seconds
  remainingSeconds: number; // live calculated remaining seconds
  mode: FocusMode; // 'pomodoro' | 'timer' | 'stopwatch'
}

export interface Settings {
  focusDuration: number; // minutes
  breakDuration: number; // minutes
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  ambientSound: AmbientSound;
  ambientVolume: number;
  notificationSound: boolean;
  isInfinite: boolean; // default infinite setting
  isInfiniteLoop: boolean; // default infinite loop setting
}

export type AmbientSound = 'none' | 'rain' | 'brownNoise' | 'cafe' | 'forest';

export interface DayStats {
  date: string; // YYYY-MM-DD
  completedTasks: number;
  focusMinutes: number;
  totalTasks: number;
}

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalFocusMinutes: number;
  totalCompletedTasks: number;
  weeklyData: DayStats[];
  lastActiveDate: string;
}
