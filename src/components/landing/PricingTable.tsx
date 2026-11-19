"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, ShieldCheck } from "lucide-react";

export const PricingTable: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 text-xs font-mono uppercase tracking-wider mb-4">
            Predictable Economics
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white font-sans">
            Transparent Free vs. Pro Tiers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-sans">
            Start immediately on our generous 100% Free-Tier. Upgrade to FetoAI Pro when your team requires unlimited throughput and dedicated execution pipelines.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-mono">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                !annual
                  ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                annual
                  ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan 1: Free Tier */}
          <div className="relative rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black dark:text-white font-sans">
                  Free Tier
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900">
                  Zero Setup Friction
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans mb-6">
                Full access to FetoAI core engines for individual researchers and engineers.
              </p>

              <div className="mb-6 font-mono">
                <span className="text-4xl font-bold text-black dark:text-white">$0</span>
                <span className="text-neutral-500 text-sm ml-2">/ forever</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-sans border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>15 daily free credits</strong> (resets automatically every 24h)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>FetoAI Fast</strong> powered by Llama 3.3 70B</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>FetoAI Vision</strong> multimodal image & diagram parsing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>Live Web Search with Tavily fallback synthesis</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>Up to 5 documents indexed in Knowledge Base</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>In-browser Python chart simulation</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-900">
              <Link
                href="/chat"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-mono font-medium border border-neutral-400 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-black dark:text-white transition-colors"
              >
                <span>Launch Free Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Plan 2: FetoAI Pro */}
          <div className="relative rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-neutral-950 p-8 flex flex-col justify-between shadow-xl">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono uppercase tracking-wider font-semibold">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black dark:text-white font-sans flex items-center gap-2">
                  <span>FetoAI Pro</span>
                  <Zap className="w-4 h-4" />
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-black dark:text-white bg-neutral-100 dark:bg-neutral-900 font-medium">
                  Unlimited
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans mb-6">
                Unconstrained horsepower, isolated Python microVMs, and priority routing.
              </p>

              <div className="mb-6 font-mono">
                <span className="text-4xl font-bold text-black dark:text-white">
                  ${annual ? "24" : "29"}
                </span>
                <span className="text-neutral-500 text-sm ml-2">/ month {annual ? "(billed annually)" : ""}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-sans border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>Unlimited queries & reasoning passes</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>FetoAI Auto Smart-Routing</strong> (Groq LPU + Gemini 2.0)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>Unlimited Knowledge Base documents</strong> (PDF, DOCX, CSV, XLSX)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span><strong>Dedicated isolated Python Sandbox</strong> with NumPy & Pandas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>Priority execution queue (zero throttling)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>BYOK (Bring Your Own Key) for unlimited private quotas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-black dark:text-white shrink-0" />
                  <span>SOC2 encryption & strict zero data retention policy</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-900">
              <Link
                href="/chat?upgrade=pro"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-md"
              >
                <span>Upgrade to FetoAI Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security / Enterprise Notice */}
        <div className="mt-16 max-w-2xl mx-auto text-center font-mono text-xs text-neutral-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
          <span>Enterprise Grade: All payloads encrypted via AES-256-GCM. Never trained on user inputs.</span>
        </div>
      </div>
    </section>
  );
};
