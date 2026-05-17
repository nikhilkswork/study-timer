'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AmbientBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Soft gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card))]" />

      {/* Floating fog layer 1 */}
      <motion.div
        animate={{
          x: ['-5%', '5%', '-5%'],
          y: ['-5%', '5%', '-5%'],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] opacity-[0.03] blur-[120px] rounded-full bg-[hsl(var(--accent))] transform-gpu"
      />

      {/* Floating fog layer 2 (Ocean Teal influence) */}
      <motion.div
        animate={{
          x: ['5%', '-5%', '5%'],
          y: ['5%', '-5%', '5%'],
          scale: [1.05, 1, 1.05],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className="absolute top-[20%] left-[20%] w-[120%] h-[120%] opacity-[0.02] blur-[140px] rounded-full bg-[#14b8a6] transform-gpu"
      />

      {/* Noise grain overlay for cinematic texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
}
