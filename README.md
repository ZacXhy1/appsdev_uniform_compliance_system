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

## Tech stack

HTML, CSS, JavaScript. No frameworks, no backend. State is handled with
`localStorage`; detection data is simulated from a shared JavaScript dataset.

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
│   ├── app.js                 # App init, navigation, shared setup
│   ├── data/
│   │   └── mock-data.js       # SINGLE source of truth for simulated detections
│   ├── components/            # Reusable UI logic (sidebar, header, stat-card, modal)
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

This repo starts as a scaffold: the folders above are intentionally empty
except for placeholders, so each screen/file has a clear home before work
begins.

## Core principle

All simulated detection data flows from one shared dataset
(`js/data/mock-data.js`). Dashboard statistics, Live Monitoring, the
Detections table, Violations filtering, and Reports all read from the same
records rather than duplicating data per page.

## Docs

- [`docs/TEAM.md`](docs/TEAM.md) — who owns which screens
- [`docs/PHASES.md`](docs/PHASES.md) — build order and milestones

## Rules

- Frontend-only. No backend, database, real auth, CCTV, or real AI.
- Do not commit `node_modules`.
- Pull before starting work; avoid two people editing the same shared file at once.
