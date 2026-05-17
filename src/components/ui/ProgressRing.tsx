'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  isRippling?: boolean;
}

export function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 6,
  className,
  children,
  color,
  isRippling = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;



  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90 filter drop-shadow-sm z-10 relative">
        {/* Atmosphere / Glow ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth * 1.5}
          className="opacity-[0.03] blur-[2px]"
        />
        
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-[0.06]"
        />

        {/* --- Ripple Effects --- */}
        {isRippling && (
          <>
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color || 'hsl(var(--accent))'}
              strokeWidth={strokeWidth * 0.5}
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 0 }}
              style={{ willChange: 'transform' }}
              className="origin-center blur-[2px]"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color || 'hsl(var(--accent))'}
              strokeWidth={strokeWidth * 0.3}
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{ scale: 1.25, opacity: 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 1.3 }}
              style={{ willChange: 'transform' }}
              className="origin-center blur-[4px]"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color || 'hsl(var(--accent))'}
              strokeWidth={strokeWidth * 0.2}
              initial={{ scale: 1, opacity: 0.1 }}
              animate={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 2.6 }}
              style={{ willChange: 'transform' }}
              className="origin-center blur-[6px]"
            />
          </>
        )}
        
        {/* Progress ring glow */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || 'hsl(var(--accent))'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="opacity-20 blur-[8px]"
        />

        {/* Sharp Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || 'url(#progressGradient)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Timer content container with hardware-accelerated static glass effect */}
      {children && (
        <div 
          className={cn(
            "absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-1000 z-20",
            isRippling && "glass bg-black/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
