# LearningOS Architecture — Phase 2B → 3.2

This document describes the foundation and the knowledge-graph core that later
phases build on. Phase 2B is the identity/roles/organization backbone; Phase 3.1
adds courses, concepts, and the prerequisite graph. The design goal throughout:
each module inherits tenancy and RBAC for free.

## Product frame

LearningOS is a Learning Operating System, not merely an LMS. Its mission is to
turn university curricula into a living knowledge graph for mastery. Four pillars
gate scope — every feature must strengthen at least one:

1. The knowledge graph
2. Lecturer content creation
3. Student mastery
4. Adaptive learning

Phase 2B contributes to all four indirectly by establishing the multi-tenant,
role-aware substrate they require.

## Layers

```
app/ (routes)      →  route handlers (HTTP) + server components (pages)
lib/http           →  request parsing, error → response mapping
lib/validators     →  Zod schemas (the trust boundary for input)
lib/auth           →  password, sessions, current-user, authorization
lib/org            →  university/department service layer
db/                →  Drizzle schema, client, migrations, seed
```

Rules of the layering:

- **Route handlers never touch the database directly** — they validate input,
  check authorization, then call a service.
- **Services are the only writers.** They own uniqueness/consistency checks and
  throw typed domain errors (`AuthError`, `AuthzError`, `OrgError`).
- **`lib/http.route()` wraps every handler** so `ZodError` → 422, domain errors →
  their status, and anything else → a logged 500. Responses are consistent JSON.

## Data model

Four tables (`src/db/schema.ts`):

- **universities** — tenants. `slug` unique.
- **departments** — belong to a university; `code` unique **within** a
  university (`@@unique(universityId, code)`), cascade-deleted with it.
- **users** — `email` unique (stored lower-cased), `passwordHash`, `role`, and
  nullable `universityId` / `departmentId` for tenancy (a `super_admin` has
  none). FK `onDelete: set null` so removing an org doesn't delete people.
- **sessions** — server-side sessions, cascade-deleted with the user.

Every table carries `createdAt`/`updatedAt`. IDs are UUIDv4 strings (portable
across SQLite and Postgres). Column types are deliberately portable so the same
schema targets Postgres in production.

### Why this shape is forward-compatible

Future tables — `courses`, `concepts`, `concept_edges` (the prerequisite graph),
`content`, `quizzes`, `mastery`, analytics rollups — will reference
`departments`/`universities` for tenancy and `users` for authorship and
progress. Because scoping and roles already exist, those modules add tables
without reworking access control. Exam-readiness and analytics are anticipated
as per-concept/per-user aggregates hanging off that graph; nothing here blocks
them.

## Authentication

- Passwords hashed with **bcrypt** (cost 12). A dummy compare runs on unknown
  emails to blunt user-enumeration timing.
- Sessions are **opaque random tokens** (32 bytes, base64url) delivered in an
  **httpOnly, SameSite=Lax, Secure-in-prod** cookie. The database stores only
  the token's **SHA-256 hash**, so a DB leak cannot be replayed as a live
  session. Sessions expire after 30 days; `getUserByToken` filters on expiry.
- `getCurrentUser()` resolves the cookie in server components and route
  handlers. Login/registration issue a session and set the cookie; logout
  deletes the row and clears the cookie.

## Authorization

- **Role hierarchy** (`lib/auth/authz.ts`): `student < lecturer < admin <
  super_admin`. `hasAtLeast(role, min)` and `requireRole(min)` enforce it.
- **Tenancy**: `assertUniversityScope(user, universityId)` lets a `super_admin`
  act anywhere but restricts everyone else to their own university. Creating a
  university is `super_admin`-only; creating a department requires `admin` **and**
  scope over the target university.
- The pure predicates (`hasAtLeast`, `assertUniversityScope`) live in a
  dependency-free module so they are unit-testable and reusable at the edge.

### Edge middleware

`src/middleware.ts` is a cheap gate: it redirects unauthenticated visitors away
from `/dashboard` and `/admin` by checking for the session cookie's *presence*.
It does **not** validate the session (no database at the edge, and better-sqlite3
cannot run there) — real authentication and authorization always happen in the
server components and route handlers.

## Persistence & the road to Postgres

Dev/test use **better-sqlite3** for zero-setup, fast, synchronous access.
Everything the app touches goes through the single `db` export in
`src/db/index.ts`, and the schema uses only portable column types. Moving to
Postgres in production is therefore localized:

1. Point `DATABASE_URL` at Postgres.
2. Swap the driver in `src/db/index.ts` to `drizzle-orm/node-postgres` (or
   `postgres-js`) and change `drizzle.config.ts` `dialect` to `postgresql`.
3. Regenerate migrations for the Postgres dialect.

No service, route, or component changes are required.

## Testing

