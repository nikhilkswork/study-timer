'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { useStatsStore } from '@/stores/useStatsStore';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const currentStreak = useStatsStore((s) => s.currentStreak);
  const longestStreak = useStatsStore((s) => s.longestStreak);
  const totalFocusMinutes = useStatsStore((s) => s.totalFocusMinutes);
  const totalCompletedTasks = useStatsStore((s) => s.totalCompletedTasks);
  const weeklyData = useStatsStore((s) => s.weeklyData);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const focusHours = (totalFocusMinutes / 60).toFixed(1);
  const todayData = weeklyData[weeklyData.length - 1];

  const statCards = [
    { icon: Flame, label: 'Current Streak', value: `${currentStreak}`, unit: 'days', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: TrendingUp, label: 'Best Streak', value: `${longestStreak}`, unit: 'days', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Clock, label: 'Total Focus', value: focusHours, unit: 'hours', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: CheckCircle2, label: 'Tasks Done', value: `${totalCompletedTasks}`, unit: 'total', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Statistics</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Your focus journey</p>
        </div>
        <ThemeToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5 border border-[var(--accent)]/20">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">Today</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{todayData?.focusMinutes || 0}m</p>
            <p className="text-xs text-[var(--muted)]">Focus time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{todayData?.completedTasks || 0}</p>
            <p className="text-xs text-[var(--muted)]">Tasks completed</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{card.value}</p>
            <p className="text-xs text-[var(--muted)]">{card.unit} · {card.label}</p>
          </motion.div>
        ))}
      </div>

      <WeeklyChart />
    </div>
  );
}
