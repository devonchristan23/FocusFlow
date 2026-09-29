// Web Audio API Synthesizer for Chimes & Ambient Background Sound

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.currentAmbientType = 'none';
  }

  initContext() {
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

  // Play pleasant completion bell
  playCompletionChime(volume = 0.5) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(volume * 0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.0);
      });
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
    }
  }

  // Play button click tick
  playTick(volume = 0.2) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

      gain.gain.setValueAtTime(volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // Ambient Noise Generator (White Noise / Soft Rain Synth)
  setAmbientSound(type, volume = 0.3) {
    this.initContext();
    if (!this.ctx) return;

    this.stopAmbientSound();
    if (type === 'none') return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        // Brown/Pink noise approximation for rain
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else {
        // Smooth white noise
        data[i] = white * 0.1;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter for pleasant background rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.value = type === 'rain' ? 800 : 1200;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    this.ambientSource = noise;
    this.ambientGain = gain;
    this.currentAmbientType = type;
  }

  stopAmbientSound() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch (e) {}
      this.ambientSource = null;
    }
    this.currentAmbientType = 'none';
  }

  setVolume(volume) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
    }
  }
}

export const soundSystem = new SoundSystem();
