import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasAtLeast } from "@/lib/auth/current-user";
import LogoutButton from "./LogoutButton";

/** Server-rendered top bar; adapts to the current session and role. */
export default async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-[rgba(6,9,16,0.82)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-[clamp(16px,4vw,40px)] py-4">
        <Link href="/" className="font-display text-[17px] font-bold tracking-[-0.01em]">
          learning<span className="text-gold">os</span>
        </Link>
        <nav className="flex items-center gap-4 font-mono text-[12px] uppercase tracking-[0.05em]">
          {user ? (
            <>
              <Link href="/dashboard" className="text-muted hover:text-text">
                Dashboard
              </Link>
              {hasAtLeast(user.role, "admin") && (
                <Link href="/admin" className="text-muted hover:text-text">
                  Admin
                </Link>
              )}
              <span className="hidden text-locked sm:inline">{user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-text">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-line px-3 py-1.5 text-muted hover:border-gold hover:text-gold"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
