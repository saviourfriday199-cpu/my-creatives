import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-bg)_0%,var(--color-bg-deep)_70%)] px-4">
      <Link href="/" className="mb-8 font-display text-[20px] font-bold tracking-[-0.01em]">
        learning<span className="text-gold">os</span>
      </Link>
      {children}
    </div>
  );
}
