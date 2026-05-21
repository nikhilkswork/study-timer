'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useStatsStore } from '@/stores/useStatsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
  maxAlpha: number;
  twinkle?: boolean;
}

export function AmbientBackground() {
  const [mounted, setMounted] = useState(false);
  const totalFocusMinutes = useStatsStore((s) => s.totalFocusMinutes);
  const theme = useSettingsStore((s) => s.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Determine Sanctuary Level based on totalFocusMinutes
  // Level 1: Mist (0 - 29m)
  // Level 2: Dawn (30 - 119m)
  // Level 3: Aurora (120 - 299m)
  // Level 4: Canopy (300 - 599m)
  // Level 5: Cosmic Sanctuary (600m+)
  const level = totalFocusMinutes < 30 ? 1
              : totalFocusMinutes < 120 ? 2
              : totalFocusMinutes < 300 ? 3
              : totalFocusMinutes < 600 ? 4
              : 5;

  // Particle Engine for Level 3+
  useEffect(() => {
    if (!mounted || level < 3) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const particleCount = level === 3 ? 20 : level === 4 ? 45 : 75;
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1, // Float upward slowly
        size: Math.random() * (level === 5 ? 2.5 : 2.0) + 0.6,
        alpha: Math.random(),
        alphaSpeed: 0.003 + Math.random() * 0.005,
        maxAlpha: 0.15 + Math.random() * 0.35,
        twinkle: level === 5 && Math.random() > 0.7,
      });
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((p) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = canvas.height;

        // Twinkle / Breathe opacity
        p.alpha += p.alphaSpeed;
        if (p.alpha > p.maxAlpha || p.alpha < 0) {
          p.alphaSpeed = -p.alphaSpeed;
          p.alpha = Math.max(0, Math.min(p.maxAlpha, p.alpha));
        }

        // Render
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        if (p.twinkle) {
          // Sparkly golden tint
          ctx.fillStyle = theme === 'dark' 
            ? `rgba(253, 224, 71, ${p.alpha})` 
            : `rgba(245, 158, 11, ${p.alpha})`;
        } else {
          // Accent colored glow
          ctx.fillStyle = theme === 'dark' 
            ? `rgba(167, 243, 208, ${p.alpha})` 
            : `rgba(45, 85, 55, ${p.alpha})`;
        }
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [mounted, level, theme]);

  if (!mounted) return null;

  // Gradients for Light vs Dark mode based on Sanctuary level
  const lightGradients = [
    'from-[hsl(var(--background))] to-[hsl(var(--card))]',
    'from-[hsl(var(--background))] via-[hsl(var(--card))] to-[#fef3c7]/20',
    'from-[hsl(var(--background))] via-[hsl(var(--card))] to-[rgba(167,243,208,0.15)]',
    'from-[hsl(var(--background))] via-[#f0f4f1] to-[rgba(167,243,208,0.25)]',
    'from-[hsl(var(--background))] via-[#ecf3ee] to-[rgba(147,223,188,0.35)]'
  ];

  const darkGradients = [
    'from-[hsl(var(--background))] to-[hsl(var(--card))]',
    'from-[hsl(var(--background))] via-[hsl(var(--card))] to-[#062f4f]/10',
    'from-[hsl(var(--background))] via-[hsl(var(--card))] to-[#022c22]/20',
    'from-[#041a16] via-[hsl(var(--background))] to-[#064e3b]/30',
    'from-[#021411] via-[#060c0a] to-[#043327]/40'
  ];

  const currentGradient = theme === 'dark' ? darkGradients[level - 1] : lightGradients[level - 1];

  // Fog configurations (light vs dark)
  const getFog1Color = () => {
    if (theme === 'light') {
      if (level === 1) return 'opacity-[0.03] bg-[hsl(var(--accent))]';
      if (level === 2) return 'opacity-[0.05] bg-[#f59e0b]'; // gold dawn
      if (level === 3) return 'opacity-[0.07] bg-[#10b981]'; // mint green
      if (level === 4) return 'opacity-[0.10] bg-[#059669]';
      return 'opacity-[0.13] bg-[#047857]';
    } else {
      if (level === 1) return 'opacity-[0.03] bg-[hsl(var(--accent))]';
      if (level === 2) return 'opacity-[0.05] bg-[#10b981]';
      if (level === 3) return 'opacity-[0.08] bg-[#059669]';
      if (level === 4) return 'opacity-[0.12] bg-[#065f46]';
      return 'opacity-[0.16] bg-[#022c22]';
    }
  };

  const getFog2Color = () => {
    if (theme === 'light') {
      if (level === 1) return 'opacity-[0.02] bg-[#a7f3d0]';
      if (level === 2) return 'opacity-[0.03] bg-[#86efac]';
      if (level === 3) return 'opacity-[0.05] bg-[#34d399]';
      if (level === 4) return 'opacity-[0.07] bg-[#059669]';
      return 'opacity-[0.10] bg-[#065f46]';
    } else {
      if (level === 1) return 'opacity-[0.02] bg-[#06b6d4]';
      if (level === 2) return 'opacity-[0.03] bg-[#0d9488]';
      if (level === 3) return 'opacity-[0.05] bg-[#0f766e]';
      if (level === 4) return 'opacity-[0.08] bg-[#115e59]';
      return 'opacity-[0.12] bg-[#134e4a]';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Soft gradient base - deepens with level */}
      <div className={`absolute inset-0 transition-all duration-1000 bg-gradient-to-b ${currentGradient}`} />

      {/* Floating fog layer 1 */}
      <motion.div
        animate={{
          x: ['-5%', '5%', '-5%'],
          y: ['-5%', '5%', '-5%'],
          scale: level >= 4 ? [1.02, 1.07, 1.02] : [1, 1.05, 1],
        }}
        transition={{
          duration: level >= 4 ? 35 : 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className={`absolute -top-[20%] -left-[20%] w-[140%] h-[140%] blur-[120px] rounded-full transform-gpu transition-all duration-1000 ${getFog1Color()}`}
      />

      {/* Floating fog layer 2 */}
      <motion.div
        animate={{
          x: ['5%', '-5%', '5%'],
          y: ['5%', '-5%', '5%'],
          scale: level >= 4 ? [1.07, 1.02, 1.07] : [1.05, 1, 1.05],
        }}
        transition={{
          duration: level >= 4 ? 40 : 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ willChange: 'transform' }}
        className={`absolute top-[20%] left-[20%] w-[120%] h-[120%] blur-[140px] rounded-full transform-gpu transition-all duration-1000 ${getFog2Color()}`}
      />

      {/* Level 2+: Dawn warm ray/source */}
      {level >= 2 && (
        <motion.div
          animate={{
            x: ['-10%', '10%', '-10%'],
            y: ['5%', '-5%', '5%'],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform' }}
          className={`absolute top-[-30%] right-[-10%] w-[80%] h-[80%] blur-[130px] rounded-full bg-[#f59e0b] transform-gpu transition-opacity duration-1000 ${
            theme === 'light'
              ? (level === 2 ? 'opacity-[0.015]' : level === 3 ? 'opacity-[0.025]' : level === 4 ? 'opacity-[0.035]' : 'opacity-[0.045]')
              : (level === 2 ? 'opacity-[0.025]' : level === 3 ? 'opacity-[0.04]' : level === 4 ? 'opacity-[0.06]' : 'opacity-[0.08]')
          }`}
        />
      )}

      {/* Level 3+: Aurora Purple/Indigo glow */}
      {level >= 3 && (
        <motion.div
          animate={{
            x: ['10%', '-10%', '10%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform' }}
          className={`absolute bottom-[-20%] left-[-10%] w-[100%] h-[100%] blur-[150px] rounded-full bg-[#8b5cf6] transform-gpu transition-opacity duration-1000 ${
            theme === 'light'
              ? (level === 3 ? 'opacity-[0.02]' : level === 4 ? 'opacity-[0.035]' : 'opacity-[0.05]')
              : (level === 3 ? 'opacity-[0.035]' : level === 4 ? 'opacity-[0.055]' : 'opacity-[0.085]')
          }`}
        />
      )}

      {/* Canvas for floating light motes / particles (Level 3+) */}
      {level >= 3 && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full mix-blend-screen opacity-80"
        />
      )}

      {/* Noise grain overlay for cinematic texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
}