Vitest runs the service/logic layer against a real migrated SQLite file
(`tests/setup.ts` migrates once and truncates between tests). The `server-only`
guard is stubbed for Node. Coverage: password hashing, session lifecycle
(including expiry and hash-only storage), the role hierarchy and tenancy guards,
registration/login (including duplicate-email and bad-credential paths), and
university/department CRUD with uniqueness and scoping. HTTP flows were also
verified end-to-end against a running server.

## Phase 3.1 — Knowledge Graph core

Adds the product's core IP on top of the foundation. Three tables:

- **courses** — belong to a department; `code` unique within a department;
  cascade-deleted with it; carry a publish `status` and an author (`createdById`).
- **concepts** — micro-topics within a course (cascade-deleted with it). Beyond
  title/description they carry **`difficulty` (1–5)**, **`bloomLevel`** (Bloom's
  taxonomy), and **`learningObjective`** — the exact fields the future AI Content
  Engine will draft and lecturers will review, present now so nothing is retro-
  fitted.
- **concept_edges** — directed prerequisite links (`from` must precede `to`),
  `strength` `hard` (blocks unlocking) or `soft` (advisory), with a `reason`.
  `courseId` is denormalised onto the edge for scoping and fast course-local
  queries; the ordered pair is unique.

### The graph is the core, and it stays a DAG

`lib/graph/graph.ts` is pure and isomorphic — `ConceptGraph` exposes
prerequisites, dependents, `isUnlocked(mastered)` (hard prereqs only), and
`downstreamCount` (transitive reach, the weight that will boost review priority
later). `wouldCreateCycle` runs in the edge service **before every insert**, so
the prerequisite graph is guaranteed acyclic. The edge service also rejects
self-edges, cross-course/orphan endpoints, and duplicates.

### Scoping

Curriculum writes require **lecturer+** and are tenancy-checked: a course resolves
to its university via its department (`getCourseScope`), and `assertUniversityScope`
keeps lecturers/admins within their own institution. Reads require any
authenticated user. All of this reuses the Phase 2B RBAC unchanged.

### Deferred (architecture-ready, not built)

Content (YouTube-derived summaries/notes/flashcards/quizzes), mastery scores,
exam-readiness, and lecturer analytics attach to `concepts`/`courses` in later
phases; the AI Content Engine and AI Tutor populate the fields above for lecturer
review. Nothing here blocks them.

## Phase 3.2 — Content ingestion & AI Content Engine

Lets a lecturer turn source material into graph content instead of hand-entering
every concept, while staying fully in control.

- **`extraction_runs`** — a staging table. A lecturer pastes course material; an
  extractor produces a proposal (concepts + prerequisite edges, each concept
  identified by a `key` the edges reference), stored as JSON on the run with a
  `status` (`proposed` → `applied` / `discarded` / `error`). Nothing touches the
  graph until the lecturer applies it.

### Extractor abstraction (swap AI in, keep it testable)

`lib/extraction` defines an `Extractor` interface and two implementations behind
a factory (`getExtractor()`):

- **heuristic** (default) — deterministic, dependency-free parser: turns an
  outline/syllabus into concepts grouped by module with a sequential
  prerequisite chain. No network, so the whole workflow and the test suite run
  with no API key.
- **claude** — activates when `ANTHROPIC_API_KEY` is set. Uses the Anthropic
  TypeScript SDK (`claude-opus-4-8`) with **structured JSON output**
  (`output_config.format`) so the response validates against the proposal
  schema; it drafts difficulty, Bloom levels and learning objectives — the exact
  Phase 3.1 concept fields. The system prompt instructs a DAG and "draft for a
  human who will review", i.e. precision over recall.

The proposal is validated with Zod before it is trusted, regardless of source.

### Applying is DAG-safe and lecturer-gated

`applyExtraction` creates the proposed concepts as **drafts** and then wires the
edges through the same `createEdge` service used everywhere else — so every
graph invariant still holds. Any edge that would introduce a cycle, duplicate an
existing link, or reference an unknown concept is **skipped** (counted, not
fatal), keeping the graph a valid DAG even if a model proposes a bad link. Only
a `proposed` run can be applied, and only once. Writes require **lecturer+**
within the course's university, reusing the Phase 2B/3.1 authz unchanged.

### Deferred (architecture-ready)

The YouTube pipeline (metadata/transcript → summary/notes/flashcards/quizzes),
exam readiness, lecturer analytics, and the AI Tutor attach to concepts/courses
in later phases; the extractor abstraction is the seam the YouTube-derived and
document-derived content will plug into.

## Known limitations (by design, current phases)

- No email verification, password reset, rate limiting, or CSRF token (SameSite
  cookies mitigate CSRF for now).
- No self-service role elevation or user-management UI; elevated users are
  created via the seed/service layer.
- Concept/edge editing is create + read only so far (no update/delete/reorder
  UI yet); publishing status exists on the model but has no workflow yet.
- SQLite single-writer semantics are fine for dev; production needs Postgres.
