import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/service";
import { AuthzError } from "@/lib/auth/authz";
import { OrgError } from "@/lib/org/service";

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function error(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

/**
 * Wrap a route handler so domain/validation errors become clean JSON responses
 * instead of 500s. Anything unexpected is logged and returned as a generic 500.
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (e) {
      if (e instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", issues: e.flatten() },
          { status: 422 },
        );
      }
      if (e instanceof AuthzError) return error(e.message, e.status);
      if (e instanceof OrgError) {
        return error(e.message, e.code === "not_found" ? 404 : 409, e.code);
      }
      if (e instanceof AuthError) {
        const status = e.code === "email_taken" ? 409 : 401;
        return error(e.message, status, e.code);
      }
      console.error("Unhandled route error:", e);
      return error("Internal server error", 500);
    }
  };
}
