"use client";

import React, { useState } from "react";
import {
  Globe,
  Database,
  Terminal,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  FileCode,
  LineChart,
} from "lucide-react";

export const BentoGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <section id="capabilities" className="py-24 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 text-xs font-mono uppercase tracking-wider mb-4">
            Unified Core Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white font-sans">
            Four Specialized Engines. Zero Compromise.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-sans">
            Instead of generalist approximations, FetoAI dispatches queries to four purpose-built low-latency engines with deterministic accuracy.
          </p>
        </div>

        {/* 4-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Live Web Synthesis */}
          <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col justify-between hover:border-black dark:hover:border-neutral-400 transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  REAL-TIME
                </span>
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white font-sans">
                Live Web Synthesis
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Autonomous real-time search indexing, multi-source verification, and instant extraction of pricing, technical docs, and benchmarks.
              </p>

              {/* Interactive Visual Preview */}
              <div className="mt-6 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-2 text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                  <Search className="w-3 h-3" />
                  <span className="truncate">Tavily / Perplexity Web Index</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                    <span className="truncate">paperswithcode.com</span>
                    <span className="text-neutral-500">99.2% match</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                    <span className="truncate">artificialanalysis.ai</span>
                    <span className="text-neutral-500">97.8% match</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <span>Latency: &lt; 220ms</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Hybrid Document RAG */}
          <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col justify-between hover:border-black dark:hover:border-neutral-400 transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  SUPABASE RAG
                </span>
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white font-sans">
                Hybrid Document RAG
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Combines dense vector embeddings with sparse BM25 keyword ranking over enterprise PDFs, CSVs, XLSX spreadsheets, and code repos.
              </p>

              {/* Interactive Visual Preview */}
              <div className="mt-6 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                  <span>Cosine Similarity</span>
                  <span className="text-black dark:text-white font-bold">0.941</span>
                </div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-tight">
                  &ldquo;SOC2 Section 4.2.1: Enforce TLS 1.3 with ECDHE forward secrecy...&rdquo;
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-black dark:text-white" />
                  <span>3 chunks verified in 12ms</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <span>pgvector RRF</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Python Sandbox & Charts */}
          <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col justify-between hover:border-black dark:hover:border-neutral-400 transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  SANDBOX
                </span>
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white font-sans">
                Python Sandbox & Charts
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Isolated in-memory Python execution. Run Pandas data wrangling, financial forecasting, and generate clean monochrome visualizations.
              </p>

              {/* Interactive Visual Preview */}
              <div className="mt-6 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                  <span className="text-neutral-600 dark:text-neutral-400">python 3.12 sandbox</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
                    0 errors
                  </span>
                </div>
                {/* Visual mini bar indicator */}
                <div className="h-10 flex items-end gap-1.5 pt-1">
                  <div className="w-1/4 h-[40%] bg-neutral-300 dark:bg-neutral-800 rounded-t" />
                  <div className="w-1/4 h-[65%] bg-neutral-400 dark:bg-neutral-700 rounded-t" />
                  <div className="w-1/4 h-[85%] bg-neutral-600 dark:bg-neutral-500 rounded-t" />
                  <div className="w-1/4 h-[100%] bg-black dark:bg-white rounded-t" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <span>NumPy + Matplotlib</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Multimodal Vision */}
          <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col justify-between hover:border-black dark:hover:border-neutral-400 transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                  GEMINI 1M
                </span>
              </div>
              <h3 className="text-lg font-bold text-black dark:text-white font-sans">
                Multimodal Vision
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                Feed architecture diagrams, financial charts, UI wireframes, and scanned invoices for OCR extraction and structural decomposition.
              </p>

              {/* Interactive Visual Preview */}
              <div className="mt-6 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 pb-2">
                  <span>Spatial OCR</span>
                  <span className="text-black dark:text-white">100% Resolved</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                  <div className="p-1 border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-neutral-600 dark:text-neutral-400">
                    [Node A: Ingress]
                  </div>
                  <div className="p-1 border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-neutral-600 dark:text-neutral-400">
                    [Node B: Vector]
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <span>Vision Token Array</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
