'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Pencil, Check, Clock, RotateCcw } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
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
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const focusDuration = useSettingsStore((s) => s.focusDuration);

  const progress = getProgressPercentage(task.elapsedTime, task.totalDuration * 60);

  if (editing) {
    return (
      <motion.div
        layout
        className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
      >
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group relative p-4 rounded-2xl border transition-all duration-300',
        'bg-[var(--card)] hover:shadow-lg hover:shadow-black/5',
        task.completed
          ? 'border-[var(--accent)]/20 opacity-70'
          : isActive
          ? 'border-[var(--accent)]/50 shadow-lg shadow-[var(--accent)]/5'
          : 'border-[var(--border)] hover:border-[var(--border-hover)]'
      )}
    >
      {/* Progress bar background */}
      {!task.completed && progress > 0 && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-[var(--accent)]/5"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      )}

      <div className="relative flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleComplete(task.id)}
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
            task.completed
              ? 'bg-[var(--accent)] border-[var(--accent)]'
              : 'border-[var(--border)] hover:border-[var(--accent)]'
          )}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check size={12} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-sm font-medium truncate transition-all duration-300',
              task.completed
                ? 'line-through text-[var(--muted)]'
                : 'text-[var(--foreground)]'
            )}
          >
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
              <Clock size={11} />
              {formatDuration(task.totalDuration)}
            </span>
            {task.pomodorosCompleted > 0 && (
              <span className="text-xs text-[var(--accent)] flex items-center gap-1">
                <RotateCcw size={11} />
                {task.pomodorosCompleted}/{task.pomodorosTotal}
              </span>
            )}
            {progress > 0 && !task.completed && (
              <span className="text-xs text-[var(--accent)] font-medium">{progress}%</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!task.completed && !isActive && (
            <button
              onClick={() => onStart(task.id)}
              className="p-2 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-all duration-200 active:scale-95"
              title="Start Pomodoro"
            >
              <Play size={14} fill="currentColor" />
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--muted)] hover:text-red-400 transition-all duration-200"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Mobile Start Button */}
        {!task.completed && !isActive && (
          <button
            onClick={() => onStart(task.id)}
            className="md:hidden p-2 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-all active:scale-95"
          >
            <Play size={14} fill="currentColor" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
