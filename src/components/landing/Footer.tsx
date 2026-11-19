import React from "react";
import Link from "next/link";
import { FetoLogo } from "@/components/brand/FetoLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 font-sans text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Col 1: Brand & Status */}
          <div className="col-span-2 space-y-4">
            <FetoLogo size="sm" badge="ENTERPRISE" />
            <p className="max-w-xs text-neutral-500 font-sans text-xs leading-relaxed">
              Unified intelligence engine combining live web synthesis, hybrid document RAG, and isolated Python sandboxes.
            </p>
            {/* System Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-[11px] text-neutral-800 dark:text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse" />
              <span>All Systems Operational (99.99%)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3 font-mono">
            <div className="font-semibold text-black dark:text-white uppercase tracking-wider text-[11px]">
              Platform
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#capabilities" className="hover:text-black dark:hover:text-white transition-colors">
                  Web Synthesis
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-black dark:hover:text-white transition-colors">
                  Hybrid RAG
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-black dark:hover:text-white transition-colors">
                  Python Sandbox
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-black dark:hover:text-white transition-colors">
                  Vision Analysis
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture */}
          <div className="space-y-3 font-mono">
            <div className="font-semibold text-black dark:text-white uppercase tracking-wider text-[11px]">
              Engines
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  Groq LPU (Llama 3.3)
                </span>
              </li>
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  Google Gemini 1M
                </span>
              </li>
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  Supabase pgvector
                </span>
              </li>
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  Tavily Search API
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div className="space-y-3 font-mono">
            <div className="font-semibold text-black dark:text-white uppercase tracking-wider text-[11px]">
              Security
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  SOC2 Type II
                </span>
              </li>
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  Zero Data Retention
                </span>
              </li>
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  AES-256 Encryption
                </span>
              </li>
              <li>
                <span className="hover:text-black dark:hover:text-white transition-colors">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} FetoAI Inc. All rights reserved. Strictly monochrome enterprise design.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="hover:text-black dark:hover:text-white transition-colors">
              Launch Workspace
            </Link>
            <span>&bull;</span>
            <span className="text-neutral-600 dark:text-neutral-400">Inter + JetBrains Mono</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
