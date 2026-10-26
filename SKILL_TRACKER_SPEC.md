# Skill Tracker — Product & Design Specification

> Reference doc for building the mobile app, the admin panel, and future upgrades.
> Derived from the interactive prototype (`Skill Tracker.dc.html`) and its Next.js port (`skill-tracker-next/`).
> Version: 1.0 · Baseline prototype date: Sep 2026.

---

## 1. Product Overview

**Skill Tracker** is a personal learning-habit app. A user picks skills they want to learn, the app gives them **one clear task per day per skill**, they log time, and a **streak + progress system** keeps them consistent.

**Core promise:** _"A little better, every day."_

**Primary persona:** Maya Chen — self-directed learner juggling several skills (React, TypeScript, Spanish…), limited weekly time, motivated by streaks and visible progress toward a concrete goal ("Lead the frontend team by next summer").

**Value loop (the thing to optimize):**
1. Open app → see today's focus task.
2. Do the task → log time (or swipe to complete).
3. Get rewarded (streak bump, progress bars move, toast).
4. Come back tomorrow.

**Monetization:** Freemium. Free tier caps skills and hides AI/advanced features. **Pro** (7-day trial → $7.99/mo or $59.99/yr) unlocks AI roadmaps, unlimited skills, advanced stats, premium templates, smart reminders.

---

## 2. Design System ("Modernist")

Hard-edged, editorial, high-contrast. No rounded corners on UI elements (phone frame is the only radius). Typographic hierarchy does the heavy lifting. One accent color (vermillion red). Source of truth: `_ds/modernist-*/styles.css` + `globals.css` in the Next port.

### 2.1 Color Tokens — Light

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#f3f2f2` | App background / phone screen |
| `--color-surface` | `#eae9e9` | Cards, inputs, secondary blocks |
| `--color-text` | `#201e1d` | Primary text, "ink" fills |
| `--color-accent` | `#ec3013` | Primary action, highlights |
| `--color-accent-2` | `#e15b47` | Secondary accent (reserved) |
| `--color-divider` | `#201e1d` @ 40% | Hairlines, borders |

**Neutral ramp:** `100 #f8f4f4` · `200 #eae7e7` · `300 #d7d3d3` · `400 #bab6b6` · `500 #9b9797` · `600 #7d7979` · `700 #605d5d` · `800 #444141` · `900 #2d2b2b`

**Accent ramp:** `100 #fff2ef` · `200 #ffe0d9` · `300 #ffc4b8` · `400 #ff9783` · `500 #ff563c` · `600 #dd2b0f` · `700 #ae1800` · `800 #7c1405` · `900 #4d170e`

**Accent-2 ramp:** `100 #fff2ef` · `200 #ffe0da` · `300 #ffc4b9` · `400 #ff9784` · `500 #ef6853` · `600 #c94b39` · `700 #9e3526` · `800 #71261b` · `900 #471d16`

> Ramps are generated in OKLCH on one shared lightness scale, so step `N` of any role matches the visual value of step `N` of another.

### 2.2 Color Tokens — Dark (phone surface only)

Dark mode overrides a **subset**; unlisted tokens inherit light values. In the prototype only the phone goes dark (the surrounding sidebar stays light). In production, dark = whole app.

| Token | Dark value |
|---|---|
| `--color-bg` | `#151413` |
| `--color-surface` | `#211f1e` |
| `--color-text` | `#f1eeec` |
| `--color-divider` | `#f1eeec` @ 34% |
| `--color-accent` | `#ff4a2b` |
| `--color-accent-100` | `#3a1812` |
| `--color-accent-200` | `#5a2016` |
| `--color-accent-400` | `#ff9783` |
| `--color-accent-600` | `#ff6a50` |
| `--color-accent-700` | `#ff9d8a` |
| `--color-accent-800` | `#ffc4b8` |
| `--color-accent-900` | `#ffe0d9` |
| `--color-neutral-100` | `#1b1a19` |
| `--color-neutral-200` | `#2a2827` |
| `--color-neutral-300` | `#3a3736` |
| `--color-neutral-400` | `#55514f` |
| `--color-neutral-600` | `#9b9797` |
| `--color-neutral-700` | `#b3afae` |
| `--color-neutral-800` | `#d7d3d3` |
| `--color-neutral-900` | `#000000` |

