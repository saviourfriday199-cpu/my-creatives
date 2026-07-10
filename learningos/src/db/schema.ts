import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

/**
 * LearningOS data model — Phase 2B (Platform Foundation).
 *
 * Only the organizational + identity core is implemented here: universities,
 * departments, users, and sessions. Future phases (courses, concepts, the
 * prerequisite knowledge graph, content, quizzes, mastery, analytics) will add
 * their own tables that reference these — university/department scoping and the
 * role model are deliberately in place now so every later module inherits
 * multi-tenant boundaries and RBAC without a rewrite.
 *
 * Dialect note: SQLite for dev/test; the schema uses only portable column types
 * so the same definitions target Postgres in production (see ARCHITECTURE.md).
 */

/** Platform roles, least → most privileged. */
export const ROLES = ["student", "lecturer", "admin", "super_admin"] as const;
export type Role = (typeof ROLES)[number];

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const universities = sqliteTable(
  "universities",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    country: text("country"),
    ...timestamps,
  },
  (t) => ({
    slugIdx: uniqueIndex("universities_slug_idx").on(t.slug),
  }),
);

export const departments = sqliteTable(
  "departments",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => universities.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Short department code, unique within its university (e.g. "BIO"). */
    code: text("code").notNull(),
    ...timestamps,
  },
  (t) => ({
    // A code is unique within a university, not globally.
    uniqCode: uniqueIndex("departments_university_code_idx").on(
      t.universityId,
      t.code,
    ),
    byUniversity: index("departments_university_idx").on(t.universityId),
  }),
);

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    /** Stored lower-cased; unique across the platform. */
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ROLES }).notNull().default("student"),
    /** Tenancy: which university/department this user belongs to (nullable for super_admin). */
    universityId: text("university_id").references(() => universities.id, {
      onDelete: "set null",
    }),
    departmentId: text("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    byUniversity: index("users_university_idx").on(t.universityId),
  }),
);

/**
 * Server-side sessions. The raw token lives only in the client's httpOnly
 * cookie; we store only its SHA-256 hash, so a database leak cannot be replayed
 * as a live session.
 */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    tokenIdx: uniqueIndex("sessions_token_hash_idx").on(t.tokenHash),
    byUser: index("sessions_user_idx").on(t.userId),
  }),
);

/* ============================================================================
 * Phase 3 — Knowledge Graph core
 *
 * A course belongs to a department; it is decomposed into concepts (micro-topics
 * — one teachable idea), which are wired into a prerequisite graph via
 * concept_edges. This is the platform's core IP: the graph drives unlocking and,
 * later, mastery/adaptive review. Bloom level, difficulty and learning objective
 * live on the concept so the future AI Content Engine has fields to populate and
 * lecturers have fields to review. Content, quizzes, mastery and analytics attach
 * to concepts in later phases.
 * ========================================================================== */

/** Publication lifecycle shared by courses and concepts. */
export const PUBLISH_STATUS = ["draft", "published"] as const;
export type PublishStatus = (typeof PUBLISH_STATUS)[number];

/** Bloom's taxonomy cognitive levels, ascending. */
export const BLOOM_LEVELS = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
] as const;
export type BloomLevel = (typeof BLOOM_LEVELS)[number];

/** Prerequisite strength: hard blocks unlocking, soft is advisory. */
export const EDGE_STRENGTHS = ["hard", "soft"] as const;
export type EdgeStrength = (typeof EDGE_STRENGTHS)[number];

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
    /** Course code as printed in the syllabus, e.g. "BIO 301". */
    code: text("code").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    /** Academic level, e.g. "100".."400". */
    level: text("level"),
    status: text("status", { enum: PUBLISH_STATUS }).notNull().default("draft"),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => ({
    uniqCode: uniqueIndex("courses_department_code_idx").on(
      t.departmentId,
      t.code,
    ),
    byDepartment: index("courses_department_idx").on(t.departmentId),
  }),
);

export const concepts = sqliteTable(
  "concepts",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    /** Grouping used by the UI (module/unit name). */
    module: text("module"),
    /** Display order within the course. */
    position: integer("position").notNull().default(0),
    /** Estimated difficulty, 1 (easy) – 5 (hard). Nullable until set/estimated. */
    difficulty: integer("difficulty"),
    bloomLevel: text("bloom_level", { enum: BLOOM_LEVELS }),
    learningObjective: text("learning_objective"),
    status: text("status", { enum: PUBLISH_STATUS }).notNull().default("draft"),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => ({
    byCourse: index("concepts_course_idx").on(t.courseId),
  }),
);

export const conceptEdges = sqliteTable(
  "concept_edges",
  {
    id: text("id").primaryKey(),
    /** Denormalised course id — every edge is within one course; enables scoping. */
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    fromConceptId: text("from_concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    toConceptId: text("to_concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    strength: text("strength", { enum: EDGE_STRENGTHS })
      .notNull()
      .default("hard"),
    reason: text("reason"),
    ...timestamps,
  },
  (t) => ({
    // At most one edge between the same ordered pair.
    uniqPair: uniqueIndex("concept_edges_pair_idx").on(
      t.fromConceptId,
      t.toConceptId,
    ),
    byCourse: index("concept_edges_course_idx").on(t.courseId),
    byTo: index("concept_edges_to_idx").on(t.toConceptId),
  }),
);

/* ============================================================================
 * Phase 3.2 — Content ingestion & AI Content Engine
 *
 * A lecturer submits source material (course outline / syllabus / notes) for a
 * course; an extractor proposes concepts + prerequisite edges into a staging
 * row. The lecturer reviews the proposal and either applies it (creating draft
 * concepts/edges in the graph) or discards it — the lecturer is always in
 * control, AI never publishes directly. The proposal is stored as JSON so the
 * review UI can render it without re-running extraction.
 * ========================================================================== */

export const EXTRACTION_STATUS = [
  "proposed",
  "applied",
  "discarded",
  "error",
] as const;
export type ExtractionStatus = (typeof EXTRACTION_STATUS)[number];

export const extractionRuns = sqliteTable(
  "extraction_runs",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    /** The pasted source material the extraction ran against. */
    sourceText: text("source_text").notNull(),
    status: text("status", { enum: EXTRACTION_STATUS })
      .notNull()
      .default("proposed"),
    /** Which extractor produced this: "heuristic" or "claude:<model>". */
    model: text("model").notNull(),
    /** JSON-encoded ExtractionProposal (concepts + edges) for lecturer review. */
    proposal: text("proposal").notNull(),
    error: text("error"),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => ({
    byCourse: index("extraction_runs_course_idx").on(t.courseId),
  }),
);

export type ExtractionRun = typeof extractionRuns.$inferSelect;
export type NewExtractionRun = typeof extractionRuns.$inferInsert;

export type University = typeof universities.$inferSelect;
export type NewUniversity = typeof universities.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Concept = typeof concepts.$inferSelect;
export type NewConcept = typeof concepts.$inferInsert;
export type ConceptEdge = typeof conceptEdges.$inferSelect;
export type NewConceptEdge = typeof conceptEdges.$inferInsert;
