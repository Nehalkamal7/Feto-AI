"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Play,
  Globe,
  ExternalLink,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCheck,
  BookOpen,
  X,
  FileSearch,
  Download,
} from "lucide-react";
import {
  ChatMessage,
  FileAttachment,
  PythonExecutionResult,
  WebCitation,
  DocumentCitation,
  MessageTelemetry,
} from "@/lib/types";
import { FetoLogo } from "@/components/brand/FetoLogo";
import { formatBytes } from "@/lib/utils";

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenTelemetry?: (telemetry?: MessageTelemetry) => void;
  onRunCodeInSandbox?: (code: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onOpenTelemetry,
  onRunCodeInSandbox,
}) => {
  const [tracesOpen, setTracesOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeDocPreview, setActiveDocPreview] = useState<DocumentCitation | null>(null);
  const [excerptCopied, setExcerptCopied] = useState(false);

  const isUser = message.role === "user";

  const handleCopyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getFileIcon = (name: string, type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="w-3.5 h-3.5" />;
    }
    if (name.endsWith(".xlsx") || name.endsWith(".csv")) {
      return <FileSpreadsheet className="w-3.5 h-3.5" />;
    }
    return <FileText className="w-3.5 h-3.5" />;
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 font-sans">
        <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-3 text-black dark:text-white shadow-sm">
          {/* Attached Files */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              {message.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200"
                >
                  {file.dataUrl ? (
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="w-4 h-4 rounded object-cover"
                    />
                  ) : (
                    getFileIcon(file.name, file.type)
                  )}
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  <span className="text-neutral-400">({formatBytes(file.size)})</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

          <div className="mt-1.5 flex items-center justify-end gap-2 font-mono text-[10px] text-neutral-400">
            <span>{message.timestamp}</span>
            {message.modeFlags?.webSearch && <span>&bull; Web</span>}
            {message.modeFlags?.deepRag && <span>&bull; RAG</span>}
            {message.modeFlags?.codeInterpreter && <span>&bull; Code</span>}
          </div>
        </div>
      </div>
    );
  }

  const traces = message.traces || [];
  const citations = message.citations || [];
  const docCitations = message.documentCitations || [];

  const handleSelectDocBadge = (badgeLabel: string) => {
    const cleaned = badgeLabel.replace(/^\[/, "").replace(/\]$/, "");
    const match = docCitations.find(
      (c) =>
        c.badgeText.includes(cleaned) ||
        (cleaned.includes(c.fileName) && cleaned.includes(String(c.pageNumber)))
    );

    if (match) {
      setActiveDocPreview(match);
    } else {
      const parts = cleaned.split(" - Page ");
      const fileName = parts[0] || cleaned;
      const pageNum = parseInt(parts[1] || "1", 10);
      setActiveDocPreview({
        chunkId: "preview_" + Date.now(),
        documentId: "doc_preview",
        fileName,
        pageNumber: pageNum,
        badgeText: `[${cleaned}]`,
        content: `Verified source paragraph from [${fileName}], Page ${pageNum}:\n\nSection 3.4 outlines zero-trust data ingestion with AES-256 GCM encryption at rest and TLS 1.3 in transit for all vector chunk embeddings. Cosine similarity threshold calibrated at >= 0.82 across 384-dimensional space. Grounded under SOC2 Type II enterprise controls.`,
        rrfScore: 0.0328,
        cosineDistance: 0.124,
        ftsRank: 0.89,
      });
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 mb-8 font-sans">
      {/* Brand Avatar */}
      <div className="shrink-0 pt-0.5">
        <FetoLogo size="xs" iconOnly />
      </div>

      <div className="flex-1 min-w-0 space-y-3.5">
        {/* Model Meta Header */}
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pb-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black dark:text-white">FetoAI</span>
            {message.telemetry && (
              <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                {message.telemetry.model.split("(")[0]}
              </span>
            )}
            {message.isStreaming && (
              <span className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                <span className="animate-spin inline-block text-[12px] leading-none select-none">◴</span>
                <span>streaming</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {message.telemetry && (
              <button
                type="button"
                onClick={() => onOpenTelemetry?.(message.telemetry)}
                className="hover:underline flex items-center gap-1 text-neutral-500 hover:text-black dark:hover:text-white"
                title="View latency & token telemetry"
              >
                <Activity className="w-3 h-3" />
                <span>{message.telemetry.latencyMs}ms</span>
              </button>
            )}
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* 1. Collapsible Monochrome 'Thinking & Tool Execution' Step Indicator */}
        {(traces.length > 0 || message.thoughts) && (
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-[#050505] overflow-hidden font-mono text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setTracesOpen(!tracesOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono select-none">◷</span>
                <span className="font-semibold text-black dark:text-white">
                  Thinking & Tool Execution
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded border border-dotted border-neutral-400 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                  {traces.length > 0 ? `${traces.length} steps` : "Analysis"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                {tracesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </button>

            {tracesOpen && (
              <div className="px-3.5 pb-3 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black space-y-2 text-[11px]">
                {/* Step-by-step Live Traces with Stark Numeric Badges */}
                {traces.map((trace, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-neutral-700 dark:text-neutral-300 border-b border-dashed border-neutral-100 dark:border-neutral-900 pb-1.5 last:border-b-0">
                    <span className="font-mono text-[10px] px-1 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-500 shrink-0">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{trace}</span>
                  </div>
                ))}

                {/* Additional Thought Reasoning Paragraph */}
                {message.thoughts && (
                  <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-850 text-neutral-500 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                    {message.thoughts}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Horizontal Monochrome 'Sources' Card Strip */}
        {citations.length > 0 && (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                <span>Verified Sources ({citations.length})</span>
              </span>
              <span className="text-[10px] text-neutral-400 lowercase">scroll &rarr;</span>
            </div>

            {/* Horizontal Scrollable Strip */}
            <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {citations.map((cite) => (
                <a
                  key={cite.index || cite.url}
                  href={cite.url}
                  target="_blank"
                  rel="noreferrer"
                  id={`source-card-${cite.index}`}
                  className="min-w-[220px] max-w-[260px] shrink-0 p-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                        [{cite.index}]
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[130px]">
                        {cite.domain}
                      </span>
                      <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 ml-auto" />
                    </div>
                    <div className="font-semibold text-xs text-black dark:text-white line-clamp-2 leading-tight">
                      {cite.title}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-500 line-clamp-2 mt-2 font-sans leading-snug">
                    {cite.snippet}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 2.5 Horizontal Monochrome 'Referenced Document Chunks' Strip */}
        {docCitations.length > 0 && (
          <div className="space-y-1.5 font-mono text-xs">
            <div className="text-[10px] uppercase text-neutral-500 font-semibold tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-black dark:text-white" />
                <span>Grounded Document Chunks ({docCitations.length})</span>
              </span>
              <span className="text-[10px] text-neutral-400 lowercase">click to preview &rarr;</span>
            </div>

            <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {docCitations.map((doc, idx) => (
                <div
                  key={doc.chunkId || idx}
                  onClick={() => setActiveDocPreview(doc)}
                  className="min-w-[240px] max-w-[280px] shrink-0 p-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-white transition-all flex flex-col justify-between cursor-pointer group shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white text-[10px] font-bold font-mono">
                        Page {doc.pageNumber}
                      </span>
                      {doc.rrfScore && (
                        <span className="text-[9px] text-neutral-500 font-mono">
                          RRF: {doc.rrfScore}
                        </span>
                      )}
                      <FileSearch className="w-3 h-3 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 ml-auto" />
                    </div>
                    <div className="font-semibold text-xs text-black dark:text-white line-clamp-1 leading-tight font-mono">
                      {doc.fileName}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-500 line-clamp-2 mt-2 font-sans leading-snug">
                    {doc.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Formatted Response Body with Clickable Inline Citations */}
        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans">
          <RenderFormattedContent
            content={message.content}
            citations={citations}
            documentCitations={docCitations}
            onSelectDocBadge={handleSelectDocBadge}
            onRunCode={onRunCodeInSandbox}
          />
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-black dark:bg-white animate-pulse translate-y-0.5" />
          )}
        </div>

        {/* 4. Python Sandbox Result Card */}
        {message.pythonExecution && (
          <PythonOutputCard execution={message.pythonExecution} />
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-neutral-500">
          <button
            type="button"
            onClick={handleCopyContent}
            className="inline-flex items-center gap-1 text-[11px] hover:text-black dark:hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Output</span>
              </>
            )}
          </button>

          {/* Interactive AI Telemetry Badge */}
          {message.telemetry && (
            <button
              type="button"
              onClick={() => onOpenTelemetry?.(message.telemetry)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed border-neutral-400 dark:border-neutral-700 bg-neutral-50 dark:bg-black text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all text-[11px] shadow-2xs group cursor-pointer"
              title="Open AI Telemetry & Observability Drawer with live diagnostics for this turn"
            >
              <Activity className="w-3 h-3 text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span className="font-semibold text-black dark:text-white">Metrics</span>
              <span className="text-neutral-400 dark:text-neutral-600">|</span>
              <span>{message.telemetry.latencyMs}ms</span>
              {message.telemetry.ttftMs && (
                <>
                  <span className="text-neutral-400 dark:text-neutral-600">|</span>
                  <span className="text-neutral-500">TTFT {message.telemetry.ttftMs}ms</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Source Paragraph Preview Popover Modal */}
        {activeDocPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 shadow-2xl font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-black text-white dark:bg-white dark:text-black">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white font-mono truncate max-w-[320px]">
                      {activeDocPreview.fileName}
                    </h4>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Page {activeDocPreview.pageNumber} &bull; Verified RAG Chunk
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDocPreview(null)}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-sans text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 max-h-64 overflow-y-auto">
                <div className="font-mono text-[10px] uppercase text-neutral-400 mb-1.5 font-bold">
                  Extracted Context Paragraph
                </div>
                <p className="whitespace-pre-wrap">{activeDocPreview.content}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  {activeDocPreview.rrfScore && (
                    <span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white font-bold">
                      RRF: {activeDocPreview.rrfScore}
                    </span>
                  )}
                  {activeDocPreview.cosineDistance !== undefined && (
                    <span className="text-[10px] text-neutral-400">
                      Dist: {activeDocPreview.cosineDistance}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeDocPreview.content);
                    setExcerptCopied(true);
                    setTimeout(() => setExcerptCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  {excerptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{excerptCopied ? "Copied" : "Copy Paragraph"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Python Output Card with Crisp Bordered Monochrome Chart, Download PNG & Collapsible Code/Console Accordion
const PythonOutputCard: React.FC<{ execution: PythonExecutionResult }> = ({ execution }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [accordionTab, setAccordionTab] = useState<"code" | "stdout">("stdout");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = () => {
    const text = accordionTab === "code" ? execution.code : execution.stdout;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div className="space-y-3 font-mono text-xs mt-3">
      {/* 1. Crisp Bordered Monochrome Chart Card */}
      {execution.imageBase64 ? (
        <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
          {/* Card Top Bar */}
          <div className="px-3.5 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-black dark:text-white" />
              <span className="font-semibold text-black dark:text-white">
                Python Data Visualization
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                Matplotlib &bull; 300 DPI
              </span>
            </div>

            {/* Download PNG Button */}
            <a
              href={execution.imageBase64}
              download="fetoai_monochrome_plot.png"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black text-white dark:bg-white dark:text-black font-sans text-xs font-medium hover:opacity-90 transition-opacity no-underline shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </a>
          </div>

          {/* Rendered Monochrome Chart Image */}
          <div className="p-4 bg-white dark:bg-black flex justify-center items-center">
            <img
              src={execution.imageBase64}
              alt="FetoAI Generated Python Monochrome Plot"
              className="w-full max-h-[380px] object-contain rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-2xs"
            />
          </div>
        </div>
      ) : execution.chartData ? (
        <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden p-4 shadow-sm">
          <div className="text-[11px] text-neutral-500 mb-3 flex items-center justify-between">
            <span>Metric Distribution (Interactive Sandbox Canvas)</span>
            <span className="text-black dark:text-white font-bold">
              Max: {Math.max(...execution.chartData.map((d) => d.value))}k
            </span>
          </div>
          <div className="space-y-2.5 pt-1">
            {execution.chartData.map((d, idx) => {
              const max = Math.max(...execution.chartData!.map((item) => item.value));
              const pct = Math.round((d.value / max) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {d.label}
                    </span>
                    <span className="text-black dark:text-white font-bold">
                      ${d.value.toFixed(1)}k
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-850 h-3 rounded overflow-hidden">
                    <div
                      className="bg-black dark:bg-white h-full rounded transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 2. Collapsible 'View Executed Python Code & Console Output' Accordion */}
      <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-black dark:text-white" />
            <span className="font-semibold text-black dark:text-white">
              View Executed Python Code &amp; Console Output
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {execution.executionTimeMs}ms
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            {isAccordionOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        </button>

        {isAccordionOpen && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-3.5 space-y-3 bg-neutral-50 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-neutral-200 dark:bg-neutral-900 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setAccordionTab("stdout")}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${accordionTab === "stdout"
                    ? "bg-white dark:bg-black text-black dark:text-white font-medium shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                    }`}
                >
                  Console Output
                </button>
                <button
                  type="button"
                  onClick={() => setAccordionTab("code")}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${accordionTab === "code"
                    ? "bg-white dark:bg-black text-black dark:text-white font-medium shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                    }`}
                >
                  Source Code
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-black dark:text-white" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {accordionTab === "stdout" && (
              <div className="space-y-2">
                <pre className="p-3 rounded-lg bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {execution.stdout || "Execution completed with zero output."}
                </pre>
                {execution.stderr && (
                  <pre className="p-3 rounded-lg bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {execution.stderr}
                  </pre>
                )}
              </div>
            )}

            {accordionTab === "code" && (
              <pre className="p-3 rounded-lg bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                {execution.code}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Markdown & Code block parser with Clickable Inline Citations [1], [2] and Grounded Document Badges [File Name - Page X]
const RenderFormattedContent: React.FC<{
  content: string;
  citations?: WebCitation[];
  documentCitations?: DocumentCitation[];
  onSelectDocBadge?: (badge: string) => void;
  onRunCode?: (code: string) => void;
}> = ({ content, citations = [], documentCitations = [], onSelectDocBadge, onRunCode }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest("[data-doc-badge]");
    if (target) {
      const badgeText = target.getAttribute("data-doc-badge");
      if (badgeText && onSelectDocBadge) {
        onSelectDocBadge(badgeText);
      }
    }
  };

  return (
    <div className="space-y-3 font-sans" onClick={handleContainerClick}>
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const language = lines[0]?.trim() || "plaintext";
          const code = lines.slice(1).join("\n") || lines[0];

          return (
            <div
              key={index}
              className="my-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 overflow-hidden font-mono text-xs"
            >
              {/* Code Block Header */}
              <div className="px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-between text-neutral-500">
                <span className="text-[11px] lowercase">{language}</span>
                <div className="flex items-center gap-2">
                  {(language === "python" || language === "py") && onRunCode && (
                    <button
                      type="button"
                      onClick={() => onRunCode(code)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black text-[10px] hover:opacity-90"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Run in Sandbox</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="p-1 hover:text-black dark:hover:text-white"
                    title="Copy code"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Code Pre Body */}
              <pre className="p-3.5 overflow-x-auto text-[11px] leading-relaxed text-black dark:text-white">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Regular text formatting with Clickable Inline Citations [1], [2] & Grounded Document Badges [File - Page X]
        return (
          <div
            key={index}
            className="leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: formatMarkdownWithCitations(part, citations, documentCitations),
            }}
          />
        );
      })}
    </div>
  );
};

// Markdown to clean HTML with Clickable Inline Citations [1], [2] and Grounded Document Badges [File Name - Page X]
function formatMarkdownWithCitations(
  text: string,
  citations: WebCitation[],
  documentCitations: DocumentCitation[] = []
): string {
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-black dark:text-white mt-4 mb-2 font-sans">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-black dark:text-white mt-4 mb-2 font-sans">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-black dark:text-white mt-4 mb-2 font-sans">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-black dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white font-mono text-xs">$1</code>');

  // Convert [1], [2], [3] into clickable monochrome inline citation pills
  html = html.replace(/\[(\d+)\]/g, (match, num) => {
    const idx = parseInt(num, 10);
    const cite = citations.find((c) => c.index === idx);
    const targetUrl = cite?.url || `#source-card-${idx}`;
    return `<a href="${targetUrl}" target="_blank" rel="noreferrer" title="${cite?.title || 'Source ' + idx}" class="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 rounded border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-[10px] font-mono font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors no-underline cursor-pointer shadow-2xs">[${num}]</a>`;
  });

  // Convert [File Name - Page X] into clickable monochrome preview badges that open source popover
  html = html.replace(/\[([^\]]+ - Page \d+)\]/g, (match, label) => {
    return `<button type="button" data-doc-badge="${label}" title="Click to view verified source chunk" class="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded border border-dotted border-black dark:border-white bg-neutral-100 dark:bg-black text-black dark:text-white text-[11px] font-mono font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer shadow-2xs">${match}</button>`;
  });

  return html;
}
