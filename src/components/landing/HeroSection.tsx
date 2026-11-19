"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe,
  FileText,
  Terminal,
  Zap,
  Sparkles,
  Cpu,
  Shield,
  Layers,
} from "lucide-react";

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [webSearch, setWebSearch] = useState(true);
  const [deepRag, setDeepRag] = useState(false);
  const [codeInterpreter, setCodeInterpreter] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = prompt.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (webSearch) params.set("web", "1");
    if (deepRag) params.set("rag", "1");
    if (codeInterpreter) params.set("code", "1");

    router.push(`/chat?${params.toString()}`);
  };

  const samplePrompts = [
    {
      label: "Synthesize Llama 3.3 vs Claude 3.5 Sonnet benchmarks",
      web: true,
      rag: false,
      code: false,
    },
    {
      label: "Run Python sandbox: Analyze AWS/GCP cloud spend spike",
      web: false,
      rag: false,
      code: true,
    },
    {
      label: "Audit SOC2 compliance document for data-at-rest encryption",
      web: false,
      rag: true,
      code: false,
    },
  ];

  const handleSelectSample = (sample: (typeof samplePrompts)[0]) => {
    setPrompt(sample.label);
    setWebSearch(sample.web);
    setDeepRag(sample.rag);
    setCodeInterpreter(sample.code);
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-neutral-200 dark:border-neutral-900 bg-dots-monochrome">
      {/* Background ambient radial glow (strictly monochrome) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-neutral-200/40 dark:bg-neutral-800/20 blur-[130px] -z-10 pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-300 text-xs font-mono mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
          <span>FetoAI 1.0 Enterprise GA</span>
          <span className="text-neutral-400 dark:text-neutral-600">|</span>
          <span className="text-neutral-500 dark:text-neutral-400">100% Free-Tier Architecture</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black dark:text-white font-sans max-w-4xl mx-auto leading-[1.08]">
          FetoAI — Unified Intelligence for{" "}
          <span className="underline decoration-neutral-400 dark:decoration-neutral-600 underline-offset-8">
            Research, Code & Data
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-sans leading-relaxed">
          The minimalist monochrome AI workspace engineered for executives, researchers, and developers.
          Synthesize live web intelligence, search internal vector documents, and execute Python sandbox code at 550+ tokens/sec.
        </p>

        {/* Interactive Prompt Preview Bar */}
        <div className="mt-10 max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 sm:p-3 shadow-xl transition-all focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white"
          >
            {/* Input field */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask FetoAI anything... (e.g. Compare LLMs, run code, or search documents)"
                className="w-full bg-transparent text-sm sm:text-base text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none py-2 font-sans"
              />
              <button
                type="submit"
                aria-label="Submit prompt to FetoAI workspace"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-sm"
              >
                <span>Execute</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Capability Toggle Pills */}
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex flex-wrap items-center justify-between gap-2 px-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWebSearch(!webSearch)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                    webSearch
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                      : "border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>Web Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeepRag(!deepRag)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                    deepRag
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                      : "border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Deep RAG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCodeInterpreter(!codeInterpreter)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                    codeInterpreter
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold"
                      : "border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Code Interpreter</span>
                </button>
              </div>

              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                Press <kbd className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">↵ Enter</kbd> to launch
              </div>
            </div>
          </form>

          {/* Prompt Suggestion Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-mono text-neutral-500">Quick prompts:</span>
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white px-2.5 py-1 rounded border border-dotted border-neutral-300 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#070707] hover:bg-neutral-100 dark:hover:bg-[#121212] transition-colors truncate max-w-[280px] sm:max-w-none"
              >
                &ldquo;{sample.label}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Enterprise Telemetry Badges */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800 font-mono text-left">
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Inference Speed</span>
            </div>
            <div className="text-lg font-bold text-black dark:text-white">550+ tok/s</div>
            <div className="text-[11px] text-neutral-500">Groq LPU Hardware</div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Time-to-First-Token</span>
            </div>
            <div className="text-lg font-bold text-black dark:text-white">&lt; 250ms</div>
            <div className="text-[11px] text-neutral-500">Sub-second execution</div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Context Capacity</span>
            </div>
            <div className="text-lg font-bold text-black dark:text-white">128k – 1M</div>
            <div className="text-[11px] text-neutral-500">Llama 3.3 + Gemini</div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy & Storage</span>
            </div>
            <div className="text-lg font-bold text-black dark:text-white">AES-256</div>
            <div className="text-[11px] text-neutral-500">Zero data retention</div>
          </div>
        </div>
      </div>
    </section>
  );
};
