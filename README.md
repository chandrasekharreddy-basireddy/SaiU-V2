# SaiU V2 — Student Operating System

SaiU V2 is an offline-first university companion built from the audit of the original SaiU Timetable PWA. It keeps the fast timetable experience while adding a live Google Sheets source, student planning, local timetable intelligence, calendar export, notifications, sharing, gamification, and production CI/CD.

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
- Offline timetable cache

### Phase 3 — SaiU AI
- Local timetable assistant
- Next-class, daily, tomorrow, free-time and conflict questions
- Room/faculty/course lookup
- Longest-free-slot queries
- Optional HTTPS AI gateway
- Provider secrets remain server-side

### Phase 4 — Student OS
- Planner/tasks
- XP and progress
- Notifications
- Calendar
- Persistent preferences

### Phase 5 — Social + gamification
- Schedule sharing through Web Share/clipboard
- Common-free-time engine
- Levels and badges
- Foundation for friend schedule comparison

### Phase 6 — Production
- Automated Node tests
- Syntax validation
- PWA validation
- GitHub Pages deployment
- Deployment concurrency control
- Security policy
- Versioned offline cache

## Live timetable source

The V2 loader reads the published Sai University Google Sheet as CSV using the configured sheet ID in `js/catalog.js`. The app never requires a Google account in the browser. If the source is unreachable, the last matching cached timetable is used; a safe demo timetable is the final fallback.

## Development

```bash
npm test       # run the automated test suite
npm run check  # run full source validation (syntax, imports, CSP, secrets)
```

No frontend secrets are required. An optional AI endpoint can be configured in **More → AI endpoint**, and it must use HTTPS.

### Contributing

1. Fork the repository and create a feature branch.
2. Run `npm test` and `npm run check` before submitting a PR.
3. Ensure no inline styles, inline event handlers, or `javascript:` URLs are added.
4. Do not commit secrets, API keys, or private keys.

## Architecture

```text
index.html
styles.css
js/
  app.js            application shell and views
  bootstrap.js      service worker + student-os init
  catalog.js        SaiU school/year/source catalog
  remote.js         live source + offline cache
  timetable.js      parser + timetable intelligence
  timetable-safe.js hardened input adapter (wraps timetable.js)
  ai.js             local-first assistant + optional gateway
  store.js          persistent student state
  student.js        attendance, exams, study planner
  student-os.js     Student OS dashboard (academics + collaboration)
  social.js         schedule sharing + common-free-time
  calendar.js       ICS export
  notifications.js  PWA notifications
  gamification.js   XP/levels/badges
  navigation.js     view navigation
sw.js               offline shell and runtime cache
```

## License

MIT.
