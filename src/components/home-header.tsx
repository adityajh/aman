"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

export function HomeHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-hairline bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between w-full md:w-auto">
        <Link href="/home" className="flex items-center hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link href="#how" className="hover:text-teal-action transition-colors">How it works</Link>
        <Link href="#pricing" className="hover:text-teal-action transition-colors">Pricing</Link>
        <Link href="/login" className="hover:text-teal-action transition-colors">Log in</Link>
        <Link href="/signup" className="px-4 py-2 bg-teal-action text-paper rounded-md hover:bg-teal-ink transition-colors">
          Start your 14-day trial
        </Link>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="mt-4 flex flex-col gap-4 text-base font-medium md:hidden pb-4 border-t border-hairline pt-4 animate-in slide-in-from-top-4 fade-in duration-200">
          <Link href="#how" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-teal-action transition-colors px-2 py-1">How it works</Link>
          <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-teal-action transition-colors px-2 py-1">Pricing</Link>
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-teal-action transition-colors px-2 py-1">Log in</Link>
          <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="inline-block text-center w-full px-4 py-3 mt-2 bg-teal-action text-paper rounded-md hover:bg-teal-ink transition-colors">
            Start your 14-day trial
          </Link>
        </nav>
      )}
    </header>
  );
}
