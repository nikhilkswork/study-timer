'use client';

import { useReducer } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTaskStore } from '@/stores/useTaskStore';

interface TaskFormProps {
  onClose?: () => void;
  editId?: string;
  editTitle?: string;
  editDuration?: number;
  editIsInfinite?: boolean;
}

interface FormState {
  title: string;
  hours: number;
  minutes: number;
  isInfinite: boolean;
  error: string;
}

type FormAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_HOURS'; payload: number }
  | { type: 'SET_MINUTES'; payload: number }
  | { type: 'TOGGLE_INFINITE' }
  | { type: 'SET_PRESET'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload, error: '' };
    case 'SET_HOURS':
      return { ...state, hours: action.payload, error: '' };
    case 'SET_MINUTES':
      return { ...state, minutes: action.payload, error: '' };
    case 'TOGGLE_INFINITE':
      const nextInfinite = !state.isInfinite;
      return {
        ...state,
        isInfinite: nextInfinite,
        hours: nextInfinite ? 0 : state.hours || 0,
        minutes: nextInfinite ? 0 : state.minutes || 25,
        error: '',
      };
    case 'SET_PRESET':
      return {
        ...state,
        isInfinite: false,
        hours: Math.floor(action.payload / 60),
        minutes: action.payload % 60,
        error: '',
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function TaskForm({ onClose, editId, editTitle, editDuration, editIsInfinite }: TaskFormProps) {
  const [state, dispatch] = useReducer(formReducer, {
    title: editTitle || '',
    hours: editDuration ? Math.floor(editDuration / 60) : 0,
    minutes: editDuration ? editDuration % 60 : 25,
    isInfinite: editIsInfinite || false,
    error: '',
  });

  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = state.title.trim();
    if (!trimmedTitle) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a task title' });
      return;
    }

    if (state.isInfinite) {
      if (editId) {
        editTask(editId, trimmedTitle, 0, true);
      } else {
        addTask(trimmedTitle, 0, true);
      }
    } else {
      const totalMinutes = state.hours * 60 + state.minutes;
      if (totalMinutes < 1) {
        dispatch({ type: 'SET_ERROR', payload: 'Duration must be at least 1 minute' });
        return;
      }
      if (totalMinutes > 1440) {
        dispatch({ type: 'SET_ERROR', payload: 'Duration cannot exceed 24 hours' });
        return;
      }

      if (editId) {
        editTask(editId, trimmedTitle, totalMinutes, false);
      } else {
        addTask(trimmedTitle, totalMinutes, false);
      }
    }

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
      className="space-y-5"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-60">Intention</span>
        <input
          type="text"
          value={state.title}
          onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
          placeholder="What are you studying?"
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                     text-[var(--foreground)] placeholder:text-[var(--muted)] 
                     focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]
                     transition-all duration-200 text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-60">
            Duration Selection
          </span>
          {state.isInfinite && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] animate-pulse">
              Count-up Active
            </span>
          )}
        </div>

        {!state.isInfinite && (
          <div className="flex gap-2 flex-wrap mb-1">
            {presetDurations.map((d) => {
              const currentTotal = state.hours * 60 + state.minutes;
              const isSelected = !state.isInfinite && currentTotal === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_PRESET', payload: d })}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
                    }`}
                >
                  {d}m
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">Hours</span>
            <input
              type="number"
              min={0}
              max={24}
              disabled={state.isInfinite}
              value={state.isInfinite ? '' : state.hours}
              onChange={(e) => dispatch({ type: 'SET_HOURS', payload: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder={state.isInfinite ? '∞' : '0'}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                         text-[var(--foreground)] placeholder:text-[var(--muted)]
                         focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-sm font-mono text-center"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] opacity-40">Minutes</span>
            <input
              type="number"
              min={0}
              max={59}
              disabled={state.isInfinite}
              value={state.isInfinite ? '' : state.minutes}
              onChange={(e) => dispatch({ type: 'SET_MINUTES', payload: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
              placeholder={state.isInfinite ? '∞' : '25'}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] 
                         text-[var(--foreground)] placeholder:text-[var(--muted)]
                         focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-sm font-mono text-center"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_INFINITE' })}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-wider
            ${
              state.isInfinite
                ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-[0_0_24px_rgba(255,255,255,0.06)]'
                : 'bg-[var(--input-bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
            }`}
        >
          {state.isInfinite ? '∞ Infinite Mode: Enabled' : '∞ Enable Infinite Mode'}
        </button>
      </div>

      {state.error && (
        <p className="text-xs text-red-400 font-medium tracking-tight">{state.error}</p>
      )}

      <div className="flex gap-2 pt-2 border-t border-[var(--border)]/50">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-[var(--accent)] text-white font-semibold text-xs uppercase tracking-wider
                     hover:opacity-90 transition-all duration-200 active:scale-[0.98] glow-soft"
        >
          <Plus size={14} />
          {editId ? 'Save Changes' : 'Add Intention'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-[var(--hover)] text-[var(--muted)] 
                       font-semibold text-xs uppercase tracking-wider hover:text-[var(--foreground)] transition-all duration-200"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.form>
  );
}
