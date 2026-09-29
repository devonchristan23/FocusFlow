import { soundSystem } from './audio.js';

export class ZenMode {
  constructor() {
    this.isActive = false;
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.zenBtn = document.getElementById('quick-zen-btn');
    this.zenOverlay = document.getElementById('zen-overlay');
    this.exitZenBtn = document.getElementById('exit-zen-btn');
    this.zenClock = document.getElementById('zen-clock');
    this.zenAudioToggle = document.getElementById('zen-audio-toggle');
    this.zenAudioIcon = document.getElementById('zen-audio-icon');
  }

  bindEvents() {
    if (this.zenBtn) {
      this.zenBtn.addEventListener('click', () => this.enterZen());
    }

    if (this.exitZenBtn) {
      this.exitZenBtn.addEventListener('click', () => this.exitZen());
    }

    if (this.zenAudioToggle) {
      this.zenAudioToggle.addEventListener('click', () => {
        if (soundSystem.currentAmbientType === 'none') {
          soundSystem.setAmbientSound('rain', 0.4);
          if (this.zenAudioIcon) this.zenAudioIcon.textContent = 'volume_up';
        } else {
          soundSystem.stopAmbientSound();
          if (this.zenAudioIcon) this.zenAudioIcon.textContent = 'volume_off';
        }
      });
    }

    // Keyboard ESC to exit
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.exitZen();
      }
    });
  }

  enterZen() {
    this.isActive = true;
    soundSystem.playTick();
    if (this.zenOverlay) {
      this.zenOverlay.classList.remove('hidden');
      this.zenOverlay.classList.add('flex');
    }
    this.startClock();
  }

  exitZen() {
    this.isActive = false;
    soundSystem.playTick();
    if (this.zenOverlay) {
      this.zenOverlay.classList.add('hidden');
      this.zenOverlay.classList.remove('flex');
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    soundSystem.stopAmbientSound();
  }

  startClock() {
    const update = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      if (this.zenClock) {
        this.zenClock.textContent = `${hrs}:${mins}`;
      }
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  }
}
