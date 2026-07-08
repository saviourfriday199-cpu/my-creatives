import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="container-luxe pt-40 pb-28">
        <article className="mx-auto max-w-2xl">{children}</article>
      </main>
      <Footer />
    </>
  );
}
