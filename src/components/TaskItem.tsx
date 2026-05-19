'use client';

import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
}

export function formatStudyTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function TaskItem({ task }: TaskItemProps) {
  const deleteTask = useTaskStore((s) => s.deleteTask);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--muted))] transition-all duration-300 flex items-center justify-between"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Completed Icon */}
        <div className="flex-shrink-0 text-[hsl(var(--accent))]">
          <CheckCircle2 size={18} strokeWidth={2.5} />
        </div>

        {/* Text Details */}
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] truncate tracking-tight">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] flex items-center gap-1">
              <Clock size={11} className="opacity-70" />
              {formatStudyTime(task.elapsedTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Action */}
      <button
        onClick={() => deleteTask(task.id)}
        className="p-2.5 rounded-xl bg-[hsl(var(--hover))] text-[hsl(var(--muted))] hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 active:scale-95 cursor-pointer"
        title="Delete log"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
