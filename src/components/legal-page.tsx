import Link from "next/link";
import { ReactNode } from "react";
import { HomeHeader } from "@/components/home-header";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <HomeHeader />
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="font-serif text-teal-ink text-3xl md:text-4xl font-bold mb-2">
            {title}
          </h1>
          <p className="italic text-ink-2 text-sm mb-1">
            Plain-English version. A lawyer reviews this before launch.
          </p>
          <p className="text-ink-2 text-xs mb-8">Last updated 18 August 2026</p>
          <div className="space-y-8 text-ink-2 leading-relaxed">{children}</div>
        </div>
      </main>
      <footer className="border-t border-hairline py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
          <Link href="/privacy" className="hover:text-teal-action transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-teal-action transition-colors">
            Terms
          </Link>
          <Link href="/refunds" className="hover:text-teal-action transition-colors">
            Refunds
          </Link>
          <Link href="/contact" className="hover:text-teal-action transition-colors">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