Theme setting values: **Light / Dark / System**.

### 2.3 Typography

- **Font family:** `Archivo` (weights 400 / 600 / 800), system-ui fallback. Used for both headings and body.
- **Heading weight:** 800. **Body weight:** 400; emphasis 600.
- **Letter-spacing:** tight on large headings (`-0.02em` to `-0.05em`), `0.08em` uppercase on kickers/labels.
- **Base body:** 15px / line-height 1.55.

Type scale seen in UI:
| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero number (streak) | 132px / 88px | 800 | line-height ~0.8 |
| Screen title | 40px | 800 | letter-spacing -0.03em |
| Big stat | 48px / 52px | 800 | progress total, log minutes |
| H-section | 19px | 800 | section headers |
| Card title | 22–26px | 800 | focus card, sheet title |
| Body | 15–17px | 400/600 | |
| Meta / sub | 12–14px | 400/600 | neutral-700 |
| Kicker / label | 11px | 600 | uppercase, 0.08em, neutral-700 |

### 2.4 Spacing / Radius / Shadow

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 px.
- **Radius:** `0px` everywhere (`--radius-sm/md/lg = 0`). Intentionally square. Only the phone frame (44–54px) and streak ring are round.
- **Shadows:** `sm 0 1px 2px / md 0 3px 10px / lg 0 12px 32px` — ink-tinted (`#2d2b2b` @ 14/16/22%). Used on phone frame, toast, bottom sheet.

### 2.5 Iconography

Lucide-style, single `<path>`, 24×24 viewBox, `stroke=currentColor`, `fill=none`, round caps/joins, stroke-width 2–3.5 by context. Icon set in use: `house, layers, calCheck, chart, user, flame, check, plus, chevR, chevL, x, arrow, clock, sparkles, lock, award, wifiOff, search, book, refresh`. (Full path data in `skill-tracker-next/src/components/skill-tracker/data.ts` → `I`.)

### 2.6 Component Patterns

- **Primary button:** accent bg, `--color-bg` text, 48–56px tall, label left + arrow/check icon pushed right (`justify-content:space-between`), hover → `accent-600`, active → `accent-700`.
- **Secondary button:** transparent, 1px divider border, hover tint.
- **Icon button:** 36×36, divider border.
- **Segmented control:** row of buttons sharing 1px dividers; selected = ink bg + bg-colored text. Used for filters, ranges, experience/target levels, theme.
- **Chips / pills:** 36–40px tall, 1px border; selected = ink fill. Used for interests, motives, categories.
- **Checkbox:** square, 2px border; checked = ink fill + bg-colored check icon.
- **Toggle (switch):** 44×24 track, square 20×20 knob, accent when on / neutral-400 off (square, not rounded).
- **Progress bar:** 4–8px track (`neutral-300`), fill ink or accent.
- **Ring (radial):** SVG two-circle (track + accent), `stroke-dasharray` 351.9 (r=56) / 226.2 (r=36), offset = `dash * (1 - pct/100)`.
- **Tag/badge:** 3px×8px padding; `Pro` badge = accent-100 bg + accent-800 text (or solid accent on dark cards).
- **Card (dark CTA block):** `--color-text` bg + `--color-bg` text — used for focus task, upsell blocks, "up next".
- **List row:** left control + flex body (title + meta) + right chevron, 1px divider between.
- **Bottom sheet:** slides from bottom, 3px accent top border, scrim `neutral-900 @ 50%`.
- **Toast:** ink bg, bottom-anchored above tab bar, icon + text + Undo, auto-dismiss 3.2s.

### 2.7 Motion

- Swipe row: `transform .25s ease` on release; `none` while dragging.
- Toast: auto-dismiss timer 3200ms.
- Keep transitions minimal and functional (editorial feel). No bouncy easing.

---

## 3. Information Architecture

