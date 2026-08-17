# SaiU Timetable → SaiU V2 Audit

## Audit scope

The source repository `y-bow/SaiU-Timetable` was inspected through its repository tree, README, configuration, service worker, and major application modules. The original is a public static JavaScript PWA with `core`, `data`, `ui`, `services`, `teachers`, `game`, and generated build areas. Its README documents live-class countdowns, filters, offline support, themes, timetable change detection, n8n notifications, and an Ask SaiU AI integration.

## Strengths found

- Clear separation of timetable parsing, UI, services, and teacher functionality.
- Offline-first intent and an explicit service-worker update strategy.
- Timetable change detection already exists and can be reused conceptually.
- AI is routed through n8n rather than embedding provider credentials in browser code.
- PWA support, themes, calendar-like schedule data, and a Breakout game already provide a strong base.

## Gaps / risks found

1. **Configuration safety** — the original configuration contains production webhook URLs in frontend source. They are disabled by flags in the inspected configuration, but URLs should not be treated as secrets and production endpoints should be controlled by a server-side gateway.
2. **AI availability is configuration-driven** — the inspected configuration has both AI UI and feature switches disabled, so the V2 design makes the local timetable assistant useful without requiring a network service.
3. **Static-JS scaling** — the original no-build-tools architecture is simple and deployable, but a larger feature surface needs stronger module contracts, automated syntax checks, tests, and CI.
4. **Generated build coupling** — the original build process rewrites asset versions and generated files. V2 keeps versioning simpler and puts quality gates in CI.
5. **Testing** — the original contains a timetable test harness, but V2 adds a Node test suite that can run automatically in GitHub Actions.
6. **Product scope** — the original is primarily a timetable PWA. V2 adds a student-OS layer: planner, local gamification, AI, calendar export, notifications, sharing/comparison primitives, and academic planning primitives.

## V2 implementation map

### Phase 1 — Foundation

- Responsive application shell
- Modular ES modules
- LocalStorage state store
- PWA manifest/service worker
- Accessibility-minded controls
- CI and syntax checks

### Phase 2 — World-class timetable

- Live/current-class detection
- Next-class detection
- Day views
- Free-time engine
- Conflict detector
- CSV parser
- Calendar `.ics` export

### Phase 3 — SaiU AI

- Local-first timetable Q&A
- Next-class/free-time/schedule/conflict queries
- Optional HTTPS AI gateway
- Timeout/error fallback
- No AI provider credentials in frontend

### Phase 4 — Student OS

- Planner and task XP
- Local attendance/exam data primitives
- Notifications
- Calendar integration
- Personal schedule intelligence foundation

### Phase 5 — Social + gamification

- XP, levels and badges
- Schedule sharing
- Schedule comparison/common free-time engine
- Optional social layer without requiring account creation

### Phase 6 — Production

- GitHub Actions CI
- Automated timetable tests
- Syntax validation
- Required PWA file validation
- Offline caching
- Security guidance

## Important limitation

`SaiU-V2` is a clean V2 implementation created from the audit and product requirements; it is **not a byte-for-byte fork** of the original repository. The original contains binary assets and a larger set of school-specific timetable parsers/data that should be migrated deliberately rather than copied blindly. The V2 engine currently ships with safe sample data and a CSV ingestion path so the application is runnable immediately.

## Recommended next migration

Connect the real published timetable source to the V2 `loadCsv()` pipeline, then migrate school/year/section normalization rules from the original parser modules behind that interface. This preserves the original data correctness work while keeping the V2 application architecture clean.
