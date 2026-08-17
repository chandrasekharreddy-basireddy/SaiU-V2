# SaiU V2 — Release Candidate 1

Release line: `v2.2.0-rc.1`

This branch is a release-candidate freeze point. **Deployment is intentionally out of scope.**

## Release gates

- [ ] Core automated tests pass on the exact release commit.
- [ ] Recursive JavaScript/module syntax validation passes.
- [ ] Required PWA assets and manifest validate.
- [ ] Local HTML references resolve.
- [ ] CSP, inline-handler, `javascript:` URL, and secret-pattern checks pass.
- [ ] Live published timetable source is reachable and valid.
- [ ] Every catalog year returns real timetable rows.
- [ ] Every declared section returns section-specific real timetable rows.
- [ ] Timetable statistics are non-empty and internally consistent.
- [ ] Desktop Playwright E2E passes.
- [ ] Mobile Playwright E2E passes.
- [ ] Offline shell/service-worker checks pass.
- [ ] Academic planner/attendance/exam flows pass.
- [ ] Social schedule/common-free-time flows pass.
- [ ] Gamification state and XP de-duplication pass.
- [ ] Performance and accessibility smoke checks pass.
- [ ] Production artifact is generated successfully and checksum recorded.
- [ ] No deployment workflow is executed for this release-candidate pass.

## Required evidence

Record the final commit SHA and successful GitHub Actions run IDs for core CI, live-data, E2E, and production validation before declaring the candidate ready.

## Release policy

A red or cancelled required gate blocks the candidate. Fix the cause, rerun the affected gate, and only continue when the latest run for the exact release commit is green.

Historical failed runs are retained by GitHub and are not rewritten or hidden; release status is determined from the latest required runs for the candidate commit.
