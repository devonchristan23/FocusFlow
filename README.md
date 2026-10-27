# ponzfocus — Daily Mindful Productivity

An independent, Swiss-Japanese minimalist productivity workspace designed for calm deep work, zero cognitive drift, and offline-first data sovereignty.

## Architectural Features

- ⏱️ **Focus Engine (Pomodoro)**: Crisp countdown timer with synthesized Web Audio chimes, mode switching (25m / 5m / 15m), and pin-to-task focus sessions.
- 📋 **Visual Kanban Board**: Clean 3-column workflow (To Do, In Progress, Completed) with priority indicators, tags, and state progression.
- 🎯 **7-Day Habit Matrix**: Micro-consistency grid tracker with persistent weekly streak counters.
- 📔 **Reflective Daily Journal**: End-of-day introspection notes and mood logging with immediate local persistence.
- 🎨 **Swiss & Kyoto Editorial Themes**: Curated palettes including Kyoto Sumi & Cinnabar, Swiss Modernist Slate, Retro Raw Paper, Monochrome Bauhaus, and Nordic Pine.
- 🔐 **Account & Local Identity**: Multi-profile management, password reset recovery ("Lupa Password"), and custom quotes/avatars stored strictly on-device in `localStorage`.

## Tech Stack

- **HTML5 & Vanilla JavaScript** (Modular ES6 architecture)
- **Tailwind CSS & Custom Studio Typography** (Newsreader Serif + Space Grotesk + Space Mono)
- **Vite** (Build tool and development server)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ponzfocus/ponzfocus.git
   cd ponzfocus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Build production bundle:**
   ```bash
   npm run build
   ```
