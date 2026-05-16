import { format, isToday, differenceInCalendarDays } from 'date-fns';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isDateToday(dateString: string): boolean {
  return isToday(new Date(dateString));
}

export function daysBetween(date1: string, date2: string): number {
  return Math.abs(differenceInCalendarDays(new Date(date1), new Date(date2)));
}

export function calculatePomodorosNeeded(totalMinutes: number, focusDuration: number): number {
  return Math.ceil(totalMinutes / focusDuration);
}

export function getProgressPercentage(elapsed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((elapsed / total) * 100));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
