# Threadline

A multi-course learning platform where **every topic knows what it's built on.**

Course videos from a YouTube channel are broken into small **micro-topics** (one
teachable idea each, 3–6 min), wired into a **prerequisite dependency graph**.
That graph drives two things:

1. **Unlocking** — a lesson only opens once its hard prerequisites are mastered.
2. **Graph-weighted spaced repetition** — an SM-2 scheduler decides when to
   review, boosted by how much of the tree depends on a topic. Forgetting a
   load-bearing topic brings it back sooner.

The data model is adapted from the open-source
[`os-taxonomy`](https://github.com/withmarbleapp/os-taxonomy) pattern (K-12
micro-topics with prerequisite edges), applied here to college courses.

## Quick start

```bash
npm install
npm run validate   # check the datasets (schema, orphans, DAG, course_id)
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

## Data model (`data/`)

The platform is **multi-course from day one**. A shared `data/courses.json`
indexes every course; each course has its own dataset directory:

```
data/
  courses.json                 # catalog index (id, code, institution, level…)
  <course-id>/
    topics.json                # micro-topics
    dependencies.json          # directed prerequisite edges (from → to)
```

- **Topic** — `id`, `title`, `description`, `type`
  (`conceptual | procedural | representational | language | meta`), `module`,
  `week`, `mastery_criteria`, `video_id` (YouTube id or `PLACEHOLDER`),
  `video_duration_seconds`.
- **Dependency** — `from`, `to`, `strength` (`hard` blocks unlocking, `soft`
  is advisory), `reason`.

JSON Schemas live in `schema/`. `scripts/validate.mjs` (zero dependencies)
enforces, for every course:

- files parse and match their schema,
- **no orphaned** topic references in `dependencies.json`,
- **no circular dependencies** — the graph must be a valid DAG,
- every topic's `course_id` matches a course in `courses.json`,
- topic ids are unique and `topic_count` is accurate.

Three seed courses ship as realistic proof the pattern generalises:
**BIO 301** Cellular Respiration (16 topics), **CHM 210** Reaction Kinetics
(15), **MTH 204** Linear Systems (16).

> Videos are wired as `PLACEHOLDER` until real YouTube ids are dropped in — the
> lesson page embeds the player automatically once an id is present.

## The graph & scheduling logic (`lib/`)

This is the core IP and is kept pure and isomorphic so the same code runs on the
server and in the browser.

- `lib/graph.ts` — `TopicGraph`: prerequisites, dependents, `isUnlocked`
  (all hard prereqs mastered), soft warnings, and **downstream dependent
  count** (transitive out-reach) used as the review-priority weight.
- `lib/sr.ts` — **SM-2** scheduling. The 1–4 self-assessment maps to SM-2's
  0–5 quality; intervals grow on success (1, 6, then ×EF) and reset on a lapse.
  `reviewPriority = (overdueDays + 1) × (1 + weight × 1.5)`.
- `lib/progress.tsx` — per-user state in `localStorage` (cards + review days
  for streaks), shaped like the eventual `user_review_state` table so swapping
  in server persistence + auth is a small change.

## App (Next.js 15 · React 19 · Tailwind v4)

| Route | What it is |
| --- | --- |
| `/` | Landing hero — the live prerequisite-graph animation ported from `design/hero.html`, plus the 3-pillar section |
| `/courses` | Course catalog with search + subject filter and per-course progress |
| `/courses/[id]` | Topic map grouped by module/week with lock states |
| `/courses/[id]/[topicId]` | Video lesson: embed, mastery criteria, prerequisite links, 1–4 self-assessment |
| `/review` | Review queue — what's due, ranked by overdue × graph weight, with quick-rate |
| `/dashboard` | Per-course completion, due counts, streak |

The design system (colors, Space Grotesk / Inter / JetBrains Mono type) is
ported verbatim from `design/hero.html` into Tailwind tokens in
`app/globals.css`. Everything respects `prefers-reduced-motion`.

## Build order / status

Phases 1–5 and 7 of the brief are implemented: data layer, catalog + topic map,
lesson page, SM-2 + graph-weighted review queue, dashboard, and
locking/responsive polish. **Phase 6 (real auth + server persistence)** is
stubbed by the `localStorage` store — the "Sign in" affordance is present and
the data shape is auth-ready.
