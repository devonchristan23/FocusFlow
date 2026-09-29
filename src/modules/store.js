// Centralized State Management with User Accounts & Isolated Clean User Data

const USERS_STORAGE_KEY = 'focusflow_registered_users_v2';
const APP_STATE_KEY = 'focusflow_app_session_v2';

const createCleanUserData = () => ({
  settings: {
    theme: 'deep-ocean',
    pomoMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    soundEnabled: true,
    audioVolume: 0.5
  },
  stats: {
    focusMinutesToday: 0,
    completedSessions: 0,
    targetSessions: 6,
    currentStreak: 0,
    recordStreak: 0
  },
  activeTask: 'Belum ada tugas dipin',
  tasks: [],
  habits: [],
  journal: {
    todayMood: 'Tenang',
    todayReflection: '',
    history: []
  }
});

class Store {
  constructor() {
    this.users = this.loadUsers();
    this.session = this.loadSession();
    this.listeners = [];
  }

  loadUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return [];
  }

  saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {}
  }

  loadSession() {
    try {
      const data = localStorage.getItem(APP_STATE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return { currentUserEmail: null };
  }

  saveState() {
    try {
      const session = {
        currentUserEmail: this.currentUser ? this.currentUser.email : null
      };
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(session));
      this.saveUsers();
      this.notify();
    } catch (e) {}
  }

  get currentUser() {
    const email = this.session.currentUserEmail;
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  get state() {
    const user = this.currentUser;
    if (!user) return createCleanUserData();
    if (!user.data) user.data = createCleanUserData();
    return user.data;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- Auth Methods ---
  signUp({ name, email, password }) {
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau Sign In.');
    }

    const nickname = name.trim().split(' ')[0];
    const newUser = {
      id: 'u-' + Date.now(),
      name,
      nickname,
      email,
      password,
      quote: '"Fokus pada satu hal penting hari ini."',
      avatar: null,
      data: createCleanUserData() // Clean empty state for new user!
    };

    this.users.push(newUser);
    this.saveUsers();

    // Auto login
    this.session.currentUserEmail = email;
    this.saveState();
    return newUser;
  }

  signIn({ email, password }) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Akun tidak ditemukan. Silakan Sign Up terlebih dahulu.');
    }
    if (user.password !== password) {
      throw new Error('Password yang Anda masukkan salah.');
    }

    if (!user.data) {
      user.data = createCleanUserData();
    }

    this.session.currentUserEmail = user.email;
    this.saveState();
    return user;
  }

  logout() {
    this.session.currentUserEmail = null;
    this.saveState();
  }

  updateUserProfile({ nickname, quote, avatarUrl }) {
    const user = this.currentUser;
    if (user) {
      if (nickname) user.nickname = nickname;
      if (quote) user.quote = quote;
      if (avatarUrl !== undefined) user.avatar = avatarUrl;

      this.saveUsers();
      this.notify();
    }
  }

  // --- Theme Method ---
  setTheme(themeKey) {
    this.state.settings.theme = themeKey;
    this.saveState();
  }

  // --- Task Methods ---
  addTask(task) {
    const newTask = {
      id: 't-' + Date.now(),
      status: 'todo',
      priority: task.priority || 'Med',
      estimate: task.estimate || '25m',
      tag: task.tag || 'Tech',
      createdAt: new Date().toISOString(),
      ...task
    };
    this.state.tasks.unshift(newTask);
    this.saveState();
    return newTask;
  }

  toggleTaskDone(id) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'done' ? 'todo' : 'done';
      this.saveState();
    }
  }

  updateTaskStatus(id, newStatus) {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      this.saveState();
    }
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.saveState();
  }

  setActiveTask(taskTitle) {
    this.state.activeTask = taskTitle;
    this.saveState();
  }

  // --- Habit Methods ---
  toggleHabitDay(habitId, dayIndex) {
    const habit = this.state.habits.find(h => h.id === habitId);
    if (habit) {
      habit.days[dayIndex] = !habit.days[dayIndex];
      this.saveState();
    }
  }

  addHabit(name) {
    const newHabit = {
      id: 'h-' + Date.now(),
      name,
      streak: 1,
      days: [false, false, false, false, false, false, false]
    };
    this.state.habits.push(newHabit);
    this.saveState();
  }

  deleteHabit(id) {
    this.state.habits = this.state.habits.filter(h => h.id !== id);
    this.saveState();
  }

  // --- Journal Methods ---
  saveJournal(mood, text) {
    this.state.journal.todayMood = mood;
    this.state.journal.todayReflection = text;
    this.saveState();
  }

  // --- Stats & Pomodoro ---
  addCompletedSession(minutes) {
    this.state.stats.focusMinutesToday += minutes;
    this.state.stats.completedSessions += 1;
    this.saveState();
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.saveState();
  }

  resetAllData() {
    const user = this.currentUser;
    if (user) {
      user.data = createCleanUserData();
      this.saveState();
    }
  }
}

export const store = new Store();