### 3.1 Bottom Tab Bar (primary nav) — 5 tabs
`Home (house)` · `Skills (layers)` · `Today (calCheck)` · `Progress (chart)` · `Profile (user)`

Tab is "active" per a screen→tab map so deep screens keep their parent tab lit:
- **Home** ← home, loading, error
- **Skills** ← skills, skill-detail, roadmap, create-skill, empty-skills
- **Today** ← today
- **Progress** ← progress, achievements
- **Profile** ← profile

Tab bar hidden on: onboarding (all), session-logged, paywall.

### 3.2 Full Screen Inventory

Numbered as in the prototype's screen index:

**Onboarding:** 01 Welcome · 02 Interests · 03 Goals · 04 Weekly time · 05 Experience · 06 Motivation · 07 Plan ready
**App:** 08 Home · 09 Today · 10 Log progress (sheet) · 11 Session logged · 12 Skills · 13 Skill detail · 14 Roadmap · 15 Create skill · 16 Progress · 17 Achievements · 18 Profile · 19 Pro paywall
**States:** Loading · Offline / error · Empty skills · Day complete · Skill completed

---

## 4. User Flows

### 4.1 Onboarding (first run)
`Welcome → Interests → Goals → Weekly time → Experience → Motivation → Plan ready → Home`

- **Welcome:** brand, decorative grid, headline, "Get started" / "I already have an account".
- **Interests (step 1/5):** search + multi-select chips. "Pick up to 3 to start." Options: React, TypeScript, UI/UX Design, Python, Spanish, Public Speaking, Photography, Japanese, Data analysis, Guitar, Writing, Figma.
- **Goals (2/5):** multi-select checklist — Build a real project / Get job-ready / Pass an exam or certificate / Hold a conversation / Learn for myself (each has a subtitle).
- **Weekly time (3/5):** single-select cards — 1–2h "Light" / 3–5h "Steady" / 6–10h "Serious" / 10+h "Intensive". Plus **learning-days** toggle (M T W Th F Sa Su) and a computed daily hint ("About X min on each of N days").
- **Experience (4/5):** per selected skill, a 3-way segmented level: New / Some / Solid.
- **Motivation (5/5):** single-select chips — Career move / Current job / A side project / Exam / Curiosity / Staying sharp — plus a one-line free-text "why".
- **Plan ready:** summary stats (skills count, hours/week, min/day), first-milestone list per skill, "First task · today" preview card, "Open my dashboard".

Progress shown as a 5-segment bar + "N/5"; back chevron steps backward.

### 4.2 Daily loop (core)
`Home → (Today's focus) → Log session (sheet) → Session logged → back to Home/Today`

- Home shows **Today's focus** (first incomplete task) with "Log this session" + "Done".
- "Log this session" opens the **Log sheet** pre-filled with the task's minutes.
- Completing/logging bumps **streak** (once per day — `counted` flag), updates daily goal + milestone progress, fires a **toast with Undo**.
- When all tasks done → Home shows "All done" block; Today shows a completion ring + "Done for today."

### 4.3 Logging time (the sheet)
Opened from: focus card, a task tap, quick "+15/30/45/60m", or skill-detail CTA.
- Stepper (−/+ by 5, min 5) + quick chips (10/15/25/45/60m).
- Optional "Mark task complete" checkbox (when tied to a task).
- Optional note field.
- "Save · N min" → routes to **Session logged** screen.

**Session logged:** giant streak number, week dots, per-item summary (skill +min, milestone X/5, daily goal N/45), "Up next" card, "Back to home".

### 4.4 Today interactions
- **Swipe right** a task past ~110px → completes it (reveals accent "Complete / Release to complete" track underneath).
- **Tap** a task → opens log sheet.
- **Tap checkbox** → toggle complete/uncomplete directly.
- Quick "Log extra time" (+15/30/45/60m) and a **Quick reflection** (Hard / Steady / It clicked + free text).

### 4.5 Skills management
`Skills (filter: Active/Completed/Planned) → Skill detail → Roadmap`
- Skill detail: ring %, current→target, streak, hours logged, milestone timeline, resources, notes, activity log, sticky CTA ("Log progress" or "Set a new target" if complete).
- Roadmap: 5 stages (Beginner→Mastery), expandable, each with milestone checklist; "Rebuild with AI" (Pro).

