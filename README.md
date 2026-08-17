# SaiU V2

A next-generation, offline-first university life operating system inspired by the original [SaiU Timetable](https://github.com/y-bow/SaiU-Timetable).

## What is included

- Live current/next class intelligence
- Weekly timetable views
- Free-time and conflict detection
- CSV timetable ingestion engine
- Offline-first PWA shell
- Light/dark/system themes
- Local planner and XP gamification
- Local-first Ask SaiU AI with optional HTTPS gateway
- `.ics` calendar export
- Browser notification primitives
- Schedule sharing and comparison primitives
- Local attendance/exam planning primitives
- GitHub Actions tests and syntax validation

## Run locally

Because this is an ES-module PWA, serve the repository over HTTP rather than opening `index.html` directly.

```sh
npx serve .
```

Then open the URL printed by the server.

For automated checks:

```sh
npm test
npm run check
```

## Real timetable data

The V2 engine exposes `loadCsv(url)` in `js/timetable.js`. Connect it to the university's published CSV endpoint after migrating the original school's/year/section mapping rules. The initial build deliberately uses sample data so the app remains runnable without a live external dependency.

## AI

The browser assistant works without a backend. To connect a production AI gateway, set the `saiu_ai_endpoint` value from **More → AI endpoint**. The endpoint should be an HTTPS server you control. Do not put model-provider API keys in this repository or browser storage.

## Six-phase roadmap

1. Foundation and architecture
2. World-class timetable intelligence
3. SaiU AI copilot
4. Student OS (planner, academics, notifications, calendar)
5. Social + gamification
6. Production quality, security and CI

See [`docs/AUDIT.md`](docs/AUDIT.md) for the source audit and migration notes.

## License

MIT-compatible application code. Verify third-party asset/data licenses before importing additional content from the original project.
