"use client";

import React, { useState } from "react";
import {
  X,
  Activity,
  Zap,
  Cpu,
  Layers,
  HardDrive,
  Download,
  Database,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  Clock,
  Gauge,
} from "lucide-react";
import { MessageTelemetry, RagDiagnosticChunk } from "@/lib/types";

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: MessageTelemetry | null;
}

// Raw uncolored technical gauge dial
const TechnicalGaugeDial: React.FC<{ value: number; max: number; label: string; unit: string }> = ({
  value,
  max,
  label,
  unit,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = 126 - (126 * percentage) / 100;

  return (
    <div className="flex flex-col items-center p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black">
      <div className="relative w-18 h-18 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
          {/* Base circle */}
          <circle
            cx="25"
            cy="25"
            r="20"
            className="stroke-neutral-200 dark:stroke-neutral-850"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Dotted tick marks */}
          <circle
            cx="25"
            cy="25"
            r="20"
            className="stroke-neutral-300 dark:stroke-neutral-700"
            strokeWidth="2.5"
            strokeDasharray="2, 5"
            fill="none"
          />
          {/* Active measurement progress */}
          <circle
            cx="25"
            cy="25"
            r="20"
            className="stroke-black dark:stroke-white transition-all duration-300"
            strokeWidth="3"
            strokeDasharray="126"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xs font-bold font-mono text-black dark:text-white leading-none">
            {value}
          </span>
          <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase mt-0.5">
            {unit}
          </span>
        </div>
      </div>
      <span className="mt-1.5 text-[9px] font-mono uppercase tracking-wider text-neutral-500 text-center">
        {label}
      </span>
    </div>
  );
};

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const defaultTelemetry: MessageTelemetry = {
    provider: "Groq LPU",
    model: "llama-3.3-70b-versatile",
    latencyMs: 236,
    ttftMs: 128,
    tokensPerSec: 542,
    promptTokens: 280,
    completionTokens: 310,
    totalTokens: 590,
    routedVia: "Groq LPU Ultra-Low Latency Inference Pipeline",
    costEstimatedUsd: 0.0,
    ragDiagnostics: [
      {
        chunkId: "chunk_rag_1",
        documentId: "doc_1",
        fileName: "FetoAI_Architecture_Whitepaper.pdf",
        pageNumber: 4,
        contentSnippet:
          "Section 3.4 Data Ingestion & Storage Architecture: All vector embeddings are mapped to 384-dimensional dense vectors with AES-256 GCM encryption at rest and TLS 1.3 transit validation. Cosine similarity threshold calibrated at >= 0.82 across multi-tenant schemas.",
        cosineSimilarity: 0.892,
        keywordRank: 1,
        rrfScore: 0.0328,
      },
      {
        chunkId: "chunk_rag_2",
        documentId: "doc_2",
        fileName: "Enterprise_SOC2_Compliance_2025.pdf",
        pageNumber: 12,
        contentSnippet:
          "Section 5.1 Enterprise SOC2 Type II compliance controls: Immutable SHA-256 audit trails are maintained for 100% of LLM prompt injections, tool footprints, and completion traces. Data is cryptographically purged post session.",
        cosineSimilarity: 0.846,
        keywordRank: 2,
        rrfScore: 0.0312,
      },
      {
        chunkId: "chunk_rag_3",
        documentId: "doc_3",
        fileName: "RRF_Hybrid_Retrieval_Benchmark.pdf",
        pageNumber: 7,
        contentSnippet:
          "Section 2.3 Reciprocal Rank Fusion Retrieval Metrics: Blending dense semantic embeddings with sparse BM25/FTS keyword indexes achieves 0.94 MRR@10, effectively eliminating hallucination risks in technical queries.",
        cosineSimilarity: 0.812,
        keywordRank: 3,
        rrfScore: 0.0295,
      },
    ],
  };

  const data: MessageTelemetry = telemetry || defaultTelemetry;
  const totalTokens =
    data.totalTokens || data.promptTokens + data.completionTokens;
  const ttft = data.ttftMs || Math.round(data.latencyMs * 0.35);
  const decodeMs = Math.max(1, data.latencyMs - ttft);
  const ragChunks: RagDiagnosticChunk[] = data.ragDiagnostics || [];

  const handleExportJson = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      telemetry: data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fetoai_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 1500);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-over Drawer with Razor-Sharp Stark 1px Borders */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:w-[440px] border-l border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#000000] shadow-2xl flex flex-col justify-between font-mono text-xs animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50 dark:bg-[#030303]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-black dark:text-white tracking-tight font-sans">
                AI Telemetry & Observability
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
                <span>Live Turn Diagnostics</span>
                <span>&bull;</span>
                <span>Zero Retention</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-900 transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Metrics Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Technical Gauge Dials for Latency & Throughput */}
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#050505] p-4">
            <div className="flex items-center justify-between text-neutral-500 mb-3 border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-black dark:text-white text-[11px] uppercase tracking-wider font-mono">
                <Gauge className="w-3.5 h-3.5" />
                <span>Technical Inference Dials</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-dotted border-neutral-400 dark:border-neutral-700 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
                LPU Engine
              </span>
            </div>

            {/* Dials Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <TechnicalGaugeDial
                value={data.latencyMs}
                max={1500}
                label="Latency"
                unit="ms"
              />
              <TechnicalGaugeDial
                value={ttft}
                max={500}
                label="TTFT"
                unit="ms"
              />
              <TechnicalGaugeDial
                value={data.tokensPerSec}
                max={600}
                label="Throughput"
                unit="tok/s"
              />
            </div>

            {/* Latency Distribution Segment Bar */}
            <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-850">
              <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                <span>TTFT ({ttft}ms)</span>
                <span>Decode ({decodeMs}ms)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
                <div
                  className="bg-black dark:bg-white h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      85,
                      Math.max(15, (ttft / (data.latencyMs || 1)) * 100)
                    )}%`,
                  }}
                  title={`TTFT: ${ttft}ms`}
                />
                <div
                  className="bg-neutral-400 dark:bg-neutral-600 h-full transition-all duration-300"
                  style={{
                    width: `${Math.max(
                      15,
                      100 - (ttft / (data.latencyMs || 1)) * 100
                    )}%`,
                  }}
                  title={`Decode: ${decodeMs}ms`}
                />
              </div>
            </div>
          </div>

          {/* 2. Active Provider & Model Used */}
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#050505] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500 mb-1 border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-black dark:text-white text-[11px] uppercase tracking-wider font-mono">
                <Cpu className="w-3.5 h-3.5" />
                <span>Active Provider & Engine</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-dotted border-neutral-400 dark:border-neutral-700 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
                100% Free
              </span>
            </div>

            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Provider</span>
                <span className="font-semibold text-black dark:text-white">
                  {data.provider || "Groq LPU"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-100 dark:border-neutral-900 pt-2">
                <span className="text-neutral-500">Model ID</span>
                <span className="font-mono text-black dark:text-white font-medium">
                  {data.model}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-100 dark:border-neutral-900 pt-2">
                <span className="text-neutral-500">Route Channel</span>
                <span className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]" title={data.routedVia}>
                  {data.routedVia}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-100 dark:border-neutral-900 pt-2">
                <span className="text-neutral-500">Execution Cost</span>
                <span className="font-semibold text-black dark:text-white">
                  $0.000000 <span className="text-neutral-400 text-[10px] font-normal">(Zero Free-Tier)</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Token Breakdown */}
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#050505] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-neutral-500 mb-1 border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-black dark:text-white text-[11px] uppercase tracking-wider font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>Token Utilization</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-dotted border-neutral-400 dark:border-neutral-700 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
                128k Window
              </span>
            </div>

            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Prompt Tokens</span>
                <span className="font-semibold text-black dark:text-white">
                  {data.promptTokens}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-100 dark:border-neutral-900 pt-2">
                <span className="text-neutral-500">Completion Tokens</span>
                <span className="font-semibold text-black dark:text-white">
                  {data.completionTokens}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-100 dark:border-neutral-900 pt-2">
                <span className="font-semibold text-black dark:text-white">
                  Total Tokens
                </span>
                <span className="text-sm font-bold text-black dark:text-white">
                  {totalTokens}
                </span>
              </div>
            </div>

            {/* Token Proportion Bar */}
            <div>
              <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
                <div
                  className="bg-black dark:bg-white h-full"
                  style={{
                    width: `${Math.round(
                      (data.promptTokens / (totalTokens || 1)) * 100
                    )}%`,
                  }}
                  title={`Prompt: ${data.promptTokens}`}
                />
                <div
                  className="bg-neutral-400 dark:bg-neutral-600 h-full"
                  style={{
                    width: `${Math.round(
                      (data.completionTokens / (totalTokens || 1)) * 100
                    )}%`,
                  }}
                  title={`Completion: ${data.completionTokens}`}
                />
              </div>
              <div className="flex justify-between text-[9px] text-neutral-400 mt-1">
                <span>Prompt ({data.promptTokens})</span>
                <span>Completion ({data.completionTokens})</span>
              </div>
            </div>
          </div>

          {/* 4. RAG Diagnostics with Stark Numeric Badges */}
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#050505] p-4 space-y-3">
            <div className="flex items-center justify-between text-neutral-500 border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-2">
              <span className="flex items-center gap-1.5 font-semibold text-black dark:text-white text-[11px] uppercase tracking-wider font-mono">
                <Database className="w-3.5 h-3.5" />
                <span>RAG Retrieval Diagnostics</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-dotted border-neutral-400 dark:border-neutral-700 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400">
                {ragChunks.length} Chunks
              </span>
            </div>

            {ragChunks.length > 0 ? (
              <div className="space-y-2.5">
                <div className="text-[10px] text-neutral-500">
                  Dense Cosine Similarity (<code className="text-black dark:text-white">&lt;=&gt;</code>) + Sparse Keyword (<code className="text-black dark:text-white">ts_rank</code>) via RRF (k=60):
                </div>

                {ragChunks.map((chunk, index) => (
                  <div
                    key={chunk.chunkId || index}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black space-y-2 text-[11px]"
                  >
                    {/* File & Page Header with Stark Numeric Badge */}
                    <div className="flex items-center justify-between border-b border-dashed border-neutral-100 dark:border-neutral-900 pb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shrink-0">
                          [{String(index + 1).padStart(2, "0")}]
                        </span>
                        <span className="font-semibold text-black dark:text-white truncate max-w-[180px]" title={chunk.fileName}>
                          {chunk.fileName}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded border border-dotted border-neutral-400 dark:border-neutral-700 text-[10px] text-neutral-500 bg-neutral-50 dark:bg-neutral-900">
                        Page {chunk.pageNumber || 1}
                      </span>
                    </div>

                    {/* Metric Badges Strip with High-Contrast Inverted Styling */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {/* Cosine Similarity */}
                      <div className="p-1.5 rounded border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-center">
                        <div className="text-[9px] uppercase text-neutral-500 font-mono">
                          Cosine Sim
                        </div>
                        <div className="font-bold text-black dark:text-white text-[11px] mt-0.5 font-mono">
                          {chunk.cosineSimilarity.toFixed(3)}
                        </div>
                      </div>

                      {/* Keyword Rank */}
                      <div className="p-1.5 rounded border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 text-center">
                        <div className="text-[9px] uppercase text-neutral-500 font-mono">
                          Keyword Rank
                        </div>
                        <div className="font-bold text-black dark:text-white text-[11px] mt-0.5 font-mono">
                          #{chunk.keywordRank}
                        </div>
                      </div>

                      {/* RRF Score */}
                      <div className="p-1.5 rounded border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-center">
                        <div className="text-[9px] uppercase font-bold font-mono">
                          RRF Score
                        </div>
                        <div className="font-bold text-[11px] mt-0.5 font-mono">
                          {chunk.rrfScore.toFixed(4)}
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="mt-1 p-2 rounded bg-neutral-50 dark:bg-[#080808] border border-neutral-100 dark:border-neutral-900 text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
                      &ldquo;{chunk.contentSnippet}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-center text-neutral-500 text-[11px] space-y-1">
                <p>No vector chunks retrieved for this specific turn.</p>
                <p className="text-[10px] text-neutral-400">
                  Toggle <strong className="text-black dark:text-white">[Deep RAG]</strong> or attach documents to view Cosine, Keyword, and RRF diagnostic scores.
                </p>
              </div>
            )}
          </div>

          {/* 5. Raw JSON Inspector */}
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#050505] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full px-4 py-3 flex items-center justify-between text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-black dark:text-white">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Raw Telemetry JSON</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500">
                  {showRawJson ? "Hide" : "Inspect"}
                </span>
                {showRawJson ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showRawJson && (
              <div className="p-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[10px] text-neutral-600 dark:text-neutral-300"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="w-3 h-3 text-black dark:text-white" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 rounded bg-neutral-50 dark:bg-[#050505] border border-neutral-100 dark:border-neutral-900 overflow-x-auto text-[10px] text-neutral-700 dark:text-neutral-300 leading-tight">
                  <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-50 dark:bg-[#030303] flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-medium transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Telemetry JSON</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-300 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};
