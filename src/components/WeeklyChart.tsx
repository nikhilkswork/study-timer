'use client';

import { useStatsStore } from '@/stores/useStatsStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export function WeeklyChart() {
  const weeklyData = useStatsStore((s) => s.weeklyData);

  const data = weeklyData.map((d) => ({
    day: format(parseISO(d.date), 'EEE'),
    minutes: d.focusMinutes,
    tasks: d.completedTasks,
  }));

  return (
    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Weekly Focus</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--foreground)',
              }}
              formatter={(value) => [`${value} min`, 'Focus']}
              cursor={{ fill: 'var(--hover)' }}
            />
            <Bar
              dataKey="minutes"
              fill="var(--accent)"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
