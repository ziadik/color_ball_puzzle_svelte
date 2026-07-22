class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      // Silent fail
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.initialized) return;
    
    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silent fail
    }
  }

  playMove() {
    this.init();
    this.playTone(300, 0.08, 'sine', 0.2);
  }

  playHoleCapture() {
    this.init();
    this.playTone(523, 0.12, 'sine', 0.25);
    setTimeout(() => this.playTone(659, 0.12, 'sine', 0.25), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.25), 200);
  }

  playVictory() {
    this.init();
    const notes = [523, 587, 659, 784, 880, 988];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.12, 'sine', 0.2), i * 100);
    });
  }

  playError() {
    this.init();
    this.playTone(200, 0.15, 'sawtooth', 0.1);
  }

  playVibration() {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
}

export const soundManager = new SoundManager();