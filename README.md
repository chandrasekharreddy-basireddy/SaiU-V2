# SaiU V2 — Student Operating System

SaiU V2 is an offline-first university companion built from the audit of the original SaiU Timetable PWA. It keeps the fast timetable experience while adding a live Google Sheets source, student planning, local timetable intelligence, calendar export, notifications, sharing, gamification, and production validation.

## What is included

### Phase 1 — Foundation
- Responsive PWA UI
- Local persistent state
- Theme system
- Offline service worker
- Production CI

### Phase 2 — Timetable intelligence
- Live Google Sheets CSV ingestion
- Original SaiU school/year catalog
- Section-aware filtering
- Current/next class detection
- Conflict detection
- Free-time engine
- `.ics` calendar export
- Selection-aware offline timetable cache

### Phase 3 — SaiU AI
- Local timetable assistant
- Next-class, daily, tomorrow, free-time and conflict questions
- Room/faculty/course lookup
- Longest-free-slot queries
- Optional HTTPS AI gateway
- Provider secrets remain server-side

### Phase 4 — Student OS
- Planner/tasks
- Unified XP, levels and badges
- Persistent reminder records with browser-session restoration
- Calendar
- Persistent preferences
- Attendance and exam planning

### Phase 5 — Social + gamification
- Schedule sharing through Web Share/clipboard
- Common-free-time engine
- Unified levels and badges
- Foundation for friend schedule comparison

### Phase 6 — Production
- Automated Node tests
- Syntax and cross-file import validation
- PWA validation
- Strict CSP checks
- Security-pattern scanning
- Browser E2E
- Live timetable smoke testing
- Immutable production artifact validation
- No automatic deployment

## Live timetable source

The V2 loader reads the published Sai University Google Sheet as CSV using the configured sheet ID in `js/catalog.js`. The app never requires a Google account in the browser. If the source is unreachable, the matching selection-specific cached timetable is used; a safe demo timetable is the final fallback.

## Development

```bash
npm test
npm run check
```

No frontend secrets are required. An optional AI endpoint can be configured in **More → AI endpoint**, and it must use HTTPS.

## Architecture

```text
index.html
styles.css
js/
  app.js          application shell and views
  catalog.js      SaiU school/year/source catalog
  remote.js       live source + selection-aware offline cache
  timetable.js    parser + timetable intelligence
  ai.js           local-first assistant + optional gateway
  store.js        persistent student state + XP ledger
  student.js      attendance, exams and study plans
  calendar.js     escaped recurring ICS export
  notifications.js persistent reminder records + browser notifications
  gamification.js unified XP/levels/badges
  navigation.js   view navigation
sw.js             offline shell and runtime cache
```

## License

MIT. See `LICENSE` for the full text.
