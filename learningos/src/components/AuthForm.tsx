"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const { user } = await res.json();
      router.replace(user.role === "student" ? "/dashboard" : "/admin");
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(
      data.error ??
        (res.status === 422 ? "Please check the fields below." : "Something went wrong."),
    );
    setBusy(false);
  }

  const isRegister = mode === "register";
  return (
    <form onSubmit={onSubmit} className="card w-full max-w-[400px]">
      <h1 className="mb-1 font-display text-[22px] font-semibold">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mb-6 text-[13px] text-muted">
        {isRegister
          ? "New accounts start as students."
          : "Sign in to continue."}
      </p>

      {isRegister && (
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" autoComplete="name" required minLength={2} />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 8 : undefined}
        />
      </div>

      {error && (
        <p className="mb-4 text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary w-full" disabled={busy} type="submit">
        {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
      </button>

      <p className="mt-4 text-center text-[13px] text-muted">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="text-gold hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
