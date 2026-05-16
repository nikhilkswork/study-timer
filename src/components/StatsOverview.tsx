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

  const cards = [
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: `${completedToday}/${totalToday}`,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Clock,
      label: 'Focus Time',
      value: `${focusHours}h`,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${currentStreak}d`,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Today',
      value: `${completionPct}%`,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent)]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]
                     hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
        >
          <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
            <card.icon size={16} className={card.color} />
          </div>
          <p className="text-xl font-bold text-[var(--foreground)]">{card.value}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
