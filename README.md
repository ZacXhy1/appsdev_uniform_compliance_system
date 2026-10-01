# MEMBERS:
1. Zachary Ivan C. Buytrago
2. Paul Angelo Magbanua
3. Earl John Entero
4. Dean Mark Salapi

# AI-Powered School Uniform Compliance Monitoring System

Frontend-only prototype dashboard for Consolatrix College of Toledo City Inc.
Built with vanilla HTML / CSS / JavaScript — no backend, no real database, no
real AI. Detection results are simulated to demonstrate what such a system
could look and behave like.

## Scope

Detection is limited to a single category: **wearing school uniform** vs.
**not wearing school uniform**. There is no sub-classification (blouse vs.
polo, pants vs. skirt), no ID lace check, and no footwear check. There is
also no student identification — the camera cannot tell who someone is, so
detections are anonymous events (`Student 1`, `Student 2`, ...), not linked
to real student records. There is only one simulated camera, fixed at the
Main Gate — no other checkpoints or location filtering.

## Screens

Login · Dashboard · Live Monitoring · Detections · Violations · Reports · Settings

## What's built

- **Login** — demo login (`admin` / `admin123`) with a navigation guard on every
  protected page and a working logout. Simulated only, not real security.
- **Dashboard** — summary cards, compliance chart, recent activity, and Live
  Monitoring status, all computed from the shared detection log.
- **Live Monitoring** — optional real webcam feed (visual only, with a
  simulated fallback), live clock, start/stop, simulated detections every few
  seconds, and a Latest Detection card with a snapshot frame.
- **Detections** — search, status filter, sorting, pagination (15 per page),
  and a details modal with a snapshot frame. Detections the system was unsure
  about (`pending`) can be **manually reviewed** and confirmed as compliant or
  a violation; a banner shows how many are waiting.
- **Violations** — non-compliant detections only, with stats, a by-date
  summary, filters, and a details modal.
- **Reports** — compliance statistics, overview chart, summary report, and
  detections-by-date trend with a date filter.
- **Settings** — theme, compact view, and notification preferences (saved in
  `localStorage`), plus reset buttons for preferences and detection data.

Snapshots are empty-avatar placeholders for now — nothing analyzes real video.

## Tech stack

HTML, CSS, JavaScript. No frameworks, no backend. State is handled with
`localStorage` (login flag, settings) and `sessionStorage` (the detection log,
which clears when the browser tab closes); detection data is simulated from a
shared JavaScript dataset.

## Running it

No build step. Open `index.html` directly, or use a static server such as VS
Code Live Server or `python3 -m http.server`. Log in with `admin` / `admin123`.

## Folder structure

```text
appsdev_uniform_compliance_system/
├── index.html                 # App entry point / shell
├── pages/                     # One HTML file per screen
│   ├── login.html
│   ├── dashboard.html
│   ├── monitoring.html
│   ├── detections.html
│   ├── violations.html
│   ├── reports.html
│   └── settings.html
├── css/
│   ├── global.css             # Design tokens, resets, layout shell
│   ├── components.css         # Sidebar, header, cards, modal, table, etc.
│   └── pages/                 # One stylesheet per screen
├── js/
│   ├── app.js                 # Shell init, formatters, toast/confirm helpers, snapshot frame
│   ├── auth.js                # Demo login / logout / nav guard
│   ├── settings.js            # Preferences store + theme/density application
│   ├── data/
│   │   └── mock-data.js       # SINGLE source of truth: seed data + session detection log
│   ├── components/            # Reusable UI (sidebar, header, stat-card, modal, pagination)
│   └── pages/                 # One script per screen
├── assets/
│   ├── images/
│   └── icons/
├── docs/
│   ├── TEAM.md                 # Ownership & who's working on what
│   └── PHASES.md                # Build order / milestone plan
├── .gitignore
└── README.md
```

## Core principle

All simulated detection data flows from one shared dataset
(`js/data/mock-data.js`). Every page reads the session log through
`getSessionDetections()` (seeded from `MOCK_DETECTIONS`, then grown by Live
Monitoring and updated by manual reviews), so Dashboard, Live Monitoring,
Detections, Violations, and Reports always agree with each other. Don't read
the raw `MOCK_DETECTIONS` array from a page.

## Docs

- [`docs/TEAM.md`](docs/TEAM.md) — who owns which screens
- [`docs/PHASES.md`](docs/PHASES.md) — build order, milestones, and current status

## Rules

- Frontend-only. No backend, database, real auth, or real AI. Live Monitoring
  can display a real local webcam feed (via the browser's camera API) purely
  for visual realism — the detection results shown are still fully simulated,
  not derived from the video.
- Do not commit `node_modules`.
- Pull before starting work; avoid two people editing the same shared file at once.
