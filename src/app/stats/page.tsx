'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { useStatsStore } from '@/stores/useStatsStore';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const currentStreak = useStatsStore((s) => s.currentStreak);
  const totalFocusMinutes = useStatsStore((s) => s.totalFocusMinutes);
  const totalCompletedTasks = useStatsStore((s) => s.totalCompletedTasks);
  const weeklyData = useStatsStore((s) => s.weeklyData);

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

  const focusHours = (totalFocusMinutes / 60).toFixed(1);
  const todayData = weeklyData[weeklyData.length - 1];

  const statCards = [
    {
      icon: Flame,
      label: 'Focus Streak',
      value: `${currentStreak}`,
      unit: 'days',
      bg: 'bg-[hsl(var(--accent))]/10',
      color: 'text-[hsl(var(--accent))]',
    },
    {
      icon: Clock,
      label: 'Total Focus',
      value: focusHours,
      unit: 'hours',
      bg: 'bg-[hsl(var(--accent))]/10',
      color: 'text-[hsl(var(--accent))]',
    },
    {
      icon: CheckCircle2,
      label: 'Sessions Completed',
      value: `${totalCompletedTasks}`,
      unit: 'sessions',
      bg: 'bg-[hsl(var(--accent))]/10',
      color: 'text-[hsl(var(--accent))]',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))]/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Stats</h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-[hsl(var(--muted))] mt-1">Focus & consistency log</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Today's Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[2rem] bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-4"
      >
        <div className="flex items-center gap-2 text-[hsl(var(--muted))]">
          <Calendar size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Focus</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">
              {todayData?.focusMinutes || 0}m
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] mt-1 opacity-70">Focus Time</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">
              {todayData?.completedTasks || 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] mt-1 opacity-70">Sessions Logged</p>
          </div>
        </div>
      </motion.div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-[2rem] bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-2xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={18} className={card.color} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted))] opacity-70">
                  {card.label}
                </p>
                <p className="text-xs text-[hsl(var(--muted))] font-medium mt-0.5">
                  {card.unit}
                </p>
              </div>
            </div>
            <p className="text-3xl font-semibold text-[hsl(var(--foreground))] font-mono">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <WeeklyChart />
      </motion.div>
    </div>
  );
}
