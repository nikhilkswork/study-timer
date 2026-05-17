'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Moon, Sun, Volume2, VolumeX, Bell, BellOff, Trash2, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const focusDuration = useSettingsStore((s) => s.focusDuration);
  const breakDuration = useSettingsStore((s) => s.breakDuration);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const notificationSound = useSettingsStore((s) => s.notificationSound);
  const theme = useSettingsStore((s) => s.theme);
  const isInfinite = useSettingsStore((s) => s.isInfinite);
  const isInfiniteLoop = useSettingsStore((s) => s.isInfiniteLoop);

  const setFocusDuration = useSettingsStore((s) => s.setFocusDuration);
  const setBreakDuration = useSettingsStore((s) => s.setBreakDuration);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setNotificationSound = useSettingsStore((s) => s.setNotificationSound);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const setIsInfinite = useSettingsStore((s) => s.setIsInfinite);
  const setIsInfiniteLoop = useSettingsStore((s) => s.setIsInfiniteLoop);

  const resetTasks = useTaskStore((s) => s.resetTasks);
  const resetStats = useStatsStore((s) => s.resetStats);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Settings</h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">Customize your Sanctuary space</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Timer Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-5">
        <div className="flex items-center gap-2 border-b border-[var(--border)]/50 pb-3">
          <Timer size={16} className="text-[var(--accent)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Timer Durations</h3>
        </div>

        <div className="space-y-4">
          {/* Focus Duration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-60">
              <span>Focus Duration</span>
              {isInfinite && <span className="text-[var(--accent)] animate-pulse">Infinite Enabled</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">Hours</span>
                <input
                  type="number"
                  min={0}
                  max={24}
                  disabled={isInfinite}
                  value={isInfinite ? '' : Math.floor(focusDuration / 60)}
                  onChange={(e) => {
                    const hrs = Math.max(0, parseInt(e.target.value) || 0);
                    const mins = focusDuration % 60;
                    setFocusDuration(hrs * 60 + mins);
                  }}
                  placeholder={isInfinite ? '∞' : '0'}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                             text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono text-center"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">Minutes</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  disabled={isInfinite}
                  value={isInfinite ? '' : focusDuration % 60}
                  onChange={(e) => {
                    const hrs = Math.floor(focusDuration / 60);
                    const mins = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                    setFocusDuration(hrs * 60 + mins);
                  }}
                  placeholder={isInfinite ? '∞' : '25'}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                             text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Break Duration */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-60">
              Break Duration
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">Hours</span>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={Math.floor(breakDuration / 60)}
                  onChange={(e) => {
                    const hrs = Math.max(0, parseInt(e.target.value) || 0);
                    const mins = breakDuration % 60;
                    setBreakDuration(hrs * 60 + mins);
                  }}
                  placeholder="0"
                  className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                             text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50
                             transition-all text-xs font-mono text-center"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">Minutes</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={breakDuration % 60}
                  onChange={(e) => {
                    const hrs = Math.floor(breakDuration / 60);
                    const mins = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                    setBreakDuration(hrs * 60 + mins);
                  }}
                  placeholder="5"
                  className="w-full px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                             text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50
                             transition-all text-xs font-mono text-center"
                />
              </div>
            </div>
          </div>

          {/* Infinite toggles */}
          <div className="pt-2 space-y-2 border-t border-[var(--border)]/50">
            <button
              onClick={() => setIsInfinite(!isInfinite)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider
                ${isInfinite 
                  ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-[0_0_24px_rgba(255,255,255,0.06)]' 
                  : 'bg-[var(--input-bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              <span>∞ Default Infinite Sessions</span>
              <span>{isInfinite ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setIsInfiniteLoop(!isInfiniteLoop)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider
                ${isInfiniteLoop 
                  ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-[0_0_24px_rgba(255,255,255,0.06)]' 
                  : 'bg-[var(--input-bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              <span>∞ Default Infinite Pomodoro Loop</span>
              <span>{isInfiniteLoop ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Appearance</h3>
        <button onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--hover)] transition-colors">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={18} className="text-[var(--accent)]" /> : <Sun size={18} className="text-orange-400" />}
            <span className="text-sm text-[var(--foreground)]">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
            <motion.div className="w-5 h-5 rounded-full bg-white" animate={{ x: theme === 'dark' ? 16 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </div>
        </button>
      </motion.div>

      {/* Sound Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Sound</h3>

        <button onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--hover)] transition-colors">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 size={18} className="text-[var(--accent)]" /> : <VolumeX size={18} className="text-[var(--muted)]" />}
            <span className="text-sm text-[var(--foreground)]">Ambient Sounds</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${soundEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
            <motion.div className="w-5 h-5 rounded-full bg-white" animate={{ x: soundEnabled ? 16 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </div>
        </button>

        <button onClick={() => setNotificationSound(!notificationSound)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--hover)] transition-colors">
          <div className="flex items-center gap-3">
            {notificationSound ? <Bell size={18} className="text-[var(--accent)]" /> : <BellOff size={18} className="text-[var(--muted)]" />}
            <span className="text-sm text-[var(--foreground)]">Timer Notifications</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${notificationSound ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
            <motion.div className="w-5 h-5 rounded-full bg-white" animate={{ x: notificationSound ? 16 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </div>
        </button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl bg-[var(--card)] border border-red-500/20 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Data</h3>

        {showConfirm === 'tasks' ? (
          <div className="flex gap-2">
            <button onClick={() => { resetTasks(); setShowConfirm(null); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
              Confirm Reset
            </button>
            <button onClick={() => setShowConfirm(null)}
              className="px-4 py-2.5 rounded-xl bg-[var(--hover)] text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConfirm('tasks')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left">
            <Trash2 size={18} className="text-red-400" />
            <div>
              <p className="text-sm text-[var(--foreground)]">Reset Tasks</p>
              <p className="text-xs text-[var(--muted)]">Clear all tasks</p>
            </div>
          </button>
        )}

        {showConfirm === 'stats' ? (
          <div className="flex gap-2">
            <button onClick={() => { resetStats(); setShowConfirm(null); }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
              Confirm Reset
            </button>
            <button onClick={() => setShowConfirm(null)}
              className="px-4 py-2.5 rounded-xl bg-[var(--hover)] text-[var(--muted)] text-sm hover:text-[var(--foreground)] transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConfirm('stats')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-left">
            <RotateCcw size={18} className="text-red-400" />
            <div>
              <p className="text-sm text-[var(--foreground)]">Reset Statistics</p>
              <p className="text-xs text-[var(--muted)]">Clear all progress data</p>
            </div>
          </button>
        )}
      </motion.div>

      {/* App info */}
      <p className="text-center text-xs text-[var(--muted)] pb-4">Focus v1.0 · Built with ♥</p>
    </div>
  );
}
