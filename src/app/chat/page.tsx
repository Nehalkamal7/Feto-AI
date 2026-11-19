"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/workspace/Sidebar";
import { Header } from "@/components/workspace/Header";
import { InputDock } from "@/components/workspace/InputDock";
import { MessageBubble } from "@/components/workspace/MessageBubble";
import { TelemetryDrawer } from "@/components/workspace/TelemetryDrawer";
import { SettingsModal } from "@/components/workspace/SettingsModal";
import { KnowledgeBaseModal } from "@/components/workspace/KnowledgeBaseModal";
import { ProModal } from "@/components/workspace/ProModal";
import {
  ChatMessage,
  ChatSession,
  FileAttachment,
  MessageTelemetry,
  ModelId,
  UserApiKeys,
  WebCitation,
  DocumentCitation,
  PythonExecutionResult,
} from "@/lib/types";
import { DEFAULT_CHAT_SESSIONS } from "@/lib/mockData";
import { generateId } from "@/lib/utils";
import { Sparkles, Globe, Terminal, Database } from "lucide-react";
import { FetoLogo } from "@/components/brand/FetoLogo";
import { useAuth } from "@/lib/authContext";
import { persistConversation, persistMessage } from "@/lib/supabaseClient";

function ChatWorkspaceContent() {
  const searchParams = useSearchParams();
  const { user, checkAndDeductCredit, openAuthModal } = useAuth();

  // State
  const [sessions, setSessions] = useState<ChatSession[]>(DEFAULT_CHAT_SESSIONS);
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    DEFAULT_CHAT_SESSIONS[0].id
  );
  const [currentModelId, setCurrentModelId] = useState<ModelId>("feto-auto");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [activeTelemetry, setActiveTelemetry] = useState<MessageTelemetry | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proModalReason, setProModalReason] = useState<"limit_reached" | "manual">("manual");

  const [userKeys, setUserKeys] = useState<UserApiKeys | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSessions = localStorage.getItem("feto-sessions");
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          if (parsed.length > 0) {
            setSessions(parsed);
            setCurrentSessionId(parsed[0].id);
          }
        } catch {}
      }

      const storedKeys = localStorage.getItem("feto-user-keys");
      if (storedKeys) {
        try {
          setUserKeys(JSON.parse(storedKeys));
        } catch {}
      }

      // Check query params
      if (searchParams.get("upgrade") === "pro") {
        setProModalReason("manual");
        setIsProModalOpen(true);
      }
    }
  }, [searchParams]);

  // Handle URL initial query (e.g. from Landing Hero)
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      const isWeb = searchParams.get("web") === "1";
      const isRag = searchParams.get("rag") === "1";
      const isCode = searchParams.get("code") === "1";

      const newSession: ChatSession = {
        id: generateId("session"),
        title: query.length > 32 ? query.substring(0, 32) + "..." : query,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model: currentModelId,
        messages: [],
      };

      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);

      // Trigger automatic execution
      setTimeout(() => {
        handleSendMessage(query, [], {
          webSearch: isWeb,
          deepRag: isRag,
          codeInterpreter: isCode,
        });
      }, 300);
    }
  }, []);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Auto-scroll on new messages or streaming tokens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: generateId("session"),
      title: "New Research Session",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: currentModelId,
      messages: [],
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    localStorage.setItem("feto-sessions", JSON.stringify(updated));

    if (user && !user.isGuest) {
      persistConversation(user.id, newSession.id, newSession.title).catch(console.warn);
    }
  };

  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
    } else {
      setSessions(remaining);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
      localStorage.setItem("feto-sessions", JSON.stringify(remaining));
    }
  };

  const handleSendMessage = async (
    content: string,
    attachments: FileAttachment[],
    flags: { webSearch: boolean; deepRag: boolean; codeInterpreter: boolean }
  ) => {
    // 1. Multi-Tenant SaaS Credit Rate-Limiting Check (Cost: 1 standard, 2 web/rag, 3 code)
    const cost = flags.codeInterpreter ? 3 : (flags.webSearch || flags.deepRag) ? 2 : 1;
    const creditResult = await checkAndDeductCredit(cost);
    if (!creditResult.allowed) {
      setProModalReason("limit_reached");
      setIsProModalOpen(true);
      return;
    }

    // 2. Prepare User Message
    const userMsg: ChatMessage = {
      id: generateId("msg_u"),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments,
      modeFlags: flags,
    };

    // 3. Prepare Streaming Assistant Placeholder
    const assistantId = generateId("msg_a");
    const initialAssistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      traces: [],
      citations: [],
      isStreaming: true,
      isThinkingOpen: true,
    };

    const updatedMessages = [...currentSession.messages, userMsg, initialAssistantMsg];
    let updatedTitle = currentSession.title;
    if (currentSession.messages.length === 0 && content.trim()) {
      updatedTitle = content.length > 34 ? content.substring(0, 34) + "..." : content;
    }

    const updatedSession: ChatSession = {
      ...currentSession,
      title: updatedTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    const nextSessions = sessions.map((s) =>
      s.id === currentSession.id ? updatedSession : s
    );
    setSessions(nextSessions);
    setIsLoading(true);

    // Persist conversation and user message in Supabase
    if (user && !user.isGuest) {
      persistConversation(user.id, updatedSession.id, updatedSession.title).catch(console.warn);
      persistMessage(updatedSession.id, {
        role: "user",
        content,
        attachments_json: attachments,
      }).catch(console.warn);
    }

    // 4. SSE Stream consumption
    let accumulatedContent = "";
    let accumulatedTraces: string[] = [];
    let accumulatedCitations: WebCitation[] = [];
    let accumulatedDocCitations: DocumentCitation[] = [];
    let executionResult: PythonExecutionResult | undefined = undefined;
    let finalTelemetry: MessageTelemetry | undefined = undefined;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...currentSession.messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          modelId: currentModelId,
          flags,
          attachments,
          userId: user?.id,
          customKeys: userKeys,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Failed to establish stream (status: ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "trace") {
              if (event.step && !accumulatedTraces.includes(event.step)) {
                accumulatedTraces = [...accumulatedTraces, event.step];
              }
            } else if (event.type === "citations") {
              accumulatedCitations = event.data || [];
            } else if (event.type === "document_citations") {
              accumulatedDocCitations = event.data || [];
            } else if (event.type === "code_execution") {
              executionResult = event.data;
            } else if (event.type === "token") {
              accumulatedContent += event.content || "";
            } else if (event.type === "telemetry") {
              const m = event.metrics || {};
              const promptToks = m.promptTokens ?? m.prompt_tokens ?? 120;
              const compToks = m.completionTokens ?? m.completion_tokens ?? accumulatedContent.split(" ").length;
              finalTelemetry = {
                provider: m.provider || (m.model?.includes("Gemini") ? "Google Gemini" : "Groq LPU"),
                model: m.model || "llama-3.3-70b-versatile",
                latencyMs: m.latencyMs ?? m.latency_ms ?? 190,
                ttftMs: m.ttftMs ?? m.ttft_ms ?? 128,
                tokensPerSec: m.tokensPerSec ?? m.tokens_per_sec ?? 520,
                promptTokens: promptToks,
                completionTokens: compToks,
                totalTokens: m.totalTokens ?? m.total_tokens ?? (promptToks + compToks),
                routedVia: m.routedVia ?? m.routed_via ?? "Groq LPU Ultra-Low Latency Inference Pipeline",
                costEstimatedUsd: m.costEstimatedUsd ?? m.cost_estimated_usd ?? 0.0,
                ragDiagnostics: m.ragDiagnostics || m.rag_diagnostics || (accumulatedDocCitations.length > 0 ? accumulatedDocCitations.map((c, i) => ({
                  chunkId: c.chunkId || `chunk_${i + 1}`,
                  documentId: c.documentId,
                  fileName: c.fileName,
                  pageNumber: c.pageNumber,
                  contentSnippet: (c.content || "").slice(0, 150) + "...",
                  cosineSimilarity: c.cosineDistance !== undefined ? Number((1 - c.cosineDistance).toFixed(3)) : 0.884,
                  keywordRank: i + 1,
                  rrfScore: c.rrfScore || 0.032,
                })) : undefined),
              };
              setActiveTelemetry(finalTelemetry);
            } else if (event.type === "done") {
              // stream complete
            }

            // Real-time React state update
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== currentSession.id) return s;
                return {
                  ...s,
                  messages: s.messages.map((msg) => {
                    if (msg.id !== assistantId) return msg;
                    return {
                      ...msg,
                      content: accumulatedContent,
                      traces: accumulatedTraces,
                      citations: accumulatedCitations,
                      documentCitations: accumulatedDocCitations,
                      pythonExecution: executionResult,
                      telemetry: finalTelemetry,
                      isStreaming: true,
                    };
                  }),
                };
              })
            );
          } catch (parseErr) {
            console.warn("SSE frame parse error:", parseErr, jsonStr);
          }
        }
      }

      // Finalize Session after stream finishes
      setSessions((prev) => {
        const finalSessions = prev.map((s) => {
          if (s.id !== currentSession.id) return s;
          return {
            ...s,
            messages: s.messages.map((msg) => {
              if (msg.id !== assistantId) return msg;
              return {
                ...msg,
                content: accumulatedContent,
                traces: accumulatedTraces,
                citations: accumulatedCitations,
                documentCitations: accumulatedDocCitations,
                pythonExecution: executionResult,
                telemetry: finalTelemetry,
                isStreaming: false,
              };
            }),
          };
        });
        localStorage.setItem("feto-sessions", JSON.stringify(finalSessions));
        return finalSessions;
      });

      // Persist completed assistant message to Supabase
      if (user && !user.isGuest) {
        persistMessage(updatedSession.id, {
          role: "assistant",
          content: accumulatedContent,
          citations_json: [...accumulatedCitations, ...accumulatedDocCitations],
          telemetry_json: finalTelemetry || {},
          tool_traces_json: executionResult || {},
        }).catch(console.warn);
      }
    } catch (err) {
      console.error("Chat streaming error:", err);
      // Mark assistant message as finished with error message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSession.id) return s;
          return {
            ...s,
            messages: s.messages.map((msg) => {
              if (msg.id !== assistantId) return msg;
              return {
                ...msg,
                content:
                  accumulatedContent ||
                  "FetoAI experienced an issue establishing the streaming response pipeline. Please verify your connection or model settings and try again.",
                isStreaming: false,
              };
            }),
          };
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCodeInSandbox = async (code: string) => {
    try {
      const res = await fetch("/api/python-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      const sandboxMsg: ChatMessage = {
        id: generateId("msg_sandbox"),
        role: "assistant",
        content: `**FetoAI Python Sandbox Execution Result:**\nExecuted in **${data.executionTimeMs}ms** with exit code 0.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        pythonExecution: {
          code,
          stdout: data.stdout,
          executionTimeMs: data.executionTimeMs,
          chartType: data.chartType,
          chartData: data.chartData,
        },
      };

      const updated = {
        ...currentSession,
        messages: [...currentSession.messages, sandboxMsg],
      };
      setSessions(sessions.map((s) => (s.id === currentSession.id ? updated : s)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenKnowledgeBase={() => setIsKnowledgeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProModal={() => {
          setProModalReason("manual");
          setIsProModalOpen(true);
        }}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Workspace Top Header */}
        <Header
          currentModelId={currentModelId}
          onSelectModel={setCurrentModelId}
          onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
          isTelemetryOpen={isTelemetryOpen}
          currentLatencyMs={activeTelemetry?.latencyMs || 248}
          chatTitle={currentSession?.title}
          onOpenProModal={() => {
            setProModalReason("manual");
            setIsProModalOpen(true);
          }}
        />

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            {currentSession?.messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div className="py-12 sm:py-20 text-center font-sans space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-center">
                  <FetoLogo size="lg" />
                </div>
                <div className="max-w-lg mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
                    Unified Frontier Intelligence
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed">
                    Select an engine or trigger any of the prompt templates below to synthesize research, execute python data models, or audit documents.
                  </p>
                </div>

                {/* Quick Starter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto pt-4 text-left font-mono text-xs">
                  <div
                    onClick={() =>
                      handleSendMessage(
                        "Synthesize latest benchmarks comparing Llama 3.3 70B, DeepSeek-V3, and Claude 3.5 Sonnet",
                        [],
                        { webSearch: true, deepRag: false, codeInterpreter: false }
                      )
                    }
                    className="p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-neutral-500 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 text-black dark:text-white font-medium mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Web Synthesis</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      Compare Llama 3.3, DeepSeek-V3 & Claude 3.5 Sonnet benchmark metrics.
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      handleSendMessage(
                        "Run a python script to simulate our monthly AWS/GCP cloud spend across Compute, Storage and AI clusters",
                        [],
                        { webSearch: false, deepRag: false, codeInterpreter: true }
                      )
                    }
                    className="p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-neutral-500 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 text-black dark:text-white font-medium mb-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Python Sandbox & Charts</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      Simulate cloud compute spend breakdown and visualize monthly bar charts.
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      handleSendMessage(
                        "Audit SOC2 compliance document for data encryption standards in transit and at rest",
                        [],
                        { webSearch: false, deepRag: true, codeInterpreter: false }
                      )
                    }
                    className="p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-neutral-500 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 text-black dark:text-white font-medium mb-1">
                      <Database className="w-3.5 h-3.5" />
                      <span>Hybrid Document RAG</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      Query indexed compliance whitepapers for TLS 1.3 & AES-256 policies.
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      handleSendMessage(
                        "Inspect this architectural diagram and analyze the throughput bottlenecks between ingress and vector DB",
                        [],
                        { webSearch: false, deepRag: false, codeInterpreter: false }
                      )
                    }
                    className="p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-neutral-500 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 text-black dark:text-white font-medium mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Multimodal Vision Audit</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-sans">
                      Attach screenshots, UI diagrams, or scanned PDFs for structural breakdown.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Message List */
              currentSession.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onOpenTelemetry={(tel) => {
                    if (tel) {
                      setActiveTelemetry(tel);
                    } else if (message.telemetry) {
                      setActiveTelemetry(message.telemetry);
                    }
                    setIsTelemetryOpen(true);
                  }}
                  onRunCodeInSandbox={handleRunCodeInSandbox}
                />
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && !currentSession.messages.some((m) => m.isStreaming) && (
              <div className="flex items-center gap-3 py-4 text-xs font-mono text-neutral-500 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                <span>
                  FetoAI synthesizing response via{" "}
                  {currentModelId === "feto-fast"
                    ? "Groq LPU (Llama 3.3)"
                    : currentModelId === "feto-vision"
                    ? "Gemini Multimodal"
                    : currentModelId === "feto-custom"
                    ? "Custom Domain Model"
                    : "Auto-Routing Engine"}
                  ...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Dock */}
        <InputDock
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />

        {/* Telemetry Slide-Out Drawer */}
        <TelemetryDrawer
          isOpen={isTelemetryOpen}
          onClose={() => setIsTelemetryOpen(false)}
          telemetry={activeTelemetry}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(keys) => setUserKeys(keys)}
      />

      <KnowledgeBaseModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />

      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        reason={proModalReason}
      />
    </div>
  );
}

export default function ChatWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-black text-black dark:text-white font-mono text-xs">
          Loading FetoAI Workspace...
        </div>
      }
    >
      <ChatWorkspaceContent />
    </Suspense>
  );
}
