# Lofi Music Player 🎵

A browser-based lofi music player inspired by [lofi.cafe](https://lofi.cafe). Enjoy curated lofi beats with animated GIF backgrounds and a retro CRT aesthetic.

---

## Features

- **Music playback** — curated lofi YouTube playlist with play, pause, next, and previous controls
- **Animated backgrounds** — GIFs that change with each track
- **Night mode** — dims the background and fades the volume down; UI auto-hides after 15 seconds of inactivity
- **Volume control** — 10-bar volume slider with animated dancing bars and a mute toggle
- **Retro visual effects** — film grain, CRT scanlines, and vignette overlay
- **Keyboard shortcuts** — control everything without touching the mouse
- **Custom playlist** - custom playlist that let user add their favorite songs
- **Pomodoro** - pomodoro clock for setting up concentration time

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` | Next track |
| `←` | Previous track |
| `M` | Mute / Unmute |
| `H` | Toggle UI visibility |
| `F` | Toggle fullscreen |

---

## Getting Started

No build step required — just open `index.html` in your browser.

> **Note:** Music is streamed via the YouTube IFrame API. An internet connection is required for playback.

---

## Project Structure

```
lofi-music-player/
├── index.html          # App markup
├── style.css           # Styles and retro visual effects
├── player.js           # Player logic, playlist, volume, and UI controls
├── gif/                # Background GIF animations
└── textures/noise/     # Film grain texture
```

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Courier Prime](https://fonts.google.com/specimen/Courier+Prime) (Google Fonts)

---

## Credits

Inspired by [lofi.cafe](https://lofi.cafe).
