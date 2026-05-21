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
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[hsl(var(--accent))] text-white text-[10px] font-bold uppercase tracking-wider
                     hover:bg-[hsl(var(--accent-hover))] hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer shadow-md shadow-[hsl(var(--accent))]/10"
        >
          <Plus size={11} />
          Add Intention
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-[2rem] premium-card"
        >
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--hover))] flex items-center justify-center mx-auto mb-4 border border-[hsl(var(--border))]/40">
            <ListChecks size={22} className="text-[hsl(var(--muted))] opacity-75" />
          </div>
          <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-1">Comodoro Log is empty</p>
          <p className="text-xs text-[hsl(var(--muted))] max-w-xs mx-auto text-balance">
            Start a study session to log your first focus period of the day.
          </p>
          <button
            onClick={startNewIntention}
            className="mt-6 px-6 py-3 rounded-full bg-[hsl(var(--accent))] text-white text-[10px] font-bold uppercase tracking-wider
                       hover:bg-[hsl(var(--accent-hover))] hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer shadow-md shadow-[hsl(var(--accent))]/10"
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
