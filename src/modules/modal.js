import { store } from './store.js';
import { soundSystem } from './audio.js';

export class FlowModal {
  constructor() {
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.openBtn = document.getElementById('global-new-flow-btn');
    this.modal = document.getElementById('new-flow-modal');
    this.closeBtn = document.getElementById('close-modal-btn');
    this.cancelBtn = document.getElementById('cancel-modal-btn');
    this.form = document.getElementById('modal-flow-form');
    this.typeSelect = document.getElementById('modal-flow-type');

    this.taskFields = document.getElementById('modal-task-fields');
    this.habitFields = document.getElementById('modal-habit-fields');
  }

  bindEvents() {
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.close());
    }

    if (this.typeSelect) {
      this.typeSelect.addEventListener('change', () => {
        const val = this.typeSelect.value;
        if (val === 'task') {
          this.taskFields.classList.remove('hidden');
          this.habitFields.classList.add('hidden');
        } else {
          this.taskFields.classList.add('hidden');
          this.habitFields.classList.remove('hidden');
        }
      });
    }

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = this.typeSelect.value;

        if (type === 'task') {
          const title = document.getElementById('modal-task-title').value.trim();
          const tag = document.getElementById('modal-task-tag').value;
          const priority = document.getElementById('modal-task-priority').value;
          const estimate = document.getElementById('modal-task-estimate').value || '25m';

          if (title) {
            store.addTask({ title, tag, priority, estimate });
            soundSystem.playTick();
          }
        } else {
          const habitName = document.getElementById('modal-habit-name').value.trim();
          if (habitName) {
            store.addHabit(habitName);
            soundSystem.playTick();
          }
        }

        this.close();
      });
    }
  }

  open() {
    soundSystem.playTick();
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.modal.classList.add('flex');
    }
  }

  close() {
    soundSystem.playTick();
    if (this.modal) {
      this.modal.classList.add('hidden');
      this.modal.classList.remove('flex');
    }
  }
}
