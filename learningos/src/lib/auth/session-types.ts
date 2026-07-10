import type { Role } from "@/db/schema";

/** Minimal, dependency-free user shape derived from a session. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  universityId: string | null;
  departmentId: string | null;
}
