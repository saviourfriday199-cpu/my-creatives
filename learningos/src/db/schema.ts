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

export type University = typeof universities.$inferSelect;
export type NewUniversity = typeof universities.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
