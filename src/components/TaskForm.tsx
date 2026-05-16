'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';

interface TaskFormProps {
  onClose?: () => void;
  editId?: string;
  editTitle?: string;
  editDuration?: number;
}

export function TaskForm({ onClose, editId, editTitle, editDuration }: TaskFormProps) {
  const [title, setTitle] = useState(editTitle || '');
  const [duration, setDuration] = useState(editDuration?.toString() || '');
  const [error, setError] = useState('');

  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title');
      return;
    }

    const mins = parseInt(duration, 10);
    if (!mins || mins < 1 || mins > 480) {
      setError('Duration must be 1–480 minutes');
      return;
    }

    if (editId) {
      editTask(editId, trimmedTitle, mins);
    } else {
      addTask(trimmedTitle, mins);
    }

    setTitle('');
    setDuration('');
    onClose?.();
  };

  const presetDurations = [25, 30, 45, 60, 90, 120];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What are you studying?"
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                     text-[var(--foreground)] placeholder:text-[var(--muted)] 
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]
                     transition-all duration-200 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-2">
          Duration (minutes)
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {presetDurations.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  duration === d.toString()
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
                }`}
            >
              {d}m
            </button>
          ))}
        </div>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Custom duration"
          min={1}
          max={480}
          className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                     text-[var(--foreground)] placeholder:text-[var(--muted)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]
                     transition-all duration-200 text-sm"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     bg-[var(--accent)] text-white font-medium text-sm
                     hover:opacity-90 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus size={16} />
          {editId ? 'Save Changes' : 'Add Task'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[var(--hover)] text-[var(--muted)] 
                       font-medium text-sm hover:text-[var(--foreground)] transition-all duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </motion.form>
  );
}
