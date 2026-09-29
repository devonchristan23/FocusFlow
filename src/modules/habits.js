import { store } from './store.js';
import { soundSystem } from './audio.js';

export class HabitTracker {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.subscribeStore();
    this.render();
  }

  initElements() {
    this.habitContainer = document.getElementById('habits-matrix-container');
    this.habitFullContainer = document.getElementById('full-habits-container');
    this.newHabitInput = document.getElementById('new-habit-input');
    this.addHabitBtn = document.getElementById('add-habit-btn');
  }

  bindEvents() {
    if (this.addHabitBtn && this.newHabitInput) {
      this.addHabitBtn.addEventListener('click', () => {
        const name = this.newHabitInput.value.trim();
        if (name) {
          store.addHabit(name);
          soundSystem.playTick();
          this.newHabitInput.value = '';
        }
      });
    }

    const handleHabitToggle = (e) => {
      const btn = e.target.closest('[data-habit-id][data-day-index]');
      if (btn) {
        const id = btn.dataset.habitId;
        const dayIndex = parseInt(btn.dataset.dayIndex, 10);
        store.toggleHabitDay(id, dayIndex);
        soundSystem.playTick();
      }

      const delBtn = e.target.closest('.delete-habit-btn');
      if (delBtn) {
        const habitId = delBtn.dataset.deleteHabitId;
        if (habitId) {
          store.deleteHabit(habitId);
          soundSystem.playTick();
        }
      }
    };

    if (this.habitContainer) {
      this.habitContainer.addEventListener('click', handleHabitToggle);
    }
    if (this.habitFullContainer) {
      this.habitFullContainer.addEventListener('click', handleHabitToggle);
    }
  }

  subscribeStore() {
    store.subscribe(() => this.render());
  }

  render() {
    const habits = store.state.habits;

    if (this.habitContainer) {
      this.habitContainer.innerHTML = habits.map(h => this.renderHabitRow(h)).join('');
    }

    if (this.habitFullContainer) {
      this.habitFullContainer.innerHTML = habits.map(h => this.renderFullHabitRow(h)).join('');
    }
  }

  renderHabitRow(h) {
    // Current day marker is index 1 (Selasa in initial Stitch layout)
    return `
      <div class="habit-row flex items-center justify-between p-space-sm rounded-xl bg-surface-container/60 hover:bg-surface-container transition-all">
        <div class="flex flex-col min-w-0 pr-2">
          <span class="font-body-md text-body-md text-on-surface font-medium truncate">${h.name}</span>
          <span class="font-label-sm text-label-sm text-tertiary">${h.streak} hari streak 🔥</span>
        </div>
        <div class="flex items-center gap-1.5">
          ${h.days.map((done, idx) => {
            const isToday = idx === 1;
            if (isToday) {
              return `
                <button type="button" data-habit-id="${h.id}" data-day-index="${idx}" class="habit-toggle-btn w-6 h-6 rounded-md ${done ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-outline hover:text-on-surface'} flex items-center justify-center transition-all">
                  <span class="material-symbols-outlined text-[14px]">${done ? 'check' : 'radio_button_unchecked'}</span>
                </button>
              `;
            }
            return `
              <span class="w-6 h-6 rounded-md ${done ? 'bg-secondary flex items-center justify-center text-on-secondary' : 'bg-surface-container-highest'}">
                ${done ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
              </span>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderFullHabitRow(h) {
    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return `
      <div class="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col gap-space-sm shadow-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">${h.name}</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <span class="font-label-md text-label-md text-tertiary font-medium">Streak: ${h.streak} Hari 🔥</span>
            <button type="button" data-delete-habit-id="${h.id}" class="delete-habit-btn p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-error transition-all" title="Hapus Habit">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2 pt-2 border-t border-surface-container-highest/30">
          ${h.days.map((done, idx) => `
            <button type="button" data-habit-id="${h.id}" data-day-index="${idx}" class="flex flex-col items-center gap-1 p-2 rounded-lg ${done ? 'bg-secondary/20 border border-secondary/40 text-secondary' : 'bg-surface-container-highest/60 text-outline hover:text-on-surface'} transition-all">
              <span class="font-label-sm text-label-sm">${dayLabels[idx]}</span>
              <span class="material-symbols-outlined text-[18px]">${done ? 'check_circle' : 'radio_button_unchecked'}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
}
