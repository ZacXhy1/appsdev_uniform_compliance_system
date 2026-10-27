# AI-Powered School Uniform Compliance Monitoring System Using Camera-Based Computer Vision

A frontend-only prototype dashboard for **Consolatrix College of Toledo City Inc.**, built as a semester project for our Applications Development subject.

It is built with plain HTML, CSS, and JavaScript — **no backend, no database, and no real AI**. Every detection is simulated to show what a uniform compliance
system could look and feel like. Nothing analyzes real video or real people.

## Members

1. Zachary Ivan C. Buytrago
2. Paul Angelo Magbanua
3. Earl John Entero
4. Dean Mark Salapi

## Demo login

| Username | Password   |
|----------|------------|
| `admin`  | `admin123` |

This is a demo-only login: a flag in `localStorage` that the pages check. It is
**not** real security, and these are not real credentials.

## Scope

Detection is limited to one category: **wearing the school uniform** vs.
**not wearing the school uniform**.

- No sub-classification (blouse vs. polo, pants vs. skirt), no ID lace check,
  and no footwear check.
- No student identification. Detections are anonymous events (`Student 1`,
  `Student 2`, ...) and are not linked to any real student record.
- One simulated camera fixed at the **Main Gate**. There are no other
  checkpoints and no location filters.

## Screens

Login · Dashboard · Live Monitoring · Detections · Violations · Reports · Settings

## Features

- **Login** — demo login that protects every page, with logout.
- **Dashboard** — one-screen overview with KPI cards, charts, and recent activity.
- **Live Monitoring** — optional webcam view with simulated detections that keep running while you move between pages.
- **Detections** — searchable, filterable, paginated list with a details modal. 
  Unclear results can be reviewed manually, and wrong results can be corrected.
- **Violations** — non-compliant detections with stats, filters, details, and pagination (15 per page).
- **Reports** — compliance statistics, charts, a date filter, and export (CSV download, or Print / Save as PDF).
- **Settings** — demo user profile, light/dark theme, compact view, notifications, monitoring refresh interval (every 2/4/8/15 seconds), and demo reset.

Snapshots are empty-avatar placeholders for now. See
[`docs/PHASES.md`](docs/PHASES.md) for the full details of each screen.

## Tech stack

Plain HTML, CSS, and JavaScript. No frameworks, no build step, no backend. State is kept in the browser (`localStorage` and `sessionStorage`). The only external resource is the Google Fonts stylesheet.
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for details.

## Running it

There is no build step. Either open `index.html` directly, or use a static
server such as VS Code Live Server or `python3 -m http.server`, then log in with
the demo credentials above.

## Deployment

Pushing to `main` deploys the site to GitHub Pages through
`.github/workflows/static.yml`.

## Folder structure

```text
├── index.html                 # Entry point, redirects to the login page
├── pages/                     # One HTML file per screen
│   ├── login.html
│   ├── dashboard.html
│   ├── monitoring.html
│   ├── detections.html
│   ├── violations.html
│   ├── reports.html
│   └── settings.html
├── css/
│   ├── global.css             # Design tokens, resets, layout shell, themes
│   ├── components.css         # Sidebar, header, cards, modal, table, pills, etc.
│   └── pages/                 # One stylesheet per screen
├── js/
│   ├── app.js                 # Shell init, formatters, toast/confirm, snapshot frame, correction helper
│   ├── auth.js                # Demo login / logout / navigation guard
│   ├── settings.js            # Preferences store + theme/density (loaded in <head>)
│   ├── boot.js                # Hides page content until scripts run (prevents flicker)
│   ├── monitoring-engine.js   # Background detection timer, loaded on every protected page
│   ├── data/
│   │   └── mock-data.js       # Seed data + session detection log (single source of truth)
│   ├── components/            # Reusable UI: sidebar, header, stat-card, modal, pagination
│   └── pages/                 # One script per screen
├── assets/
│   ├── images/                # Login background and hologram video poster frame
│   ├── video/                 # Dashboard hero video (muted, looping, no audio)
│   └── icons/
├── docs/
│   ├── ARCHITECTURE.md        # How the scripts, data, and state fit together
│   ├── PHASES.md              # Build order, milestones, and current status
│   └── TEAM.md                # Ownership and ground rules
├── .github/workflows/
│   └── static.yml             # GitHub Pages deployment
├── .gitignore
└── README.md
```

All simulated detection data flows through `js/data/mock-data.js`. Pages read it
with `getSessionDetections()`, never the raw `MOCK_DETECTIONS` array.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — script load order, data flow, state
- [`docs/PHASES.md`](docs/PHASES.md) — build order, milestones, and current status
- [`docs/TEAM.md`](docs/TEAM.md) — who owns which screens, and ground rules

## Rules

- Frontend-only. No backend, database, real authentication, or real AI.
- Do not commit `node_modules` or secrets (`.env` is already git-ignored).
- Pull before starting work, and avoid two people editing the same shared file
  at once.
