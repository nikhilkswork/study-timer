'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Pencil, Check, Clock, RotateCcw } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { formatDuration, getProgressPercentage, cn } from '@/lib/utils';
import { TaskForm } from './TaskForm';
import type { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onStart: (taskId: string) => void;
}

export function TaskItem({ task, isActive, onStart }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const progress = getProgressPercentage(task.elapsedTime, task.totalDuration * 60);

  if (editing) {
    return (
      <motion.div layout className="p-6 rounded-[2rem] glass">
        <TaskForm
          editId={task.id}
          editTitle={task.title}
          editDuration={task.totalDuration}
          onClose={() => setEditing(false)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative p-6 rounded-[2rem] transition-all duration-700 overflow-hidden',
        task.completed
          ? 'bg-[hsl(var(--hover))] opacity-60'
          : isActive
          ? 'glass shadow-2xl shadow-[hsl(var(--accent)/0.15)] ring-1 ring-[hsl(var(--accent)/0.2)]'
          : 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--hover))] hover:shadow-xl hover:shadow-black/5'
      )}
    >
      {/* ── Progress Ambient Glow ── */}
      {!task.completed && progress > 0 && (
        <motion.div
          className="absolute inset-0 bg-[hsl(var(--accent))] opacity-[0.03] pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: `${progress - 100}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      <div className="relative flex items-center gap-5">
        {/* ── Indicator ── */}
        <div
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-700',
            task.completed
              ? 'bg-[hsl(var(--accent))] border-[hsl(var(--accent))]'
              : isActive
              ? 'border-[hsl(var(--accent))] glow-soft'
              : 'border-[hsl(var(--border))] group-hover:border-[hsl(var(--muted))]'
          )}
        >
          {task.completed ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          ) : isActive ? (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]" 
            />
          ) : null}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3
            className={cn(
              'text-base font-medium truncate transition-all duration-700 tracking-tight',
              task.completed ? 'text-[hsl(var(--muted))] line-through' : 'text-[hsl(var(--foreground))]'
            )}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted))] flex items-center gap-1.5">
              <Clock size={12} className="opacity-60" />
              {formatDuration(task.totalDuration)}
            </span>
            {task.pomodorosCompleted > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--accent))] flex items-center gap-1.5">
                <RotateCcw size={12} className="opacity-60" />
                {task.pomodorosCompleted} / {task.pomodorosTotal}
              </span>
            )}
            {progress > 0 && !task.completed && (
              <div className="flex items-center gap-2">
                <div className="w-12 h-[2px] bg-[hsl(var(--border))] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[hsl(var(--accent))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[hsl(var(--accent))]">{progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
          {!task.completed && !isActive && (
            <button
              onClick={() => onStart(task.id)}
              className="p-3 rounded-2xl bg-[hsl(var(--accent))] text-white hover:opacity-90 transition-all active:scale-95 glow-soft"
              title="Enter Focus"
            >
              <Play size={16} fill="currentColor" />
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="p-3 rounded-2xl bg-[hsl(var(--hover))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all active:scale-95"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-3 rounded-2xl bg-[hsl(var(--hover))] text-[hsl(var(--muted))] hover:text-red-400 transition-all active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* ── Mobile Prompt ── */}
        {!task.completed && !isActive && (
          <button
            onClick={() => onStart(task.id)}
            className="md:hidden p-3 rounded-2xl bg-[hsl(var(--accent))] text-white active:scale-95"
          >
            <Play size={16} fill="currentColor" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
