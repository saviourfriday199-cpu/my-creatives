import type { User } from "@/db/schema";
import type { SessionUser } from "./session";

/** Shape safe to return to clients — never includes the password hash. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  universityId: string | null;
  departmentId: string | null;
}

export function toPublicUser(user: User | SessionUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    universityId: user.universityId,
    departmentId: user.departmentId,
  };
}
