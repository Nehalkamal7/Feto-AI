"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FetoLogo } from "@/components/brand/FetoLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ArrowRight, Menu, X, User } from "lucide-react";
import { useAuth } from "@/lib/authContext";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <FetoLogo size="sm" badge="v1.0" />
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <a
            href="#capabilities"
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Capabilities
          </a>
          <a
            href="#architecture"
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Architecture
          </a>
          <a
            href="#pricing"
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Pricing
          </a>
          <Link
            href="/chat"
            className="hover:text-black dark:hover:text-white transition-colors"
          >
            Workspace
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/chat"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-xs font-mono text-black dark:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{user?.fullName || user?.email}</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-black text-white dark:bg-white dark:text-black uppercase">
                  {user?.planTier}
                </span>
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="text-xs font-mono px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
          )}

          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:opacity-90 transition-all shadow-sm"
          >
            <span>Launch FetoAI</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-4 pt-3 pb-6 space-y-4">
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
          >
            Capabilities
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
          >
            Architecture
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
          >
            Pricing
          </a>
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("signin");
                }}
                className="w-full text-center py-2 rounded-md text-xs font-mono border border-neutral-300 dark:border-neutral-800 text-black dark:text-white"
              >
                Sign In
              </button>
            )}
            <Link
              href="/chat"
              className="w-full text-center py-2.5 rounded-md text-xs font-mono bg-black text-white dark:bg-white dark:text-black font-medium"
            >
              Launch FetoAI Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
