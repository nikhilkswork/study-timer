'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ListChecks } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';
import { TaskItem } from './TaskItem';

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const setSetupStep = useTaskStore((s) => s.setSetupStep);
  const setSetupSubject = useTaskStore((s) => s.setSetupSubject);

  const startNewIntention = () => {
    setSetupSubject('');
    setSetupStep('subject');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted))] opacity-80 flex items-center gap-2">
          <ListChecks size={14} className="text-[hsl(var(--accent))]" />
          Today&apos;s Intentions
        </h2>
        <button
          onClick={startNewIntention}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-semibold
                     hover:opacity-95 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus size={12} />
          Add Intention
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-[2rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))]/30"
        >
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--hover))] flex items-center justify-center mx-auto mb-4">
            <ListChecks size={24} className="text-[hsl(var(--muted))] opacity-70" />
          </div>
          <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1">Sanctuary Log is empty</p>
          <p className="text-xs text-[hsl(var(--muted))] max-w-xs mx-auto text-balance">
            Start a study session to log your first focus period of the day.
          </p>
          <button
            onClick={startNewIntention}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-white text-xs font-semibold
                       hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Start Studying
          </button>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
