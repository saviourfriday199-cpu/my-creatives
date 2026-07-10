import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { ROLES } from "@/db/schema";

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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUniversityInput = z.infer<typeof createUniversitySchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
