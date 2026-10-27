// Disciplined Studio Color & Theme Manager for ponzfocus
// Inspired by Swiss typography & Japanese wabi-sabi minimalism

export const THEMES = {
  'kyoto-ink': {
    name: 'Kyoto Sumi & Cinnabar',
    description: 'Arang sumi hangat, kertas washi krem, dan aksen stempel cinnabar.',
    colors: {
      background: '#111213',
      surface: '#111213',
      'surface-container-low': '#161719',
      'surface-container': '#1c1d20',
      'surface-container-high': '#24262a',
      'surface-container-highest': '#2f3136',
      primary: '#e64528',
      'on-primary': '#ffffff',
      'primary-container': '#381611',
      secondary: '#7eb382',
      'on-secondary': '#112914',
      tertiary: '#d9a05b',
      'on-surface': '#f4f3ed',
      'on-surface-variant': '#9e9c93',
      outline: '#69675f',
      'outline-variant': '#2c2e33'
    }
  },
  'swiss-grid': {
    name: 'Swiss Modernist Slate',
    description: 'Batu slate arsitektural, tipografi presisi, dan aksen oranye Zurich.',
    colors: {
      background: '#121315',
      surface: '#121315',
      'surface-container-low': '#17191d',
      'surface-container': '#1e2126',
      'surface-container-high': '#262930',
      'surface-container-highest': '#31353e',
      primary: '#ff4d00',
      'on-primary': '#ffffff',
      'primary-container': '#381605',
      secondary: '#3ecf8e',
      'on-secondary': '#052918',
      tertiary: '#e6b450',
      'on-surface': '#f2f4f8',
      'on-surface-variant': '#9ea3ad',
      outline: '#686d77',
      'outline-variant': '#2a2d33'
    }
  },
  'retro-paper': {
    name: 'Retro Raw Paper & Ochre',
    description: 'Tekstur kertas koran antik, tinta kayu, dan aksen terakota hangat.',
    colors: {
      background: '#171513',
      surface: '#171513',
      'surface-container-low': '#1e1b18',
      'surface-container': '#25221d',
      'surface-container-high': '#302b25',
      'surface-container-highest': '#3d372f',
      primary: '#c86432',
      'on-primary': '#ffffff',
      'primary-container': '#361b0f',
      secondary: '#8fa876',
      'on-secondary': '#1b2611',
      tertiary: '#d4a373',
      'on-surface': '#f5efe4',
      'on-surface-variant': '#a89f92',
      outline: '#70685c',
      'outline-variant': '#342f27'
    }
  },
  'sumi-charcoal': {
    name: 'Monochrome Bauhaus Dark',
    description: 'Monokromatik kontras tinggi murni dengan titik merah sinyal tajam.',
    colors: {
      background: '#0d0d0e',
      surface: '#0d0d0e',
      'surface-container-low': '#141416',
      'surface-container': '#1a1a1d',
      'surface-container-high': '#232428',
      'surface-container-highest': '#2e2f34',
      primary: '#d83a27',
      'on-primary': '#ffffff',
      'primary-container': '#2e120f',
      secondary: '#9ca3af',
      'on-secondary': '#111827',
      tertiary: '#d1d5db',
      'on-surface': '#fafafa',
      'on-surface-variant': '#a1a1aa',
      outline: '#71717a',
      'outline-variant': '#27272a'
    }
  },
  'nordic-moss': {
    name: 'Nordic Pine & Stone',
    description: 'Hutan pinus Skandinavia yang tenang dengan aksen bata Nordik.',
    colors: {
      background: '#101512',
      surface: '#101512',
      'surface-container-low': '#161c18',
      'surface-container': '#1d2520',
      'surface-container-high': '#26312a',
      'surface-container-highest': '#313f36',
      primary: '#c25732',
      'on-primary': '#ffffff',
      'primary-container': '#2e160e',
      secondary: '#7eb897',
      'on-secondary': '#0f291c',
      tertiary: '#d9b875',
      'on-surface': '#eef5f0',
      'on-surface-variant': '#9fb0a4',
      outline: '#67786c',
      'outline-variant': '#26332a'
    }
  }
};

// Legacy key aliases for seamless migration
const THEME_ALIASES = {
  'deep-ocean': 'kyoto-ink',
  'zen-sage': 'nordic-moss',
  'serene-sunset': 'retro-paper',
  'nordic-twilight': 'swiss-grid',
  'soft-minimal': 'sumi-charcoal'
};

export class ThemeManager {
  static applyTheme(themeKey) {
    const resolvedKey = THEME_ALIASES[themeKey] || themeKey;
    const theme = THEMES[resolvedKey] || THEMES['kyoto-ink'];
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
