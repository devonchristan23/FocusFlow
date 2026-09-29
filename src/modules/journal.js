import { store } from './store.js';
import { soundSystem } from './audio.js';

export class DailyJournal {
  constructor() {
    this.selectedMood = 'Tenang';
    this.initElements();
    this.bindEvents();
    this.subscribeStore();
    this.render();
  }

  initElements() {
    this.journalInput = document.getElementById('journal-input');
    this.saveBtn = document.getElementById('save-journal-btn');
    this.saveBadge = document.getElementById('journal-autosave-badge');
    this.moodBtns = document.querySelectorAll('.mood-btn');
    this.journalHistoryContainer = document.getElementById('journal-history-container');
  }

  bindEvents() {
    if (this.moodBtns) {
      this.moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedMood = btn.dataset.mood || 'Tenang';
          this.updateMoodBtnStyles();
          soundSystem.playTick();
        });
      });
    }

    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        const text = this.journalInput ? this.journalInput.value.trim() : '';
        store.saveJournal(this.selectedMood, text);
        soundSystem.playTick();

        if (this.saveBadge) {
          this.saveBadge.innerHTML = '<span class="material-symbols-outlined text-[14px] text-secondary">done_all</span><span class="text-secondary font-medium">Tersimpan</span>';
          setTimeout(() => {
            if (this.saveBadge) {
              this.saveBadge.innerHTML = '<span class="material-symbols-outlined text-[14px]">done_all</span><span>Tersimpan</span>';
            }
          }, 1800);
        }
      });
    }

    if (this.journalInput) {
      this.journalInput.addEventListener('input', () => {
        if (this.saveBadge) {
          this.saveBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span><span class="text-tertiary font-medium">Mengetik...</span>';
        }
      });
    }
  }

  subscribeStore() {
    store.subscribe(state => {
      if (this.journalInput && !this.journalInput.value) {
        this.journalInput.value = state.journal.todayReflection || '';
      }
      this.selectedMood = state.journal.todayMood || 'Tenang';
      this.updateMoodBtnStyles();
      this.renderHistory(state.journal.history || []);
    });
  }

  updateMoodBtnStyles() {
    if (!this.moodBtns) return;
    this.moodBtns.forEach(btn => {
      const mood = btn.dataset.mood;
      if (mood === this.selectedMood) {
        btn.className = 'mood-btn px-2.5 py-1 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm transition-all flex items-center gap-1 font-semibold shadow-xs';
      } else {
        btn.className = 'mood-btn px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-all flex items-center gap-1';
      }
    });
  }

  render() {
    const journal = store.state.journal;
    if (this.journalInput && journal.todayReflection) {
      this.journalInput.value = journal.todayReflection;
    }
    this.renderHistory(journal.history || []);
  }

  renderHistory(history) {
    if (!this.journalHistoryContainer) return;

    if (history.length === 0) {
      this.journalHistoryContainer.innerHTML = `
        <div class="p-space-md text-center text-outline font-body-sm bg-surface-container/40 rounded-xl">
          Belum ada riwayat refleksi sebelumnya.
        </div>
      `;
      return;
    }

    this.journalHistoryContainer.innerHTML = history.map(item => `
      <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col gap-space-xs shadow-xs">
        <div class="flex items-center justify-between">
          <span class="font-label-md text-label-md text-on-surface font-semibold">${item.date}</span>
          <span class="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-medium">Mood: ${item.mood}</span>
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant pt-1">${item.text}</p>
      </div>
    `).join('');
  }
}
