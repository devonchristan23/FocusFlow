import { store } from './store.js';
import { soundSystem } from './audio.js';

export class PomodoroTimer {
  constructor() {
    this.timeLeft = 25 * 60;
    this.totalTime = 25 * 60;
    this.timerRunning = false;
    this.intervalId = null;
    this.mode = 'pomo'; // 'pomo', 'short', 'long'

    this.initElements();
    this.bindEvents();
    this.subscribeStore();
    this.updateDisplay();
  }

  initElements() {
    this.display = document.getElementById('timer-display');
    this.statusText = document.getElementById('timer-status');
    this.toggleBtn = document.getElementById('timer-toggle-btn');
    this.toggleIcon = document.getElementById('timer-toggle-icon');
    this.toggleText = document.getElementById('timer-toggle-text');
    this.ring = document.getElementById('timer-progress-ring');
    this.resetBtn = document.getElementById('timer-reset-btn');
    this.skipBtn = document.getElementById('timer-skip-btn');
    this.activeTaskLabel = document.getElementById('active-task-name');

    this.modePomoBtn = document.getElementById('mode-pomo');
    this.modeShortBtn = document.getElementById('mode-short');
    this.modeLongBtn = document.getElementById('mode-long');

    this.totalCircumference = 326.7;
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        soundSystem.playTick();
        this.toggleTimer();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        soundSystem.playTick();
        this.resetTimer();
      });
    }

    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        soundSystem.playTick();
        this.completeSession();
      });
    }

    if (this.modePomoBtn) {
      this.modePomoBtn.addEventListener('click', () => {
        const mins = store.state.settings.pomoMinutes || 25;
        this.setMode(mins * 60, 'pomo');
      });
    }

    if (this.modeShortBtn) {
      this.modeShortBtn.addEventListener('click', () => {
        const mins = store.state.settings.shortBreakMinutes || 5;
        this.setMode(mins * 60, 'short');
      });
    }

    if (this.modeLongBtn) {
      this.modeLongBtn.addEventListener('click', () => {
        const mins = store.state.settings.longBreakMinutes || 15;
        this.setMode(mins * 60, 'long');
      });
    }
  }

  subscribeStore() {
    store.subscribe(state => {
      if (this.activeTaskLabel) {
        this.activeTaskLabel.textContent = state.activeTask || 'Pilih tugas untuk fokus';
      }
    });
  }

  updateDisplay() {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    const timeStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;

    if (this.display) {
      this.display.textContent = timeStr;
    }

    // Update Browser Document Title when running
    if (this.timerRunning) {
      document.title = `(${timeStr}) FocusFlow - Daily Productivity`;
    } else {
      document.title = `FocusFlow - Daily Productivity Dashboard`;
    }

    // Progress ring calculation
    if (this.ring) {
      const progress = this.timeLeft / this.totalTime;
      const offset = this.totalCircumference * (1 - progress);
      this.ring.style.strokeDashoffset = offset;
    }
  }

  toggleTimer() {
    if (this.timerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    soundSystem.initContext();
    this.timerRunning = true;
    if (this.toggleIcon) this.toggleIcon.textContent = 'pause';
    if (this.toggleText) this.toggleText.textContent = 'Jeda';

    if (this.statusText) {
      this.statusText.textContent = this.mode === 'pomo' ? 'Fokus Berjalan' : 'Waktu Istirahat';
      this.statusText.className = 'font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold';
    }

    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.intervalId);
    this.timerRunning = false;
    if (this.toggleIcon) this.toggleIcon.textContent = 'play_arrow';
    if (this.toggleText) this.toggleText.textContent = 'Lanjutkan';

    if (this.statusText) {
      this.statusText.textContent = 'Dijeda';
      this.statusText.className = 'font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-semibold';
    }
  }

  resetTimer() {
    clearInterval(this.intervalId);
    this.timerRunning = false;
    this.timeLeft = this.totalTime;
    if (this.toggleIcon) this.toggleIcon.textContent = 'play_arrow';
    if (this.toggleText) this.toggleText.textContent = 'Mulai Fokus';
    if (this.statusText) {
      this.statusText.textContent = 'Siap Mulai';
      this.statusText.className = 'font-label-sm text-label-sm text-tertiary uppercase tracking-wider';
    }
    this.updateDisplay();
  }

  completeSession() {
    clearInterval(this.intervalId);
    this.timerRunning = false;

    if (store.state.settings.soundEnabled) {
      soundSystem.playCompletionChime(store.state.settings.audioVolume);
    }

    if (this.mode === 'pomo') {
      const minsCompleted = Math.round(this.totalTime / 60);
      store.addCompletedSession(minsCompleted);
    }

    if (this.toggleIcon) this.toggleIcon.textContent = 'replay';
    if (this.toggleText) this.toggleText.textContent = 'Selesai';
    if (this.statusText) {
      this.statusText.textContent = 'Sesi Selesai! 🎉';
      this.statusText.className = 'font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold';
    }
    this.updateDisplay();
  }

  setMode(seconds, modeName) {
    clearInterval(this.intervalId);
    this.timerRunning = false;
    this.mode = modeName;
    this.totalTime = seconds;
    this.timeLeft = seconds;

    if (this.toggleIcon) this.toggleIcon.textContent = 'play_arrow';
    if (this.toggleText) this.toggleText.textContent = 'Mulai Fokus';
    if (this.statusText) {
      this.statusText.textContent = 'Siap Mulai';
      this.statusText.className = 'font-label-sm text-label-sm text-tertiary uppercase tracking-wider';
    }

    this.updateTabStyles(modeName);
    this.updateDisplay();
  }

  updateTabStyles(modeName) {
    const activeClass = 'px-2.5 py-1 rounded bg-primary text-on-primary font-medium transition-all shadow-sm';
    const inactiveClass = 'px-2.5 py-1 rounded hover:text-on-surface transition-all text-on-surface-variant';

    if (this.modePomoBtn) this.modePomoBtn.className = modeName === 'pomo' ? activeClass : inactiveClass;
    if (this.modeShortBtn) this.modeShortBtn.className = modeName === 'short' ? activeClass : inactiveClass;
    if (this.modeLongBtn) this.modeLongBtn.className = modeName === 'long' ? activeClass : inactiveClass;
  }
}
