'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ListChecks } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  onStartTask: (taskId: string) => void;
}

export function TaskList({ onStartTask }: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTaskStore((s) => s.pomodoro.activeTaskId);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
          <ListChecks size={20} className="text-[var(--accent)]" />
          Today&apos;s Tasks
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 rounded-xl hover:bg-[var(--hover)] text-[var(--muted)] 
                     hover:text-[var(--foreground)] transition-all duration-200 active:scale-95"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
              <TaskForm onClose={() => setShowForm(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      {tasks.length === 0 && !showForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--hover)] flex items-center justify-center mx-auto mb-4">
            <ListChecks size={28} className="text-[var(--muted)]" />
          </div>
          <p className="text-sm text-[var(--muted)] mb-1">No tasks yet</p>
          <p className="text-xs text-[var(--muted)] opacity-60">
            Add a task to start your focus session
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
                       hover:opacity-90 transition-all active:scale-95"
          >
            <Plus size={14} className="inline mr-1" />
            Add First Task
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={task.id === activeTaskId}
                onStart={onStartTask}
              />
            ))}
          </AnimatePresence>

          {completedTasks.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-3 pb-1">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-xs text-[var(--muted)] font-medium">
                  Completed ({completedTasks.length})
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <AnimatePresence mode="popLayout">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isActive={false}
                    onStart={onStartTask}
                  />
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  );
}
