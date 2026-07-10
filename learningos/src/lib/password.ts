import bcrypt from "bcryptjs";

const ROUNDS = 12;

/** Minimum password policy enforced at the validation layer too (see validators). */
export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
