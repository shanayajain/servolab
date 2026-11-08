# Servolab — Robotics Learning App

A mobile-first Progressive Web App for learning robotics: short interactive lessons, a learning path, XP, streaks, spaced-repetition review, a circuit lab, robotics simulations and hands-on projects. Everything runs in your browser — **no backend, no accounts, no API keys** — and it works offline after the first visit.

- 6 tracks · 27 units · 121 lessons · 542 questions (15 question types)
- 10 interactive simulations (PWM, DC motor, ultrasonic, encoder, PID, differential drive, line following, wall following, coordinate frames, odometry)
- Circuit lab with 10 wiring challenges (battery, resistor, LED, switch, motor, motor driver, MCU, servo, ultrasonic, IR)
- 10 projects, 24 achievements, daily challenge, levels and streaks
- Progress saved on your device (IndexedDB + a local backup copy), with Export/Import

---

## Deploy to GitHub Pages (about 5 minutes, no coding)

1. **Create a GitHub repository.** On github.com click **+ → New repository**, give it a name (for example `servolab`), choose **Public**, and click **Create repository**.
2. **Upload the project.** On the new repository page click **uploading an existing file** (or **Add file → Upload files**). Unzip the ZIP on your computer, open the `servolab` folder, select **everything inside it** (including the hidden `.github` folder — on a Mac press `Cmd + Shift + .` in Finder to show it) and drag it into the browser. Click **Commit changes**.
   - If the `.github` folder did not upload, create it by hand: **Add file → Create new file**, type the name `.github/workflows/deploy.yml`, paste the contents of that file from the ZIP, and commit.
3. **Enable GitHub Pages.** In the repository go to **Settings → Pages**.
4. **Choose GitHub Actions.** Under **Build and deployment → Source**, select **GitHub Actions**. That's all — the included workflow builds and publishes the app automatically.
5. **Open the Pages URL.** Go to the **Actions** tab and wait for the green check on “Deploy to GitHub Pages” (1–2 minutes; if it ran before you picked GitHub Actions, click it and choose **Re-run all jobs**). Your app is at:

   ```
   https://YOUR-USERNAME.github.io/REPOSITORY-NAME/
   ```
   (The link is also shown under **Settings → Pages**.)
6. **Open it in Safari** on your iPhone.
7. **Add to Home Screen.** Tap the **Share** button → **Add to Home Screen** → **Add**. Launch Servolab from the new icon — it opens full-screen like a native app and works offline.

The workflow detects your repository name automatically, so you never need to edit any code. Pushing changes to `main` redeploys automatically.

---

## How your progress is saved

- Every change (answers, lessons, XP, streak, settings…) is saved instantly to **IndexedDB**, with a second copy in **localStorage** and a periodic “last known good” backup. On launch the app loads the newest valid copy — it never starts over if saved data exists.
- Saved data is versioned (schema v1) with migrations, and every field is validated on load, so a damaged field is repaired instead of wiping your profile.
- **iPhone note:** Safari and the Home Screen app keep **separate** storage. Pick one (the Home Screen app is recommended) and use it consistently. To move progress between them, use Export → Import.

### Backup / restore

**Profile → ⚙ Settings → Backup & restore**

- **Export Progress** — saves a `servolab-progress-YYYY-MM-DD.json` file (on iPhone the Share sheet opens: choose **Save to Files**).
- **Import Progress** — pick a backup file; you'll see what it contains and must confirm before it replaces your current progress.
- **Copy backup / Paste backup** — the same thing as text, handy for Notes.

---

## Run locally (optional, for developers)

Requires Node.js 20+.

```bash
npm install
npm run dev        # development server
npm run validate   # checks every lesson, question, prerequisite, project and circuit
npm test           # unit tests (logic, persistence, content, circuit engine)
npm run build      # validate + type-check + production build into dist/
npm run preview    # serve the production build
```

`BASE_PATH` controls the asset base (the GitHub workflow sets it to `/<repo>/`; without it the build uses relative paths and works from any folder). Routing uses `#/` hash URLs, so deep links and refreshes always work on GitHub Pages; `public/404.html` redirects any stray path back into the app.

## Project structure

```
src/
  components/      UI primitives, app shell, illustrations (robot, badges)
  pages/           Learn, Lesson, Session, Practice, Lab, Projects, Progress, Profile, Settings
  features/
    learning/      learning-path builder (locks, current node, reviews, challenges, milestones)
    lessons/       data-driven lesson engine, 15 question renderers, diagrams, completion screen
    practice/      spaced repetition (NEW → LEARNING → REVIEW → MASTERED) and session builder
    gamification/  levels, achievements, celebration toasts
    progress/      SVG charts
    simulation/    circuit engine + board, component symbols, 10 robotics simulations
  data/
    curriculum/    tracks and units
    lessons/       lesson content per track
    projects/      project guides
    circuits.ts    circuit lab challenges
    validate.ts    content validator
  store/           Zustand stores + pure progress logic
  lib/             types, answer checking, persistence (IndexedDB/localStorage), PWA
scripts/validate-content.ts
tests/             Vitest unit tests
```

Adding content: append a lesson object in `src/data/lessons/<track>.ts`, list its id in a unit in `src/data/curriculum/tracks.ts`, then run `npm run validate`.

## Privacy

No analytics, no trackers, no network requests after load. All data stays on your device.
