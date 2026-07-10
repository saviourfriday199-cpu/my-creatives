import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { ROLES, BLOOM_LEVELS, EDGE_STRENGTHS } from "@/db/schema";

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(MIN_PASSWORD_LENGTH).max(200);
const name = z.string().trim().min(2).max(120);

/** Public self-registration: role is never accepted from the client here. */
export const registerSchema = z.object({
  email,
  name,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
});

export const createUniversitySchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
  country: z.string().trim().min(2).max(80).optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(200),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(16)
    .regex(/^[A-Z0-9]+$/, "code must be alphanumeric"),
});

/** Admin-side role assignment (guarded server-side). */
export const roleSchema = z.enum(ROLES);

/* ----------------------------- curriculum ----------------------------- */

export const createCourseSchema = z.object({
  code: z.string().trim().min(2).max(32),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  level: z.string().trim().max(16).optional(),
});

export const createConceptSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  module: z.string().trim().max(120).optional(),
  position: z.coerce.number().int().min(0).max(100000).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  bloomLevel: z.enum(BLOOM_LEVELS).optional(),
  learningObjective: z.string().trim().max(1000).optional(),
});

export const createEdgeSchema = z.object({
  fromConceptId: z.string().min(1),
  toConceptId: z.string().min(1),
  strength: z.enum(EDGE_STRENGTHS).default("hard"),
  reason: z.string().trim().max(1000).optional(),
});

export const runExtractionSchema = z.object({
  sourceText: z.string().trim().min(20).max(100000),
});

export type RunExtractionInput = z.infer<typeof runExtractionSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateConceptInput = z.infer<typeof createConceptSchema>;
export type CreateEdgeInput = z.infer<typeof createEdgeSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