### 4.6 Create skill
`Skills (+) → Create skill → back to Skills (toast)`
Fields: name, category chips (Development/Design/Language/Career/Creative/+Custom[Pro]), current experience (None/Beginner/Some/Solid), target level (Basics/Intermediate/Advanced/Mastery), target date, weekly commitment stepper (hrs), milestone list (add/remove), "Generate roadmap with AI" (Pro). "Create skill" CTA.

### 4.7 Progress & achievements
`Progress (Week/Month) → Achievements`
- Progress: total learning time + delta, bar chart (week=7 bars / month=29), stat grid (streak, longest, milestones, completion rate, skills improved, avg session), per-skill improvement bars, 18-week heatmap (5-level accent scale), Achievements entry, blurred "Detailed insights" (Pro upsell).
- Achievements: 10 badges, earned vs locked (locked show progress bar). Hero = latest earned.

### 4.8 Paywall
Reachable from many Pro touchpoints. Feature list, plan selector (Yearly default / Monthly), "Start 7-day free trial", dynamic billing note. Close → returns to previous screen.

### 4.9 Edge states
- **Loading:** skeleton of the home layout + "Loading today's plan…".
- **Offline/error:** offline banner, "Sync failed" block ("25 min saved locally, streak safe, retry"), "Try again" / "Details", note that today's tasks/notes/timers work offline.
- **Empty skills:** "No skills yet" + add CTA + templates.
- **Skill completed:** completed banner on skill detail + "Set a new target" CTA.

---

## 5. Data Model

Entities inferred from the prototype. Types are a starting point for the backend schema.

### 5.1 User
```
id, name, email, avatarInitials, joinedAt, plan ('free'|'pro'),
settings: { dailyGoalMins, learningDays[], goalStatement, theme ('light'|'dark'|'system'),
            notifications: { dailyReminder:bool, reminderTime, streakAtRisk:bool, weeklySummary:bool, smartReminders:bool(Pro) } }
```

### 5.2 Skill
```
id, userId, name, mono (2-char monogram, e.g. "Re"), category,
level (current), target, pct (0–100 to target), streakDays, hoursLogged,
nextMilestoneLabel, status ('active'|'completed'|'planned'),
since (human string / startDate), note (freeform),
milestones: Milestone[], resources: Resource[], activity: Session[]
```
Example categories: Development, Design, Language, Career, Creative, (Custom = Pro).
Target levels: Basics / Intermediate / Advanced / Mastery (or domain-specific like B1→B2, N5).

### 5.3 Milestone
```
id, skillId, title, order, status ('completed'|'in_progress'|'upcoming'),
tasksDone, tasksTotal (e.g. 3/5)
```
Milestones group into **Roadmap stages**.

### 5.4 Roadmap / Stage
```
Stage: { id, skillId, name (Beginner|Fundamentals|Intermediate|Advanced|Mastery),
         short, order, status ('done'|'current'|'next'), milestones: Milestone[] }
```
A skill's roadmap = ordered list of stages. AI-generated roadmaps = Pro.

### 5.5 Task (daily)
```
id, userId, skillId, title, estMins, priority ('High'|'Medium'|'Low'),
context (e.g. "Milestone 4 of 7 · Custom hooks"), date, done:bool, loggedMins
```
Daily plan = set of tasks for the day (prototype: 4 tasks across React/Spanish/TypeScript).

### 5.6 Session / Log
```
id, userId, skillId, taskId?, mins, note?, loggedAt, source ('task'|'extra'|'quick')
```
Drives: streak, daily goal, weekly chart, heatmap, activity list.

### 5.7 Streak
```
current, longest, countedToday:bool, weekDots[7] (done/active/empty)
```
Rule: first logged activity of a day increments streak; undo/uncomplete-last reverts it.

