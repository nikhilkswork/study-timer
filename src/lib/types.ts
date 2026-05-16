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
}

export type SessionType = 'focus' | 'break';

export interface PomodoroState {
  activeTaskId: string | null;
  sessionType: SessionType;
  timeRemaining: number; // seconds
  isRunning: boolean;
  currentPomodoro: number;
}

export interface Settings {
  focusDuration: number; // minutes
  breakDuration: number; // minutes
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  ambientSound: AmbientSound;
  ambientVolume: number;
  notificationSound: boolean;
}

export type AmbientSound = 'none' | 'rain' | 'brownNoise' | 'lofi';

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
