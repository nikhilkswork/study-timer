'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Radio, Music, VolumeX, Volume2 } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { startAmbientSound, stopAmbientSound, setAmbientVolume } from '@/lib/audio';
import type { AmbientSound as AmbientSoundType } from '@/lib/types';

const sounds: { id: AmbientSoundType; label: string; icon: React.ElementType }[] = [
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'brownNoise', label: 'Brown Noise', icon: Radio },
  { id: 'lofi', label: 'Lo-fi', icon: Music },
];

export function AmbientSounds() {
  const ambientSound = useSettingsStore((s) => s.ambientSound);
  const ambientVolume = useSettingsStore((s) => s.ambientVolume);
  const setAmbientSoundSetting = useSettingsStore((s) => s.setAmbientSound);
  const setAmbientVolumeSetting = useSettingsStore((s) => s.setAmbientVolume);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const toggleSound = (soundId: AmbientSoundType) => {
    if (ambientSound === soundId && isPlaying) {
      stopAmbientSound();
      setAmbientSoundSetting('none');
      setIsPlaying(false);
    } else {
      setAmbientSoundSetting(soundId);
      startAmbientSound(soundId, ambientVolume);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolumeSetting(vol);
    setAmbientVolume(vol);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <Volume2 size={14} className="text-[var(--accent)]" />
        ) : (
          <VolumeX size={14} className="text-[var(--muted)]" />
        )}
        <span className="text-xs font-medium text-[var(--muted)]">Ambient</span>
      </div>

      <div className="flex gap-2">
        {sounds.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleSound(id)}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
              ambientSound === id && isPlaying
                ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)]'
            }`}
          >
            <Icon size={16} />
            <span className="text-[10px] font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-1"
        >
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={ambientVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer
                       bg-[var(--border)] accent-[var(--accent)]
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-[var(--accent)]"
          />
        </motion.div>
      )}
    </div>
  );
}
