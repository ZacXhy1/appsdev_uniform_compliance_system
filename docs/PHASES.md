# Phase Plan

The project is built feature-by-feature rather than all at once. Each phase
should be stable and testable before moving to the next.

## Phase 0 — Prep (no feature code yet)

- Confirm stack, inspect repo, establish folder structure (this scaffold).
- Global styles / design tokens.
- Application shell, sidebar, header.
- All seven page/view files created (can be empty/stubbed).
- Mock detection data structure in `js/data/mock-data.js`.
- Working navigation between pages.
- Confirm Git workflow with the whole team (branching, pulling, commit ownership).

**Deliverable:** an empty but navigable app shell with no real screens built yet — the foundation everyone builds on top of.

## Phase 1 — Login

- Login screen UI.
- Demo login state (`localStorage`).
- Login validation (demo-level, not real security).
- Logout.
- Navigation guard behavior (redirect if not "logged in").

**Deliverable:** a working demo login/logout flow that gates access to the rest of the app.

## Phase 2 — Dashboard

- Dashboard layout.
- Summary/stat cards driven by mock data.
- Recent activity feed.

## Phase 3 — Live Monitoring

- Camera simulation.
- Monitoring status.
- Detection simulation.
- Detection result card.
- Recent detection events.

**Deliverable:** the app feels like a live monitoring system despite no real camera/AI.

## Phase 4 — Detections

- Data-driven detection table.
- Search, filters, sorting.
- Details modal/view.
- Empty states.

**Deliverable:** personnel can review the complete simulated detection history.

## Phase 5 — Violations

- Non-compliant filtering.
- Violation table/cards.
- Violation details.
- Violation summaries over time.

**Deliverable:** personnel can quickly review uniform violations.

## Phase 6 — Reports

- Compliance statistics.
- Charts.
- Date/filter controls if appropriate.
- Breakdown by time/date (all detections are from the single Main Gate camera).
- Summary report UI.

**Deliverable:** personnel can understand trends in compliance.

## Phase 7 — Settings

- Preferences (theme, notifications, display).
- Demo reset.
- `localStorage` persistence.

**Deliverable:** settings actually affect the frontend where appropriate.

## Phase 8 — Polish

- Responsive layouts.
- Empty / loading / error states.
- Validation.
- Transitions.
- Consistent spacing & typography.
- Accessibility.
- Mobile usability.
- Cross-page consistency.

## Phase 9 — Final testing & feature freeze

Test the complete flow: open app → login → dashboard → live monitoring →
detections → filter detections → violations → reports → settings → refresh
browser (confirm `localStorage` behavior) → logout → confirm protected/demo
pages behave correctly → mobile layout → empty/error states.

After feature freeze, avoid adding large new features unless there's time to
test them properly.
