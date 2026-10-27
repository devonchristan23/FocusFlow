import './styles/main.css';
import { store } from './modules/store.js';
import { soundSystem } from './modules/audio.js';
import { ThemeManager } from './modules/theme.js';
import { PomodoroTimer } from './modules/timer.js';
import { TaskManager } from './modules/kanban.js';
import { HabitTracker } from './modules/habits.js';
import { DailyJournal } from './modules/journal.js';
import { ZenMode } from './modules/zen.js';
import { FlowModal } from './modules/modal.js';

class App {
  constructor() {
    this.tempAvatarDataUrl = null;
    this.initTheme();
    this.initAuth();
    this.initProfileCustomization();
    this.initNavigation();
    this.initDateTimeGreeting();
    this.initSettings();

    // Instantiate Modules
    this.timer = new PomodoroTimer();
    this.taskManager = new TaskManager();
    this.habitTracker = new HabitTracker();
    this.journal = new DailyJournal();
    this.zenMode = new ZenMode();
    this.modal = new FlowModal();

    this.subscribeStore();
    this.renderUser();
    this.updateStats();
  }

  initTheme() {
    const currentTheme = store.state.settings.theme || 'kyoto-ink';
    ThemeManager.applyTheme(currentTheme);
    this.updateThemeCardActiveState(currentTheme);

    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        const themeKey = card.dataset.theme;
        if (themeKey) {
          store.setTheme(themeKey);
          ThemeManager.applyTheme(themeKey);
          this.updateThemeCardActiveState(themeKey);
          soundSystem.playTick();
        }
      });
    });
  }

  updateThemeCardActiveState(activeTheme) {
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      const isSelected = card.dataset.theme === activeTheme;
      const checkIcon = card.querySelector('.theme-check-icon');

      if (isSelected) {
        card.classList.add('border-primary', 'bg-surface-container-high');
        card.classList.remove('border-surface-container-highest');
        if (checkIcon) checkIcon.classList.remove('hidden');
      } else {
        card.classList.remove('border-primary', 'bg-surface-container-high');
        card.classList.add('border-surface-container-highest');
        if (checkIcon) checkIcon.classList.add('hidden');
      }
    });
  }

  initAuth() {
    this.viewLanding = document.getElementById('view-landing');
    this.viewLogin = document.getElementById('view-login');
    this.appShell = document.getElementById('app-shell');

    // Auth Buttons
    const landingSignInBtn = document.getElementById('landing-sign-in-btn');
    const landingSignUpBtn = document.getElementById('landing-sign-up-btn');
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    const heroCtaBtn2 = document.getElementById('hero-cta-btn-2');
    const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');

    // Auth Tabs & Forms
    this.authTabsContainer = document.getElementById('auth-tabs-row');
    this.authTabSignIn = document.getElementById('auth-tab-signin');
    this.authTabSignUp = document.getElementById('auth-tab-signup');
    this.signInForm = document.getElementById('signin-form');
    this.signUpForm = document.getElementById('signup-form');
    this.forgotForm = document.getElementById('forgot-form');
    this.toForgotPasswordBtn = document.getElementById('to-forgot-password-btn');
    this.toSigninFromForgotBtn = document.getElementById('to-signin-from-forgot-btn');

    this.authModalTitle = document.getElementById('auth-modal-title');
    this.authModalSubtitle = document.getElementById('auth-modal-subtitle');
    this.authErrorAlert = document.getElementById('auth-error-alert');
    this.authSuccessAlert = document.getElementById('auth-success-alert');

    const openAuthModal = (mode = 'signin') => {
      soundSystem.playTick();
      if (this.viewLogin) {
        this.viewLogin.classList.remove('hidden');
        this.viewLogin.classList.add('flex');
      }
      this.switchAuthTab(mode);
    };

    const closeAuthModal = () => {
      soundSystem.playTick();
      if (this.viewLogin) {
        this.viewLogin.classList.add('hidden');
        this.viewLogin.classList.remove('flex');
      }
      if (this.authErrorAlert) this.authErrorAlert.classList.add('hidden');
      if (this.authSuccessAlert) this.authSuccessAlert.classList.add('hidden');
    };

    if (landingSignInBtn) landingSignInBtn.addEventListener('click', () => openAuthModal('signin'));
    if (landingSignUpBtn) landingSignUpBtn.addEventListener('click', () => openAuthModal('signup'));
    if (heroCtaBtn) heroCtaBtn.addEventListener('click', () => openAuthModal('signup'));
    if (heroCtaBtn2) heroCtaBtn2.addEventListener('click', () => openAuthModal('signup'));
    if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);

    if (this.authTabSignIn) this.authTabSignIn.addEventListener('click', () => this.switchAuthTab('signin'));
    if (this.authTabSignUp) this.authTabSignUp.addEventListener('click', () => this.switchAuthTab('signup'));
    if (this.toForgotPasswordBtn) this.toForgotPasswordBtn.addEventListener('click', () => this.switchAuthTab('forgot'));
    if (this.toSigninFromForgotBtn) this.toSigninFromForgotBtn.addEventListener('click', () => this.switchAuthTab('signin'));

    // SIGN IN FORM SUBMIT
    if (this.signInForm) {
      this.signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email-input').value.trim();
        const password = document.getElementById('signin-password-input').value;

        try {
          store.signIn({ email, password });
          soundSystem.playTick();
          closeAuthModal();
          this.checkAuthState();
        } catch (err) {
          this.showAuthError(err.message);
        }
      });
    }

    // SIGN UP FORM SUBMIT
    if (this.signUpForm) {
      this.signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name-input').value.trim();
        const email = document.getElementById('signup-email-input').value.trim();
        const password = document.getElementById('signup-password-input').value;

        try {
          store.signUp({ name, email, password });
          soundSystem.playTick();
          closeAuthModal();
          this.checkAuthState();
        } catch (err) {
          this.showAuthError(err.message);
        }
      });
    }

    // FORGOT PASSWORD FORM SUBMIT
    if (this.forgotForm) {
      this.forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email-input').value.trim();
        const newPassword = document.getElementById('forgot-password-input').value;
        const confirmPassword = document.getElementById('forgot-confirm-input').value;

        if (newPassword !== confirmPassword) {
          this.showAuthError('Konfirmasi password tidak cocok. Silakan periksa kembali.');
          return;
        }

        try {
          store.resetPassword({ email, newPassword });
          soundSystem.playTick();
          this.showAuthSuccess('Password berhasil diperbarui! Mengalihkan ke form Sign In...');
          setTimeout(() => {
            this.switchAuthTab('signin');
            const signinEmail = document.getElementById('signin-email-input');
            if (signinEmail) signinEmail.value = email;
            const signinPass = document.getElementById('signin-password-input');
            if (signinPass) signinPass.focus();
          }, 1200);
        } catch (err) {
          this.showAuthError(err.message);
        }
      });
    }

    const handleLogout = () => {
      if (confirm('Apakah kamu yakin ingin keluar (logout)?')) {
        store.logout();
        soundSystem.playTick();
        this.checkAuthState();
      }
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);

    this.checkAuthState();
  }

  switchAuthTab(mode) {
    if (this.authErrorAlert) this.authErrorAlert.classList.add('hidden');
    if (this.authSuccessAlert) this.authSuccessAlert.classList.add('hidden');

    if (mode === 'signin') {
      if (this.authTabsContainer) this.authTabsContainer.classList.remove('hidden');
      if (this.authTabSignIn) this.authTabSignIn.className = 'py-2 rounded bg-primary text-on-primary font-semibold transition-all shadow-xs';
      if (this.authTabSignUp) this.authTabSignUp.className = 'py-2 rounded text-on-surface-variant hover:text-on-surface transition-all';
      if (this.signInForm) this.signInForm.classList.remove('hidden');
      if (this.signUpForm) this.signUpForm.classList.add('hidden');
      if (this.forgotForm) this.forgotForm.classList.add('hidden');
      if (this.authModalTitle) this.authModalTitle.textContent = 'Sign In ke ponzfocus';
      if (this.authModalSubtitle) this.authModalSubtitle.textContent = 'Masuk untuk melanjutkan sesi produktivitas terstruktur Anda.';
    } else if (mode === 'signup') {
      if (this.authTabsContainer) this.authTabsContainer.classList.remove('hidden');
      if (this.authTabSignUp) this.authTabSignUp.className = 'py-2 rounded bg-primary text-on-primary font-semibold transition-all shadow-xs';
      if (this.authTabSignIn) this.authTabSignIn.className = 'py-2 rounded text-on-surface-variant hover:text-on-surface transition-all';
      if (this.signUpForm) this.signUpForm.classList.remove('hidden');
      if (this.signInForm) this.signInForm.classList.add('hidden');
      if (this.forgotForm) this.forgotForm.classList.add('hidden');
      if (this.authModalTitle) this.authModalTitle.textContent = 'Registrasi Akun ponzfocus';
      if (this.authModalSubtitle) this.authModalSubtitle.textContent = 'Mulai ruang kerja fokus Anda langsung di browser tanpa pelacak.';
    } else if (mode === 'forgot') {
      if (this.authTabsContainer) this.authTabsContainer.classList.add('hidden');
      if (this.signInForm) this.signInForm.classList.add('hidden');
      if (this.signUpForm) this.signUpForm.classList.add('hidden');
      if (this.forgotForm) this.forgotForm.classList.remove('hidden');
      if (this.authModalTitle) this.authModalTitle.textContent = 'Pemulihan Password';
      if (this.authModalSubtitle) this.authModalSubtitle.textContent = 'Masukkan email terdaftar dan atur password baru akun ponzfocus.';
    }
  }

  showAuthError(msg) {
    if (this.authSuccessAlert) this.authSuccessAlert.classList.add('hidden');
    if (this.authErrorAlert) {
      this.authErrorAlert.textContent = msg;
      this.authErrorAlert.classList.remove('hidden');
    }
  }

  showAuthSuccess(msg) {
    if (this.authErrorAlert) this.authErrorAlert.classList.add('hidden');
    if (this.authSuccessAlert) {
      this.authSuccessAlert.textContent = msg;
      this.authSuccessAlert.classList.remove('hidden');
    }
  }

  checkAuthState() {
    const user = store.currentUser;

    if (user && user.email) {
      if (this.appShell) this.appShell.classList.remove('hidden');
      if (this.viewLanding) this.viewLanding.classList.add('hidden');
      if (this.viewLogin) {
        this.viewLogin.classList.add('hidden');
        this.viewLogin.classList.remove('flex');
      }
      this.renderUser();
    } else {
      if (this.appShell) this.appShell.classList.add('hidden');
      if (this.viewLanding) this.viewLanding.remove ? null : null;
      if (this.viewLanding) this.viewLanding.classList.remove('hidden');
    }
  }

  initProfileCustomization() {
    this.profileModal = document.getElementById('profile-custom-modal');
    this.headerProfileBtn = document.getElementById('header-profile-btn');
    this.sidebarProfileClick = document.getElementById('sidebar-profile-click');
    this.closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
    this.cancelProfileModalBtn = document.getElementById('cancel-profile-modal-btn');
    this.profileForm = document.getElementById('profile-custom-form');

    this.nicknameInput = document.getElementById('profile-nickname-input');
    this.quoteInput = document.getElementById('profile-quote-input');
    this.photoInput = document.getElementById('profile-photo-input');

    this.avatarImg = document.getElementById('modal-avatar-img');
    this.avatarInitial = document.getElementById('modal-avatar-initial');

    const openProfileModal = () => {
      soundSystem.playTick();
      const user = store.currentUser;
      if (!user) return;

      if (this.nicknameInput) this.nicknameInput.value = user.nickname || user.name.split(' ')[0];
      if (this.quoteInput) this.quoteInput.value = user.quote || '';
      this.tempAvatarDataUrl = user.avatar || null;

      this.updateModalAvatarPreview(this.tempAvatarDataUrl, user.nickname || user.name);

      if (this.profileModal) {
        this.profileModal.classList.remove('hidden');
        this.profileModal.classList.add('flex');
      }
    };

    const closeProfileModal = () => {
      soundSystem.playTick();
      if (this.profileModal) {
        this.profileModal.classList.add('hidden');
        this.profileModal.classList.remove('flex');
      }
    };

    if (this.headerProfileBtn) this.headerProfileBtn.addEventListener('click', openProfileModal);
    if (this.sidebarProfileClick) this.sidebarProfileClick.addEventListener('click', openProfileModal);
    if (this.closeProfileModalBtn) this.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    if (this.cancelProfileModalBtn) this.cancelProfileModalBtn.addEventListener('click', closeProfileModal);

    if (this.photoInput) {
      this.photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.tempAvatarDataUrl = event.target.result;
            const name = this.nicknameInput ? this.nicknameInput.value : 'User';
            this.updateModalAvatarPreview(this.tempAvatarDataUrl, name);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (this.profileForm) {
      this.profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nickname = this.nicknameInput ? this.nicknameInput.value.trim() : '';
        const quote = this.quoteInput ? this.quoteInput.value.trim() : '';

        store.updateUserProfile({
          nickname,
          quote,
          avatarUrl: this.tempAvatarDataUrl
        });

        soundSystem.playTick();
        closeProfileModal();
        this.renderUser();
      });
    }
  }

  updateModalAvatarPreview(avatarUrl, name) {
    if (avatarUrl) {
      if (this.avatarImg) {
        this.avatarImg.src = avatarUrl;
        this.avatarImg.classList.remove('hidden');
      }
      if (this.avatarInitial) this.avatarInitial.classList.add('hidden');
    } else {
      if (this.avatarImg) this.avatarImg.classList.add('hidden');
      if (this.avatarInitial) {
        this.avatarInitial.classList.remove('hidden');
        this.avatarInitial.textContent = (name || 'U').charAt(0).toUpperCase();
      }
    }
  }

  renderUser() {
    const user = store.currentUser;
    if (!user) return;

    const nickname = user.nickname || user.name.split(' ')[0];

    const sidebarUserNickname = document.getElementById('sidebar-user-nickname');
    const headerUserNickname = document.getElementById('header-user-nickname');
    const dashboardUserQuote = document.getElementById('dashboard-user-quote');

    if (sidebarUserNickname) sidebarUserNickname.textContent = nickname;
    if (headerUserNickname) headerUserNickname.textContent = nickname;

    if (dashboardUserQuote) {
      dashboardUserQuote.innerHTML = `<span class="text-tertiary-fixed font-medium">${user.quote || '"Fokus pada satu hal penting hari ini."'}</span>`;
    }

    this.renderAvatarBox('header-avatar-box', 'header-avatar-initial', user.avatar, nickname);
    this.renderAvatarBox('sidebar-avatar-box', 'sidebar-avatar-initial', user.avatar, nickname);

    this.updateGreetingHeader(nickname);
  }

  renderAvatarBox(containerId, initialId, avatarUrl, name) {
    const container = document.getElementById(containerId);
    const initialSpan = document.getElementById(initialId);
    if (!container) return;

    let imgEl = container.querySelector('img');

    if (avatarUrl) {
      if (!imgEl) {
        imgEl = document.createElement('img');
        imgEl.className = 'w-full h-full object-cover';
        container.appendChild(imgEl);
      }
      imgEl.src = avatarUrl;
      imgEl.classList.remove('hidden');
      if (initialSpan) initialSpan.classList.add('hidden');
    } else {
      if (imgEl) imgEl.classList.add('hidden');
      if (initialSpan) {
        initialSpan.classList.remove('hidden');
        initialSpan.textContent = (name || 'U').charAt(0).toUpperCase();
      }
    }
  }

  initNavigation() {
    this.navLinks = document.querySelectorAll('#main-nav .nav-item');
    this.views = document.querySelectorAll('.view-section');

    const handleRoute = () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.switchView(hash);
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  switchView(path) {
    this.navLinks.forEach(link => {
      const isCurrent = link.dataset.path === path;
      if (isCurrent) {
        link.className = 'nav-item flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg transition-all bg-surface-container-high text-on-surface font-medium shadow-xs';
      } else {
        link.className = 'nav-item flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all';
      }
    });

    this.views.forEach(view => {
      if (view.id === `view-${path}`) {
        view.classList.remove('hidden');
        view.classList.add('flex');
      } else {
        view.classList.add('hidden');
        view.classList.remove('flex');
      }
    });
  }

  initDateTimeGreeting() {
    const dateLabel = document.getElementById('current-date-label');

    const updateTime = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      const dayName = days[now.getDay()];
      const dayDate = now.getDate();
      const monthName = months[now.getMonth()];

      if (dateLabel) {
        dateLabel.textContent = `${dayName}, ${dayDate} ${monthName}`;
      }

      const user = store.currentUser;
      const nickname = user ? (user.nickname || user.name.split(' ')[0]) : 'Teman';
      this.updateGreetingHeader(nickname);
    };

    updateTime();
    setInterval(updateTime, 60000);
  }

  updateGreetingHeader(nickname) {
    const greetingHeader = document.getElementById('greeting-header');
    if (!greetingHeader) return;

    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 11 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18 || hour < 4) greeting = 'Selamat Malam';

    greetingHeader.textContent = `${greeting}, ${nickname} ✨`;
  }

  initSettings() {
    const inputPomo = document.getElementById('setting-pomo-min');
    const inputShort = document.getElementById('setting-short-min');
    const inputLong = document.getElementById('setting-long-min');
    const resetBtn = document.getElementById('reset-data-btn');

    if (inputPomo) {
      inputPomo.value = store.state.settings.pomoMinutes || 25;
      inputPomo.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10) || 25;
        store.updateSettings({ pomoMinutes: val });
      });
    }

    if (inputShort) {
      inputShort.value = store.state.settings.shortBreakMinutes || 5;
      inputShort.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10) || 5;
        store.updateSettings({ shortBreakMinutes: val });
      });
    }

    if (inputLong) {
      inputLong.value = store.state.settings.longBreakMinutes || 15;
      inputLong.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10) || 15;
        store.updateSettings({ longBreakMinutes: val });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Apakah kamu yakin ingin mereset seluruh data lokal?')) {
          store.resetAllData();
          soundSystem.playTick();
          window.location.reload();
        }
      });
    }
  }

  subscribeStore() {
    store.subscribe(() => {
      this.checkAuthState();
      this.updateStats();
      if (store.state.settings.theme) {
        ThemeManager.applyTheme(store.state.settings.theme);
        this.updateThemeCardActiveState(store.state.settings.theme);
      }
    });
  }

  updateStats() {
    const stats = store.state.stats;
    const habits = store.state.habits;

    const bentoFocusMinutes = document.getElementById('bento-focus-minutes');
    const bentoFocusSessionsLabel = document.getElementById('bento-focus-sessions-label');
    const sidebarFocusTime = document.getElementById('sidebar-focus-time');
    const bentoHabitStreak = document.getElementById('bento-habit-streak');
    const sidebarHabitsStat = document.getElementById('sidebar-habits-stat');
    const sidebarHabitsBar = document.getElementById('sidebar-habits-bar');

    if (bentoFocusMinutes) {
      bentoFocusMinutes.textContent = stats.focusMinutesToday;
    }

    if (bentoFocusSessionsLabel) {
      bentoFocusSessionsLabel.innerHTML = `
        <span class="material-symbols-outlined text-[14px]">bolt</span>
        <span>${stats.completedSessions} sesi tercapai (Target: ${stats.targetSessions})</span>
      `;
    }

    if (sidebarFocusTime) {
      const hrs = Math.floor(stats.focusMinutesToday / 60);
      const mins = stats.focusMinutesToday % 60;
      sidebarFocusTime.textContent = `${hrs}h ${mins}m`;
    }

    if (bentoHabitStreak) {
      bentoHabitStreak.textContent = stats.currentStreak;
    }

    const doneHabitsCount = habits.filter(h => h.days[1]).length;
    const totalHabits = habits.length;
    const percent = totalHabits > 0 ? (doneHabitsCount / totalHabits) * 100 : 0;

    if (sidebarHabitsStat) {
      sidebarHabitsStat.textContent = `${doneHabitsCount}/${totalHabits}`;
    }

    if (sidebarHabitsBar) {
      sidebarHabitsBar.style.width = `${percent}%`;
    }
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
