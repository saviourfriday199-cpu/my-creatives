# LearningOS

A **Learning Operating System** that turns university curricula into a living
knowledge graph so lecturers create less by hand and students reach mastery
faster. This repository is being built in phases; **this release is Phase 2B —
the Platform Foundation** (identity, roles, and the university/department
backbone). Courses, concepts, and the knowledge graph come in later phases.

Every feature must strengthen at least one of: the knowledge graph, lecturer
content creation, student mastery, or adaptive learning. The foundation here
exists so all four inherit multi-tenant boundaries and role-based access without
a later rewrite.

## What's in this phase

- **Authentication** — email/password with bcrypt hashing and server-side
  sessions (opaque tokens; only the SHA-256 hash is stored).
- **Authorization** — a four-tier role hierarchy and university-scoped tenancy
  guards, enforced in API routes and server components.
- **User roles** — `student` · `lecturer` · `admin` · `super_admin`.
- **Universities & Departments** — the organizational backbone, with
  role-guarded management APIs and an admin UI.
- **Backend foundation** — Drizzle ORM, typed service layer, validated route
  handlers with consistent error mapping.
- **Frontend foundation** — landing page, sign-in / sign-up, session-aware
  dashboard, admin console, and edge middleware for route protection.
- **Database migrations**, a **seed** script, and a **Vitest** suite.

## Quick start

```bash
npm install
cp .env.example .env            # adjust as needed
npm run db:migrate              # create the SQLite schema
npm run db:seed                 # create a super-admin + demo university/department
npm run dev                     # http://localhost:3000
```

The seed prints the super-admin email and password (set `SEED_ADMIN_PASSWORD`
to choose your own; otherwise one is generated and shown once).

## Scripts

| Script             | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Next.js dev server                               |
| `npm run build`    | Production build                                 |
| `npm run test`     | Vitest suite (auth, sessions, authz, org)        |
| `npm run lint`     | ESLint                                           |
| `npm run db:generate` | Generate a new SQL migration from the schema  |
| `npm run db:migrate`  | Apply pending migrations                       |
| `npm run db:seed`     | Seed super-admin + demo data                   |

## API (Phase 2B)

| Method | Route                                   | Access            |
| ------ | --------------------------------------- | ----------------- |
| POST   | `/api/auth/register`                    | public (→ student)|
| POST   | `/api/auth/login`                       | public            |
| POST   | `/api/auth/logout`                      | authenticated     |
| GET    | `/api/auth/me`                          | public (nullable) |
| GET    | `/api/universities`                     | authenticated     |
| POST   | `/api/universities`                     | super_admin       |
| GET    | `/api/universities/:id/departments`     | authenticated     |
| POST   | `/api/universities/:id/departments`     | admin (own scope) |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the data model, auth
design, and the path to Postgres in production.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Drizzle ORM ·
better-sqlite3 (dev/test) → Postgres (prod) · bcrypt · Zod · Tailwind v4 ·
Vitest.
