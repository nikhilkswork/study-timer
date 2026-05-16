'use client';

import { Flame, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStatsStore } from '@/stores/useStatsStore';
import { useTaskStore } from '@/stores/useTaskStore';

export function StatsOverview() {
  const tasks = useTaskStore((s) => s.tasks);
  const currentStreak = useStatsStore((s) => s.currentStreak);
  const totalFocusMinutes = useStatsStore((s) => s.totalFocusMinutes);

  const completedToday = tasks.filter((t) => t.completed).length;
  const totalToday = tasks.length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const focusHours = (totalFocusMinutes / 60).toFixed(1);

  const stats = [
    {
      icon: CheckCircle2,
      label: 'Focus Earned',
      value: `${completedToday} / ${totalToday}`,
    },
    {
      icon: Clock,
      label: 'Deep Work',
      value: `${focusHours}h`,
    },
    {
      icon: Flame,
      label: 'Consistency',
      value: `${currentStreak} Days`,
    },
    {
      icon: TrendingUp,
      label: 'Completion',
      value: `${completionPct}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 + 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 rounded-[2rem] bg-[hsl(var(--card))] border border-[hsl(var(--border))] group hover:border-[hsl(var(--muted))] transition-all duration-700"
        >
          <div className="flex items-start justify-between mb-3">
            <stat.icon size={18} className="text-[hsl(var(--muted))] group-hover:text-[hsl(var(--accent))] transition-colors duration-700" />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{stat.value}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] mt-1 opacity-60">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
