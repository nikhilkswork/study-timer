'use client';

import { motion } from 'framer-motion';
import { CloudRain, Radio, Coffee, Trees, Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { setAmbientVolume, initAudioContext } from '@/lib/audio';
import type { AmbientSound as AmbientSoundType } from '@/lib/types';

const sounds: { id: AmbientSoundType; label: string; icon: React.ElementType }[] = [
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'brownNoise', label: 'Noise', icon: Radio },
  { id: 'cafe', label: 'Cafe', icon: Coffee },
  { id: 'forest', label: 'Forest', icon: Trees },
];

export function AmbientSounds() {
  const ambientSound = useSettingsStore((s) => s.ambientSound);
  const ambientVolume = useSettingsStore((s) => s.ambientVolume);
  const setAmbientSoundSetting = useSettingsStore((s) => s.setAmbientSound);
  const setAmbientVolumeSetting = useSettingsStore((s) => s.setAmbientVolume);

  const isRunning = useTaskStore((s) => s.pomodoro.isRunning);
  const activeTaskId = useTaskStore((s) => s.pomodoro.activeTaskId);

  const isPlaying = isRunning && activeTaskId !== null && ambientSound !== 'none';

  const toggleSound = (soundId: AmbientSoundType) => {
    initAudioContext();
    if (ambientSound === soundId) {
      setAmbientSoundSetting('none');
    } else {
      setAmbientSoundSetting(soundId);
    }
  };

  const handleVolumeChange = (vol: number) => {
    initAudioContext();
    setAmbientVolumeSetting(vol);
    setAmbientVolume(vol);
  };

  return (
    <div className="space-y-2.5 w-full max-w-sm mx-auto">
      {/* Selector Cards */}
      <div className="flex gap-2 justify-center">
        {sounds.map(({ id, label, icon: Icon }) => {
          const isActive = ambientSound === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSound(id)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] shadow-[0_0_12px_rgba(var(--accent),0.15)]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]/60 text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-hover))]'
              }`}
            >
              <Icon size={14} className="opacity-90" />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Volume Slider */}
      {ambientSound !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-[hsl(var(--card))]/30 border border-[hsl(var(--border))]/30"
        >
          {isPlaying ? (
            <Volume2 size={12} className="text-[hsl(var(--accent))]" />
          ) : (
            <VolumeX size={12} className="text-[hsl(var(--muted))]" />
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={ambientVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-0.5 rounded-full appearance-none cursor-pointer
                       bg-[hsl(var(--border))] accent-[hsl(var(--accent))]
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-[hsl(var(--accent))]"
          />
        </motion.div>
      )}
    </div>
  );
}