### 5.8 Achievement
```
id, mark (badge glyph e.g. "7","30","100h","✓"), name, description,
earned:bool, earnedAt?, progress (0–1 when locked)
```
Prototype set (10): First milestone, 7-day streak, 30-day streak, 10 hours, Skill completed, Five skills tracked, 100 hours, 250 hours, 50 milestones, Three skills completed.

### 5.9 Resource
```
id, skillId, title, kind ('Docs'|'Course'|'Video'|'Book'|'Article'|'Practice'|'Cards'|'Live'|'Guide')
```

### 5.10 Template (for skill creation)
```
id, name, meta (milestones · duration), isPro:bool, roadmapSeed
```
Prototype templates: Frontend fundamentals, Conversational Spanish, Public speaking basics, Product design career path (Pro).

### 5.11 Subscription
```
plan ('free'|'pro'), interval ('monthly'|'annual'),
trialEndsAt, priceMonthly ($7.99), priceAnnual ($59.99), status
```

### 5.12 Reflection
```
id, userId, date, mood ('Hard'|'Steady'|'It clicked'), text?
```

---

## 6. Feature Matrix — Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Skills tracked | capped (prototype hints 6 limit) | Unlimited |
| Custom categories | — | ✓ |
| Daily tasks, logging, streaks | ✓ | ✓ |
| Manual milestones/roadmap | ✓ | ✓ |
| AI roadmap generation | — | ✓ |
| AI milestone generation | — | ✓ |
| Roadmap "Rebuild with AI" | — | ✓ |
| Advanced statistics (retention, best times, trends) | — | ✓ |
| Detailed insights (where you're slipping) | — | ✓ |
| Premium templates (40+) | — | ✓ |
| Smart reminders | — | ✓ |
| Basic stats, heatmap, achievements | ✓ | ✓ |

Trial: 7 days free, then chosen plan. Cancel in Settings.

---

## 7. Mobile App Build Notes

- **Native mapping:** phone frame is prototype chrome only — drop it; build real screens. Status bar + home indicator are OS-native.
- **Navigation:** 5-tab bottom nav + stack per tab. Modals: log sheet (bottom sheet), paywall (full-screen modal), onboarding (separate stack).
- **Gestures:** swipe-to-complete on task rows (pan + threshold ~110px, snap back on release). Pull-to-refresh on Home/Today.
- **Offline-first:** log sessions, notes, timers must work offline; queue + sync; never lose streak on failed sync (see Offline state). Local store = source of truth, server reconciles.
- **Notifications:** daily reminder (user time), streak-at-risk, weekly summary; smart reminders (Pro) = ML on best learning times.
- **Theming:** Light/Dark/System. Use the token sets above; dark applies app-wide.
- **Analytics events:** onboarding_step, task_complete, session_log, streak_bump, streak_break, paywall_view, trial_start, skill_create, reflection_submit.
- **Accessibility:** hit targets ≥44px (most controls already are), focus-visible outlines (2px accent), respect reduced-motion (disable swipe animation).

---

## 8. Admin Panel — Requirements

The admin panel manages content, users, and monetization. Suggested sections:

### 8.1 Dashboard
KPIs: DAU/WAU/MAU, new signups, trial starts, trial→paid conversion, churn, avg streak length, avg sessions/user, retention cohorts.

### 8.2 Users
- Search/list users (plan, join date, streak, last active).
- User detail: skills, sessions, streak history, subscription, device/OS, support notes.
- Actions: grant/revoke Pro, reset streak (support), export user data (GDPR), delete account.

### 8.3 Content / Templates
- CRUD **learning templates** (name, category, milestones, duration, Pro flag, roadmap seed).
- CRUD **roadmap stage libraries** per skill/category (the Beginner→Mastery ladders).
- CRUD **resources** library (title, kind, link, associated skills).
- CRUD **achievements** (badge, name, description, unlock rule/threshold).
- Curated **skill catalog** (the interest list) + category taxonomy.

### 8.4 AI Configuration (Pro features)
- Prompt/version management for AI roadmap + milestone generation.
- Guardrails (max milestones, pacing rules tied to weekly commitment & target date).
- Review queue for generated roadmaps (quality sampling).
- Cost/usage monitoring per model.

### 8.5 Monetization
- Plans & pricing (monthly/annual, trial length), promo codes, regional pricing.
- Subscription events feed (started, renewed, canceled, refunded).
- Paywall experiment config (A/B copy, feature ordering, plan default).

### 8.6 Notifications / Messaging
- Push campaign composer + scheduling, segments (by streak, plan, inactivity).
- Reminder templates (daily, streak-at-risk, weekly summary).

### 8.7 Analytics / Insights
- Funnel: install → onboarding complete → first session → day-2 return → trial → paid.
- Feature usage (which screens, swipe vs tap logging, reflection rate).
- Content performance (which templates/skills drive retention).

### 8.8 Admin roles & audit
Roles: Super-admin, Content editor, Support, Analyst. Audit log of all admin actions.

---

## 9. Suggested API Surface

REST-ish outline (adjust to your stack). Auth = bearer token; all user routes scoped to the authenticated user.

**Auth & user**
```
POST /auth/signup · POST /auth/login · POST /auth/refresh
GET/PATCH /me · GET/PATCH /me/settings · DELETE /me
```
**Onboarding**
```
POST /onboarding   // interests[], goals[], weekly, days[], levels{}, motive, why
```
**Skills & roadmap**
```
GET /skills?status= · POST /skills · GET /skills/:id · PATCH /skills/:id · DELETE /skills/:id
GET /skills/:id/roadmap · POST /skills/:id/roadmap/generate (Pro) · PATCH /skills/:id/roadmap
POST /skills/:id/milestones · PATCH /milestones/:id
GET /skills/:id/resources · POST /skills/:id/resources
PATCH /skills/:id/note
```
**Daily plan & logging**
```
GET /today            // today's tasks + focus
POST /tasks/:id/complete · POST /tasks/:id/uncomplete
POST /sessions        // { skillId, taskId?, mins, note?, source }  -> returns updated streak/goal
POST /reflections
```
**Progress**
```
GET /progress?range=week|month  // totals, bars, stats, bySkill, heatmap
GET /streak
GET /achievements
```
**Templates & catalog**
```
GET /templates · GET /catalog/skills · GET /catalog/categories
```
**Billing**
```
GET /subscription · POST /subscription/trial · POST /subscription/checkout · POST /subscription/cancel
```
**Admin** (role-gated, separate prefix e.g. `/admin/*`): users, templates, roadmap-libraries, resources, achievements, ai-config, plans, campaigns, analytics.

---

## 10. Upgrade / Feature Backlog (ideas)

Near-term:
- Real AI roadmap + milestone generation (wire the Pro CTAs).
- Timer mode (live session timer, not just manual minutes).
- Resource deep-links / in-app reader, mark resource as used.
- Richer reflection history + weekly review.
- Push notifications end-to-end.

Mid-term:
- Smart reminders (best-time ML), retention forecasts, "where you're slipping" insights.
- Social / accountability (share streak, learning buddies, cohorts).
- Calendar integration (block learning time, sync learning days).
- Multi-device sync + web app.

Longer-term:
- Skill marketplace / community templates.
- Spaced-repetition for language/knowledge skills.
- Team/organization accounts (manager dashboards) — ties into admin.
- Wearable / widget (today's task on home screen & watch).

---

## 11. Reference — Prototype Source Map

| Concern | Location |
|---|---|
| Original interactive prototype | `Skill Tracker.dc.html` |
| Design tokens (CSS) | `_ds/modernist-*/styles.css`, `skill-tracker-next/src/app/globals.css` |
| Next.js port (all screens) | `skill-tracker-next/src/components/skill-tracker/SkillTracker.tsx` |
| Data + icons + seed content | `skill-tracker-next/src/components/skill-tracker/data.ts` |
| Inline-style → React helper | `skill-tracker-next/src/lib/css.ts` |

Seed data worth reusing (in `data.ts`): `TASKS` (daily), `SK` (9 skills with milestones/resources/notes/activity), `ROAD` (React 5-stage roadmap), achievement list, templates, pro features, plans.

---

_End of spec. Keep this doc updated as features ship — it is the contract between mobile, backend, and admin._
