'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Volume2, VolumeX, Bell, BellOff, Trash2, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const notificationSound = useSettingsStore((s) => s.notificationSound);
  const theme = useSettingsStore((s) => s.theme);

  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setNotificationSound = useSettingsStore((s) => s.setNotificationSound);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  const resetTasks = useTaskStore((s) => s.resetTasks);
  const resetStats = useStatsStore((s) => s.resetStats);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Settings</h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[hsl(var(--muted))] mt-1">Configure your workspace</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[2rem] bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted))] opacity-80">Appearance</h3>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--hover))] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon size={18} className="text-[hsl(var(--accent))]" />
            ) : (
              <Sun size={18} className="text-amber-500" />
            )}
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`}>
            <motion.div
              className="w-5 h-5 rounded-full bg-white"
              animate={{ x: theme === 'dark' ? 16 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </motion.div>

      {/* Sound Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-6 rounded-[2rem] bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted))] opacity-80">Sound</h3>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--hover))] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 size={18} className="text-[hsl(var(--accent))]" />
            ) : (
              <VolumeX size={18} className="text-[hsl(var(--muted))]" />
            )}
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Ambient Sounds</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${soundEnabled ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`}>
            <motion.div
              className="w-5 h-5 rounded-full bg-white"
              animate={{ x: soundEnabled ? 16 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>

        <button
          onClick={() => setNotificationSound(!notificationSound)}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--hover))] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {notificationSound ? (
              <Bell size={18} className="text-[hsl(var(--accent))]" />
            ) : (
              <BellOff size={18} className="text-[hsl(var(--muted))]" />
            )}
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Timer Alerts</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${notificationSound ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`}>
            <motion.div
              className="w-5 h-5 rounded-full bg-white"
              animate={{ x: notificationSound ? 16 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-[2rem] bg-[hsl(var(--card))] border border-red-500/20 space-y-4"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 opacity-80">Danger Zone</h3>

        {showConfirm === 'tasks' ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetTasks();
                setShowConfirm(null);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="px-4 py-2.5 rounded-xl bg-[hsl(var(--hover))] text-[hsl(var(--muted))] text-sm hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm('tasks')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/5 transition-colors text-left cursor-pointer"
          >
            <Trash2 size={16} className="text-red-400" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Reset Intentions Log</p>
              <p className="text-[10px] text-[hsl(var(--muted))] mt-0.5">Clear all logged study sessions</p>
            </div>
          </button>
        )}

        {showConfirm === 'stats' ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetStats();
                setShowConfirm(null);
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="px-4 py-2.5 rounded-xl bg-[hsl(var(--hover))] text-[hsl(var(--muted))] text-sm hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm('stats')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/5 transition-colors text-left cursor-pointer"
          >
            <RotateCcw size={16} className="text-red-400" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Reset Statistics</p>
              <p className="text-[10px] text-[hsl(var(--muted))] mt-0.5">Clear all streaks and study hour logs</p>
            </div>
          </button>
        )}
      </motion.div>

      {/* App info */}
      <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] opacity-60 pt-4">
        Study Comodoro v2.0
      </p>
    </div>
  );
}
