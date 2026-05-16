import type { AmbientSound } from './types';

let audioContext: AudioContext | null = null;
let ambientNodes: AudioNode[] = [];
let ambientGain: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Pleasant bell-like sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(830, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    // Second tone
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1050, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(830, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.6);
    }, 200);
  } catch {
    // Audio not available
  }
}

export function playCompletionSound(): void {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch {
    // Audio not available
  }
}

function createBrownNoise(ctx: AudioContext, gain: GainNode): AudioNode[] {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  source.start();

  return [source];
}

function createRainSound(ctx: AudioContext, gain: GainNode): AudioNode[] {
  // White noise filtered to sound like rain
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Bandpass filter for rain-like sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.5;

  // Highpass to remove rumble
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 400;

  source.connect(highpass);
  highpass.connect(filter);
  filter.connect(gain);
  source.start();

  return [source, filter, highpass];
}

function createLofiSound(ctx: AudioContext, gain: GainNode): AudioNode[] {
  // Warm filtered noise with subtle oscillation
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + 0.1 * white) / 1.1;
    lastOut = data[i];
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 1;

  // Subtle LFO for warmth
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.1;
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  source.connect(filter);
  filter.connect(gain);
  source.start();

  return [source, filter, lfo, lfoGain];
}

export function startAmbientSound(type: AmbientSound, volume: number): void {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    ambientGain.gain.value = volume * 0.5;
    ambientGain.connect(ctx.destination);

    switch (type) {
      case 'rain':
        ambientNodes = createRainSound(ctx, ambientGain);
        break;
      case 'brownNoise':
        ambientNodes = createBrownNoise(ctx, ambientGain);
        break;
      case 'lofi':
        ambientNodes = createLofiSound(ctx, ambientGain);
        break;
    }
  } catch {
    // Audio not available
  }
}

export function stopAmbientSound(): void {
  ambientNodes.forEach(node => {
    try {
      if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
        node.stop();
      }
      node.disconnect();
    } catch {
      // Already stopped
    }
  });
  ambientNodes = [];
  if (ambientGain) {
    try { ambientGain.disconnect(); } catch { /* */ }
    ambientGain = null;
  }
}

export function setAmbientVolume(volume: number): void {
  if (ambientGain) {
    ambientGain.gain.value = volume * 0.5;
  }
}
