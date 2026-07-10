/**
 * Auth constants with no server-only / native dependencies, so they are safe to
 * import from the edge middleware as well as server code.
 */
export const SESSION_COOKIE = "los_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
