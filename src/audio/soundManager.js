/**
 * KodingBot: Petualangan Pulau Algoritma
 * Procedural Web Audio API Synthesizer
 * Zero-dependency, zero-latency sound effects & tropical background ambient music.
 */

import { safeStorage } from '../core/storage.js';

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicMuted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    
    // Load preferences safely (supports sandboxed iframes)
    const savedMute = safeStorage.getItem('kodingbot_mute') || safeStorage.getItem('robojalur_mute');
    if (savedMute !== null) this.isMuted = savedMute === 'true';
    const savedMusic = safeStorage.getItem('kodingbot_music_mute') || safeStorage.getItem('robojalur_music_mute');
    if (savedMusic !== null) this.isMusicMuted = savedMusic === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tactile button click / card snap
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Tactile Scratch block magnetic snap sound (with melodic pitch progression)
  playSnap(pitchIndex = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 720 + ((pitchIndex % 7) * 55);
    
    // Crisp melodic click pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);

    // High accent tick
    const tickOsc = this.ctx.createOscillator();
    const tickGain = this.ctx.createGain();
    tickOsc.type = 'sine';
    tickOsc.frequency.setValueAtTime(baseFreq * 1.6, now + 0.015);
    tickOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.0, now + 0.045);

    tickGain.gain.setValueAtTime(0.1, now + 0.015);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    tickOsc.connect(tickGain);
    tickGain.connect(this.ctx.destination);
    tickOsc.start(now + 0.015);
    tickOsc.stop(now + 0.045);
  }

  // Soft poof / bubble sound when removing a block
  playTrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Robot servo step sound with rhythmic pitch cadence
  playStep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    this.stepCounter = (this.stepCounter || 0) + 1;
    const isAlt = this.stepCounter % 2 === 0;
    const startFreq = isAlt ? 360 : 310;
    const endFreq = isAlt ? 200 : 170;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Turn robot sound with playful mechanical chirp
  playTurn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    [380, 520, 680].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.035;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.09, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.045);
    });
  }

  // Jump spring sound
  playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.18);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Crystal collected arpeggio chime
  playCrystal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    // Harmonic notes: C6, E6, G6, C7
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.06;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.28);
    });
  }

  // Energy switch activation
  playSwitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Friendly cartoon bonk when hitting obstacle
  playBump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Victory fanfare chord
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    // C major triumph: G4, C5, E5, G5, C6
    const chords = [
      { f: 392.00, t: 0.00, d: 0.12 },
      { f: 523.25, t: 0.10, d: 0.14 },
      { f: 659.25, t: 0.22, d: 0.14 },
      { f: 783.99, t: 0.34, d: 0.20 },
      { f: 1046.5, t: 0.50, d: 0.55 }
    ];
    
    chords.forEach(c => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + c.t;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, startTime);
      
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + c.d);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + c.d);
    });
  }

  // Star pop chime with ascending pitch
  playStar(starIndex = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [1046.5, 1318.5, 1567.98];
    const freq = baseFreqs[Math.min(starIndex - 1, 2)] || 1046.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.15);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);

    if (starIndex >= 3) {
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2093.0, now + 0.05);
      gain2.gain.setValueAtTime(0.18, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.45);
    }
  }

  // Procedural tropical island music loop
  startMusic() {
    if (this.musicTimer || this.isMusicMuted) return;
    this.init();
    
    // Pentatonic tropical marimba scale (Frequencies in Hz)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5];
    const bass = [261.63, 329.63, 392.00, 440.00];
    
    const playNote = () => {
      if (this.isMusicMuted || !this.ctx) return;
      
      const now = this.ctx.currentTime;
      // Melody note
      if (Math.random() > 0.3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const note = scale[Math.floor(Math.random() * scale.length)];
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.25);
      }
      
      // Warm bass pulse every 4 beats
      if (this.musicStep % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bNote = bass[(this.musicStep / 4) % bass.length];
        
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bNote, now);
        
        bassGain.gain.setValueAtTime(0.05, now);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        
        bassOsc.start(now);
        bassOsc.stop(now + 0.6);
      }
      
      this.musicStep++;
    };

    this.musicTimer = setInterval(playNote, 320);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    safeStorage.setItem('kodingbot_mute', this.isMuted);
    return !this.isMuted;
  }

  toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    safeStorage.setItem('kodingbot_music_mute', this.isMusicMuted);
    if (this.isMusicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return !this.isMusicMuted;
  }
}

export const sounds = new SoundManager();
