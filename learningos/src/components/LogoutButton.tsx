"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted transition-colors hover:text-gold"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
