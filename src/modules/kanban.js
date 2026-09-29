import { store } from './store.js';
import { soundSystem } from './audio.js';

export class TaskManager {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.subscribeStore();
    this.render();
  }

  initElements() {
    this.tasksListContainer = document.getElementById('tasks-list');
    this.taskAddForm = document.getElementById('task-add-form');
    this.newTaskInput = document.getElementById('new-task-input');
    this.newTaskTag = document.getElementById('new-task-tag');

    // Kanban columns
    this.colTodo = document.getElementById('kanban-col-todo');
    this.colInProgress = document.getElementById('kanban-col-in-progress');
    this.colDone = document.getElementById('kanban-col-done');

    this.todoCountBadge = document.getElementById('todo-count-badge');
    this.inProgressCountBadge = document.getElementById('in-progress-count-badge');
    this.doneCountBadge = document.getElementById('done-count-badge');
  }

  bindEvents() {
    if (this.taskAddForm) {
      this.taskAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = this.newTaskInput.value.trim();
        if (!title) return;

        const tag = this.newTaskTag ? this.newTaskTag.value : 'Tech';
        store.addTask({
          title,
          tag,
          priority: 'Med',
          estimate: '25m'
        });

        soundSystem.playTick();
        this.newTaskInput.value = '';
      });
    }

    if (this.tasksListContainer) {
      this.tasksListContainer.addEventListener('click', (e) => this.handleTaskClick(e));
    }

    // Delegation for Kanban action buttons
    ['kanban-col-todo', 'kanban-col-in-progress', 'kanban-col-done'].forEach(id => {
      const col = document.getElementById(id);
      if (col) {
        col.addEventListener('click', (e) => this.handleTaskClick(e));
      }
    });
  }

  subscribeStore() {
    store.subscribe(() => {
      this.render();
    });
  }

  handleTaskClick(e) {
    const chk = e.target.closest('.task-checkbox');
    if (chk) {
      const taskItem = chk.closest('[data-task-id]');
      if (taskItem) {
        const id = taskItem.dataset.taskId;
        store.toggleTaskDone(id);
        soundSystem.playTick();
      }
      return;
    }

    const setBtn = e.target.closest('.set-active-task-btn');
    if (setBtn) {
      const taskItem = setBtn.closest('[data-task-id]');
      if (taskItem) {
        const title = taskItem.querySelector('.task-title').textContent.trim();
        store.setActiveTask(title);
        soundSystem.playTick();
      }
      return;
    }

    const delBtn = e.target.closest('.delete-task-btn');
    if (delBtn) {
      const taskItem = delBtn.closest('[data-task-id]');
      if (taskItem) {
        const id = taskItem.dataset.taskId;
        store.deleteTask(id);
        soundSystem.playTick();
      }
      return;
    }

    const moveNextBtn = e.target.closest('.move-next-btn');
    if (moveNextBtn) {
      const taskItem = moveNextBtn.closest('[data-task-id]');
      if (taskItem) {
        const id = taskItem.dataset.taskId;
        const task = store.state.tasks.find(t => t.id === id);
        if (task) {
          const nextStatus = task.status === 'todo' ? 'in-progress' : 'done';
          store.updateTaskStatus(id, nextStatus);
          soundSystem.playTick();
        }
      }
      return;
    }

    const movePrevBtn = e.target.closest('.move-prev-btn');
    if (movePrevBtn) {
      const taskItem = movePrevBtn.closest('[data-task-id]');
      if (taskItem) {
        const id = taskItem.dataset.taskId;
        const task = store.state.tasks.find(t => t.id === id);
        if (task) {
          const prevStatus = task.status === 'done' ? 'in-progress' : 'todo';
          store.updateTaskStatus(id, prevStatus);
          soundSystem.playTick();
        }
      }
      return;
    }
  }

  render() {
    const tasks = store.state.tasks;

    // Render Dashboard Tasks List (Todo/In-Progress)
    if (this.tasksListContainer) {
      const activeTasks = tasks.filter(t => t.status !== 'done');
      if (activeTasks.length === 0) {
        this.tasksListContainer.innerHTML = `
          <div class="p-space-md text-center text-outline font-body-sm bg-surface-container/40 rounded-xl">
            🎉 Semua target hari ini telah selesai!
          </div>
        `;
      } else {
        this.tasksListContainer.innerHTML = activeTasks.map(task => this.renderDashboardTaskCard(task)).join('');
      }
    }

    // Render Kanban View Columns
    if (this.colTodo && this.colInProgress && this.colDone) {
      const todoTasks = tasks.filter(t => t.status === 'todo');
      const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
      const doneTasks = tasks.filter(t => t.status === 'done');

      if (this.todoCountBadge) this.todoCountBadge.textContent = todoTasks.length;
      if (this.inProgressCountBadge) this.inProgressCountBadge.textContent = inProgressTasks.length;
      if (this.doneCountBadge) this.doneCountBadge.textContent = doneTasks.length;

      this.colTodo.innerHTML = todoTasks.map(t => this.renderKanbanCard(t)).join('');
      this.colInProgress.innerHTML = inProgressTasks.map(t => this.renderKanbanCard(t)).join('');
      this.colDone.innerHTML = doneTasks.map(t => this.renderKanbanCard(t)).join('');
    }

    // Render Progress Bar in Bento Stat
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.status === 'done').length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const bentoStatCompleted = document.getElementById('bento-completed-stat');
    if (bentoStatCompleted) {
      bentoStatCompleted.innerHTML = `
        <span class="font-headline-lg text-headline-lg text-on-surface font-bold">${completedCount}<span class="text-outline font-normal">/${totalCount}</span></span>
        <span class="font-label-md text-label-md text-secondary font-semibold ml-1">${percent}%</span>
      `;
    }
    const bentoProgressBar = document.getElementById('bento-completed-bar');
    if (bentoProgressBar) {
      bentoProgressBar.style.width = `${percent}%`;
    }
  }

  renderDashboardTaskCard(task) {
    const isDone = task.status === 'done';
    const priorityColor = task.priority === 'High' ? 'bg-error-container/40 text-error' : task.priority === 'Med' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container-highest text-outline';

    return `
      <div data-task-id="${task.id}" class="task-item group flex items-center justify-between p-space-sm rounded-xl bg-surface-container/70 hover:bg-surface-container transition-all shadow-xs">
        <div class="flex items-center gap-space-sm min-w-0">
          <button type="button" class="task-checkbox w-5 h-5 rounded-md ${isDone ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-transparent hover:text-on-secondary hover:bg-secondary'} flex items-center justify-center transition-all">
            <span class="material-symbols-outlined text-[14px]">check</span>
          </button>
          <div class="flex flex-col min-w-0">
            <span class="task-title font-body-md text-body-md ${isDone ? 'line-through text-outline' : 'text-on-surface'} font-medium truncate">${task.title}</span>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${priorityColor}">${task.priority}</span>
              <span class="font-body-sm text-body-sm text-outline">${task.estimate}</span>
              <span class="text-outline">•</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-surface-container-highest text-primary font-medium">${task.tag}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button type="button" class="set-active-task-btn p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-primary transition-colors" title="Fokuskan di Pomodoro">
            <span class="material-symbols-outlined text-[18px]">play_circle</span>
          </button>
          <button type="button" class="delete-task-btn p-1.5 rounded-lg hover:bg-surface-container-high text-outline hover:text-error transition-colors" title="Hapus Tugas">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    `;
  }

  renderKanbanCard(task) {
    const isDone = task.status === 'done';
    const priorityColor = task.priority === 'High' ? 'bg-error-container/40 text-error' : task.priority === 'Med' ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container-highest text-outline';

    return `
      <div data-task-id="${task.id}" class="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/50 hover:bg-surface-container transition-all flex flex-col gap-space-xs shadow-xs group">
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${priorityColor}">${task.priority}</span>
          <span class="px-2 py-0.5 rounded text-[10px] bg-surface-container-highest text-primary font-medium">${task.tag}</span>
        </div>
        <span class="task-title font-headline-sm text-body-md text-on-surface font-semibold ${isDone ? 'line-through text-outline' : ''} mt-1">${task.title}</span>
        <div class="flex items-center justify-between pt-2 border-t border-surface-container-highest/40 mt-1">
          <span class="font-body-sm text-body-sm text-outline flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">schedule</span> ${task.estimate}
          </span>
          <div class="flex items-center gap-1">
            ${task.status !== 'todo' ? `
              <button type="button" class="move-prev-btn p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface" title="Geser ke Kiri">
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              </button>
            ` : ''}
            ${task.status !== 'done' ? `
              <button type="button" class="move-next-btn p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface" title="Geser ke Kanan">
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ` : ''}
            <button type="button" class="delete-task-btn p-1 rounded hover:bg-surface-container-high text-outline hover:text-error" title="Hapus">
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
