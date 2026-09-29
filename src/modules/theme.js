// Calming Color Theme Manager for FocusFlow

export const THEMES = {
  'deep-ocean': {
    name: 'Calm Deep Ocean',
    description: 'Biru keunguan gelap yang menenangkan untuk fokus mendalam.',
    colors: {
      background: '#0b1326',
      surface: '#0b1326',
      'surface-container-low': '#131b2e',
      'surface-container': '#171f33',
      'surface-container-high': '#222a3d',
      'surface-container-highest': '#2d3449',
      primary: '#c0c1ff',
      'on-primary': '#1000a9',
      'primary-container': '#8083ff',
      secondary: '#4edea3',
      'on-secondary': '#003824',
      tertiary: '#ffb95f',
      'on-surface': '#dae2fd',
      'on-surface-variant': '#c7c4d7',
      outline: '#908fa0'
    }
  },
  'zen-sage': {
    name: 'Zen Sage & Forest',
    description: 'Hijau daun sage yang sejuk dan menyegarkan mata.',
    colors: {
      background: '#0b1a15',
      surface: '#0b1a15',
      'surface-container-low': '#112620',
      'surface-container': '#17332b',
      'surface-container-high': '#224239',
      'surface-container-highest': '#2d5247',
      primary: '#6ffbbe',
      'on-primary': '#003824',
      'primary-container': '#005236',
      secondary: '#a7f3d0',
      'on-secondary': '#064e3b',
      tertiary: '#fcd34d',
      'on-surface': '#e6f7f2',
      'on-surface-variant': '#b2d8ce',
      outline: '#82a89e'
    }
  },
  'serene-sunset': {
    name: 'Serene Warm Amber',
    description: 'Warna hangat senja amber yang lembut dan rileks.',
    colors: {
      background: '#1a130f',
      surface: '#1a130f',
      'surface-container-low': '#261c16',
      'surface-container': '#33251e',
      'surface-container-high': '#423229',
      'surface-container-highest': '#523f34',
      primary: '#ffd099',
      'on-primary': '#472a00',
      'primary-container': '#ca8100',
      secondary: '#6ee7b7',
      'on-secondary': '#064e3b',
      tertiary: '#f472b6',
      'on-surface': '#fdeee6',
      'on-surface-variant': '#e6c7b8',
      outline: '#a88c7d'
    }
  },
  'nordic-twilight': {
    name: 'Nordic Twilight Lavender',
    description: 'Sentuhan lavender & biru fajar musim dingin.',
    colors: {
      background: '#12111d',
      surface: '#12111d',
      'surface-container-low': '#1c1a2c',
      'surface-container': '#25233b',
      'surface-container-high': '#32304d',
      'surface-container-highest': '#413f61',
      primary: '#d8b4fe',
      'on-primary': '#3b0764',
      'primary-container': '#9333ea',
      secondary: '#38bdf8',
      'on-secondary': '#0c4a6e',
      tertiary: '#f43f5e',
      'on-surface': '#f3e8ff',
      'on-surface-variant': '#d8ccf1',
      outline: '#978bb3'
    }
  },
  'soft-minimal': {
    name: 'Soft Minimal Teal',
    description: 'Kontras lembut teal malam dengan kejelasan tinggi.',
    colors: {
      background: '#0d1821',
      surface: '#0d1821',
      'surface-container-low': '#172734',
      'surface-container': '#203445',
      'surface-container-high': '#2c4459',
      'surface-container-highest': '#3a566f',
      primary: '#99f6e4',
      'on-primary': '#115e59',
      'primary-container': '#0d9488',
      secondary: '#38bdf8',
      'on-secondary': '#0c4a6e',
      tertiary: '#fbbf24',
      'on-surface': '#f0fdfa',
      'on-surface-variant': '#ccfbf1',
      outline: '#789999'
    }
  }
};

export class ThemeManager {
  static applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES['deep-ocean'];
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val);
    });

    let styleTag = document.getElementById('dynamic-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-theme-style';
      document.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      body, main, header, .bg-surface { background-color: ${theme.colors.background} !important; }
      aside, .bg-surface-container-low { background-color: ${theme.colors['surface-container-low']} !important; }
      .bg-surface-container { background-color: ${theme.colors['surface-container']} !important; }
      .bg-surface-container-high { background-color: ${theme.colors['surface-container-high']} !important; }
      .bg-surface-container-highest { background-color: ${theme.colors['surface-container-highest']} !important; }
      .text-on-surface { color: ${theme.colors['on-surface']} !important; }
      .text-on-surface-variant { color: ${theme.colors['on-surface-variant']} !important; }
      .text-outline { color: ${theme.colors.outline} !important; }
      .text-primary { color: ${theme.colors.primary} !important; }
      .bg-primary { background-color: ${theme.colors.primary} !important; }
      .text-secondary { color: ${theme.colors.secondary} !important; }
      .bg-secondary { background-color: ${theme.colors.secondary} !important; }
      .text-tertiary { color: ${theme.colors.tertiary} !important; }
      .border-surface-container-high { border-color: ${theme.colors['surface-container-high']} !important; }
      .border-surface-container-highest { border-color: ${theme.colors['surface-container-highest']} !important; }
    `;
  }
}
