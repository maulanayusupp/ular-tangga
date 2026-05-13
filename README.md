# 🪜🐍 Snakes & Ladders

Classic Snakes & Ladders board game as a **mobile-first web app**, built with **Vue 3 + Vite**. Free, no download — runs in any modern browser.

> Climb ladders, dodge snakes — first to 100 wins.

## ✨ Features

- 🤖 **vs AI Bot** — Single-player against an automatic opponent
- 👥 **Pass & Play** — 2–4 players taking turns on one device
- 🎨 **Modern design** — Dark theme, purple-cyan gradient, mobile-first responsive
- 🎬 **Smooth animations** — Token walks cell-by-cell, slides on snakes/ladders, confetti on win
- 🔊 **Realistic sound effects** — Web Audio API synthesizes dice clatter, footsteps, ladder arpeggio, snake slide-whistle + hiss, and a win fanfare — **no audio assets**
- 🪧 **Direction indicators** — `↑38` / `↓6` badges on snake/ladder start cells
- 📱 **PWA-ready** — Install to iOS/Android home screen
- 🪜 **11 ladders & 10 snakes** — Classic layout
- 🔍 **SEO-optimized** — Full meta tags, Open Graph, Twitter Card, JSON-LD schema

## 🚀 Getting Started

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
```

> **Note**: If `localhost:5173` routes to another Vite project (e.g. a Laravel app on the same machine), use `127.0.0.1:5173` instead.

## 🛠 Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Vue 3 (Composition API) |
| Bundler | Vite 5 |
| Audio | Web Audio API (synthesized, no assets) |
| Graphics | CSS Grid + inline SVG |
| Install | PWA Manifest (mobile home screen) |

## 📦 Project Structure

```
ular-tangga/
├── index.html                    SEO meta tags, OG, Twitter Card, JSON-LD
├── public/
│   ├── favicon.svg
│   ├── og-image.svg              1200×630 social preview
│   ├── manifest.webmanifest      PWA install metadata
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── App.vue                   Root, switches between menu and game
    ├── main.js
    ├── style.css                 Global styles, CSS variables, dark theme
    ├── components/
    │   ├── MainMenu.vue          Mode + player count selection
    │   ├── GameView.vue          In-game layout (header + board + dice)
    │   ├── GameBoard.vue         CSS grid + SVG overlay + tokens
    │   ├── DiceRoller.vue        Animated dice button
    │   └── WinModal.vue          Win modal + confetti
    └── composables/
        ├── useGameState.js       Game logic + state (single source of truth)
        └── useSound.js           Web Audio synthesis
```

## 🎲 Rules

- Roll a **1–6** die
- Reach **cell 100** to win
- If the roll overshoots 100 → **bounce back** the excess from 100
- Landing on a **snake's head** → slide down to its tail (badge `↓nn`)
- Landing on a **ladder's foot** → climb up to its top (badge `↑nn`)

### Ladders

| From | To |
| ---: | ---: |
| 2 | 38 |
| 7 | 14 |
| 8 | 31 |
| 15 | 26 |
| 21 | 42 |
| 28 | 84 |
| 36 | 44 |
| 51 | 67 |
| 71 | 91 |
| 78 | 98 |
| 87 | 94 |

### Snakes

| Head (landing) | Tail (destination) |
| ---: | ---: |
| 16 | 6 |
| 46 | 25 |
| 49 | 11 |
| 62 | 19 |
| 64 | 60 |
| 74 | 53 |
| 89 | 68 |
| 92 | 88 |
| 95 | 75 |
| 99 | 80 |

## 🌐 Browser Support

- Chrome / Edge 88+
- Safari 14+ (iOS 14+)
- Firefox 78+

The Web Audio API requires a user gesture for the first sound — audio activates automatically after the first dice tap.

## 🚢 Deployment

Live at **<https://ular-tangga-sigma.vercel.app>** (Vercel).

`npm run build` outputs static files to `dist/`. Deploy to any static host:

- Vercel / Netlify / Cloudflare Pages (drop the `dist/` folder)
- GitHub Pages
- Any static hosting (S3, nginx, etc.)

If you fork this repo and deploy to a different domain, update the URL in `index.html` (canonical, og:url, twitter:url, JSON-LD url, og:image, twitter:image), `public/robots.txt` (Sitemap), and `public/sitemap.xml` (`<loc>`).

## 📄 License

MIT
