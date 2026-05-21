import type { AmbientSound } from './types';

let audioContext: AudioContext | null = null;
let ambientNodes: AudioNode[] = [];
let ambientGain: GainNode | null = null;

let cafeInterval: ReturnType<typeof setInterval> | null = null;
let forestInterval: ReturnType<typeof setInterval> | null = null;

function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is only available in browser');
  }
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API not supported in this browser');
  }
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function initAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Audio not supported or blocked
  }
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

function createPinkNoise(ctx: AudioContext): AudioBuffer {
  const bufferSize = 4 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750312;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

function createRainSound(ctx: AudioContext, gain: GainNode): AudioNode[] {
  const nodes: AudioNode[] = [];

  const washBuffer = createPinkNoise(ctx);
  const washSource = ctx.createBufferSource();
  washSource.buffer = washBuffer;
  washSource.loop = true;

  const washFilter = ctx.createBiquadFilter();
  washFilter.type = 'lowpass';
  washFilter.frequency.value = 1200;
  washFilter.Q.value = 0.5;

  washSource.connect(washFilter);
  washFilter.connect(gain);
  washSource.start();
  nodes.push(washSource, washFilter);

  const patterSource = ctx.createBufferSource();
  patterSource.buffer = washBuffer;
  patterSource.loop = true;

  const patterFilter = ctx.createBiquadFilter();
  patterFilter.type = 'highpass';
  patterFilter.frequency.value = 3500;

  const patterGain = ctx.createGain();
  patterGain.gain.value = 0.15;

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = 0.05;

  lfo.connect(lfoGain);
  lfoGain.connect(patterGain.gain);
  lfo.start();

  patterSource.connect(patterFilter);
  patterFilter.connect(patterGain);
  patterGain.connect(gain);
  patterSource.start();
  nodes.push(patterSource, patterFilter, patterGain, lfo, lfoGain);

  const rumbleBuffer = ctx.createBuffer(1, 2 * ctx.sampleRate, ctx.sampleRate);
  const rumbleData = rumbleBuffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < rumbleBuffer.length; i++) {
    const white = Math.random() * 2 - 1;
    rumbleData[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = rumbleData[i];
    rumbleData[i] *= 2.5;
  }

  const rumbleSource = ctx.createBufferSource();
  rumbleSource.buffer = rumbleBuffer;
  rumbleSource.loop = true;

  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.value = 150;

  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.4;

  rumbleSource.connect(rumbleFilter);
  rumbleFilter.connect(rumbleGain);
  rumbleGain.connect(gain);
  rumbleSource.start();
  nodes.push(rumbleSource, rumbleFilter, rumbleGain);

  return nodes;
}

function createCafeSound(ctx: AudioContext, gain: GainNode): AudioNode[] {
  const nodes: AudioNode[] = [];
  
  // 1. Murmur (pink noise with bandpass/lowpass filtering)
  const murmurBuffer = createPinkNoise(ctx);
  const murmurSource = ctx.createBufferSource();
  murmurSource.buffer = murmurBuffer;
  murmurSource.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  
  murmurSource.connect(filter);
  filter.connect(gain);
  murmurSource.start();
  nodes.push(murmurSource, filter);
  
  // 2. Random cup/plate clinks
  if (cafeInterval) clearInterval(cafeInterval);
  cafeInterval = setInterval(() => {
    try {
      if (ctx.state === 'closed') return;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.connect(oscGain);
      oscGain.connect(gain);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600 + Math.random() * 900, ctx.currentTime);
      
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.02, ctx.currentTime + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.13);
      
      setTimeout(() => {
        try {
          osc.disconnect();
          oscGain.disconnect();
        } catch {}
      }, 200);
    } catch {}
  }, 3500 + Math.random() * 4000);
  
  return nodes;
}

function createForestSound(ctx: AudioContext, gain: GainNode): AudioNode[] {
  const nodes: AudioNode[] = [];
  
  // 1. Rustling leaves / wind (Pink noise low-passed with LFO modulating frequency)
  const leavesBuffer = createPinkNoise(ctx);
  const leavesSource = ctx.createBufferSource();
  leavesSource.buffer = leavesBuffer;
  leavesSource.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 350;
  
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 120;
  
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  
  leavesSource.connect(filter);
  filter.connect(gain);
  leavesSource.start();
  nodes.push(leavesSource, filter, lfo, lfoGain);
  
  // 2. Random bird chirps
  if (forestInterval) clearInterval(forestInterval);
  forestInterval = setInterval(() => {
    try {
      if (ctx.state === 'closed') return;
      const now = ctx.currentTime;
      
      const chirpsCount = Math.random() > 0.5 ? 2 : 1;
      for (let i = 0; i < chirpsCount; i++) {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.connect(oscGain);
        oscGain.connect(gain);
        
        osc.type = 'sine';
        const startFreq = 2200 + Math.random() * 600;
        const endFreq = startFreq + 900;
        
        const chirpStart = now + i * 0.15;
        const chirpDuration = 0.07;
        
        osc.frequency.setValueAtTime(startFreq, chirpStart);
        osc.frequency.exponentialRampToValueAtTime(endFreq, chirpStart + chirpDuration);
        
        oscGain.gain.setValueAtTime(0, chirpStart);
        oscGain.gain.linearRampToValueAtTime(0.01, chirpStart + 0.008);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, chirpStart + chirpDuration);
        
        osc.start(chirpStart);
        osc.stop(chirpStart + chirpDuration + 0.02);
        
        setTimeout(() => {
          try {
            osc.disconnect();
            oscGain.disconnect();
          } catch {}
        }, (i * 150) + 150);
      }
    } catch {}
  }, 6000 + Math.random() * 6000);
  
  return nodes;
}

export function startAmbientSound(type: AmbientSound, volume: number): void {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 1.2);
    
    ambientGain.connect(ctx.destination);

    switch (type) {
      case 'rain':
        ambientNodes = createRainSound(ctx, ambientGain);
        break;
      case 'brownNoise':
        ambientNodes = createBrownNoise(ctx, ambientGain);
        break;
      case 'cafe':
        ambientNodes = createCafeSound(ctx, ambientGain);
        break;
      case 'forest':
        ambientNodes = createForestSound(ctx, ambientGain);
        break;
    }
  } catch {
    // Audio not available
  }
}

export function stopAmbientSound(): void {
  if (cafeInterval) {
    clearInterval(cafeInterval);
    cafeInterval = null;
  }
  if (forestInterval) {
    clearInterval(forestInterval);
    forestInterval = null;
  }

  ambientNodes.forEach(node => {
    try {
      if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
        node.stop();
      }
      node.disconnect();
    } catch { /* Already stopped */ }
  });
  ambientNodes = [];

  if (ambientGain) {
    try {
      ambientGain.disconnect();
    } catch { /* */ }
    ambientGain = null;
  }
}

export function setAmbientVolume(volume: number): void {
  if (ambientGain) {
    ambientGain.gain.value = volume * 0.5;
  }
}

export function playCountdownTickSound(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Audio not available
  }
}

export function playCountdownStartSound(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}
