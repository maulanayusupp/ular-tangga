# 🪜🐍 Ular Tangga

Game ular tangga klasik versi **mobile web**, dibuat dengan **Vue 3 + Vite**. Gratis, tanpa download, langsung jalan di browser HP atau desktop.

> Naik tangga, hindari ular — sampai 100 dulu menang.

## ✨ Fitur

- 🤖 **Mode vs Bot** — Lawan 1 AI yang main otomatis
- 👥 **Pass & Play** — 2–4 pemain bergantian di satu HP
- 🎨 **Design modern** — Dark theme, gradient ungu-cyan, mobile-first responsive
- 🎬 **Animasi halus** — Token jalan step-by-step, slide saat kena ular/tangga, confetti saat menang
- 🔊 **Suara realistis** — Web Audio API menghasilkan suara dadu, langkah, naik tangga (arpeggio), turun ular (slide whistle + hiss), dan fanfare kemenangan — **tanpa file audio**
- 🪧 **Indikator arah** — Badge `↑38` / `↓6` di cell awal tangga & ular
- 📱 **PWA-ready** — Bisa di-install ke home screen iOS/Android
- 🪜 **11 tangga & 10 ular** — Layout klasik
- 🔍 **SEO-optimized** — Meta tags lengkap, Open Graph, Twitter Card, JSON-LD schema

## 🚀 Cara Jalankan

```bash
npm install
npm run dev          # dev server di http://localhost:5173
npm run build        # build produksi → dist/
npm run preview      # preview build produksi
```

> **Catatan**: kalau `localhost:5173` ke-route ke project Vite lain (misal Laravel), pakai `127.0.0.1:5173` saja.

## 🛠 Tech Stack

| Layer | Pilihan |
| --- | --- |
| Framework | Vue 3 (Composition API) |
| Bundler | Vite 5 |
| Audio | Web Audio API (synthesized, no assets) |
| Grafik | CSS Grid + inline SVG |
| Install | PWA Manifest (mobile home screen) |

## 📦 Struktur Project

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
    ├── App.vue                   Root, switch menu/game
    ├── main.js
    ├── style.css                 Global styles, CSS variables, dark theme
    ├── components/
    │   ├── MainMenu.vue          Pilih mode + jumlah pemain
    │   ├── GameView.vue          Layout in-game (header + board + dice)
    │   ├── GameBoard.vue         CSS grid + SVG overlay + tokens
    │   ├── DiceRoller.vue        Dadu 3D animasi spin
    │   └── WinModal.vue          Modal menang + confetti
    └── composables/
        ├── useGameState.js       Game logic + state (single source of truth)
        └── useSound.js           Web Audio synthesis
```

## 🎲 Aturan Main

- Lemparan dadu **1–6**
- Sampai **cell 100** = menang
- Kalau lemparan melebihi 100 → **bounce back** (mundur dari 100)
- Mendarat di **kepala ular** → turun ke ekor (badge `↓nn`)
- Mendarat di **kaki tangga** → naik ke ujung atas (badge `↑nn`)

### Daftar Tangga

| Naik dari | Ke |
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

### Daftar Ular

| Kepala (mendarat di) | Ekor (turun ke) |
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

Web Audio API butuh user gesture pertama — sound auto-aktif setelah tap dadu pertama.

## 🚢 Deployment

Hasil `npm run build` di folder `dist/` adalah **static files** — bisa di-deploy ke:

- Vercel / Netlify / Cloudflare Pages (drag & drop folder `dist`)
- GitHub Pages
- Static hosting biasa (S3, nginx, dll)

**Sebelum deploy, ganti placeholder URL** di file-file berikut dengan domain final:

- `index.html` (canonical, og:url, twitter:url, JSON-LD url, og:image, twitter:image)
- `public/robots.txt` (sitemap URL)
- `public/sitemap.xml` (`<loc>`)

Cari & ganti `https://ular-tangga.example.com` → URL kamu.

## 📄 License

MIT
