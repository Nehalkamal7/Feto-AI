"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Shield, Check, RefreshCw, ExternalLink, Cpu, Brain } from "lucide-react";
import { UserApiKeys } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (keys: UserApiKeys) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"keys" | "custom_model" | "memory">("keys");
  const [keys, setKeys] = useState<UserApiKeys>({
    groqKey: "",
    geminiKey: "",
    tavilyKey: "",
    supabaseUrl: "",
    supabaseKey: "",
    systemMemory: "",
    customModelBaseUrl: "",
    customModelName: "",
    customModelApiKey: "",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("feto-user-keys");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setKeys((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore
        }
      }

      // If user is authenticated, also fetch system memory from Supabase
      if (user && !user.isGuest) {
        const supabase = getSupabaseClient();
        if (supabase) {
          supabase
            .from("user_memory")
            .select("custom_instructions")
            .eq("user_id", user.id)
            .single()
            .then(
              ({ data }) => {
                if (data?.custom_instructions) {
                  setKeys((prev) => ({ ...prev, systemMemory: data.custom_instructions }));
                }
              },
              () => {
                // ignore if user_memory does not exist yet
              }
            );
        }
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async () => {
    localStorage.setItem("feto-user-keys", JSON.stringify(keys));

    // Save to Supabase user_memory if authenticated
    if (user && !user.isGuest && keys.systemMemory !== undefined) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from("user_memory").upsert({
            user_id: user.id,
            custom_instructions: keys.systemMemory,
            updated_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Failed to persist user memory to Supabase:", err);
        }
      }
    }

    setSavedSuccess(true);
    if (onSave) onSave(keys);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    const emptyKeys: UserApiKeys = {
      groqKey: "",
      geminiKey: "",
      tavilyKey: "",
      supabaseUrl: "",
      supabaseKey: "",
      systemMemory: "",
      customModelBaseUrl: "",
      customModelName: "",
      customModelApiKey: "",
    };
    setKeys(emptyKeys);
    localStorage.removeItem("feto-user-keys");
    if (onSave) onSave(emptyKeys);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-2xl font-sans max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white font-sans">
                  Settings & System Memory
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  100% Free-Tier Ready | Multi-Tenant Isolated
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 mt-4 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-mono overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("keys")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors shrink-0 ${activeTab === "keys"
                ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Free-Tier Keys</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom_model")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors shrink-0 ${activeTab === "custom_model"
                ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Custom Model</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("memory")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors shrink-0 ${activeTab === "memory"
                ? "bg-black text-white dark:bg-white dark:text-black font-semibold"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>System Memory</span>
            </button>
          </div>

          {/* Tab 1: API Keys */}
          {activeTab === "keys" && (
            <div className="mt-4 space-y-4 font-mono text-xs overflow-y-auto max-h-[48vh] pr-1">
              <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                  <div>
                    <strong>Zero-Cost Smart Router:</strong> Groq handles primary fast reasoning, Google Gemini handles vision & rate-limit fallback, and DuckDuckGo handles unlimited live search.
                  </div>
                </div>
              </div>

              {/* Groq Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-700 dark:text-neutral-300 font-medium">
                    GROQ_API_KEY (Primary LPU Llama 3.3)
                  </label>
                  <a
                    href="https://console.groq.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    <span>Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={keys.groqKey}
                  onChange={(e) => setKeys({ ...keys, groqKey: e.target.value })}
                  placeholder="gsk_..."
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Gemini Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-700 dark:text-neutral-300 font-medium">
                    GEMINI_API_KEY (Vision & Fallback 2.5 Flash)
                  </label>
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    <span>Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={keys.geminiKey}
                  onChange={(e) => setKeys({ ...keys, geminiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Tavily Key */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-700 dark:text-neutral-300 font-medium">
                    TAVILY_API_KEY (Optional Deep Search Upgrade)
                  </label>
                  <a
                    href="https://tavily.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    <span>Free Tier</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={keys.tavilyKey}
                  onChange={(e) => setKeys({ ...keys, tavilyKey: e.target.value })}
                  placeholder="tvly-... (DuckDuckGo is default free)"
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Supabase */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1 truncate">
                    NEXT_PUBLIC_SUPABASE_URL
                  </label>
                  <input
                    type="text"
                    value={keys.supabaseUrl}
                    onChange={(e) => setKeys({ ...keys, supabaseUrl: e.target.value })}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1 truncate">
                    SUPABASE_ANON_KEY
                  </label>
                  <input
                    type="password"
                    value={keys.supabaseKey}
                    onChange={(e) => setKeys({ ...keys, supabaseKey: e.target.value })}
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Custom Fine-Tuned Model */}
          {activeTab === "custom_model" && (
            <div className="mt-4 space-y-4 font-mono text-xs overflow-y-auto max-h-[48vh] pr-1">
              <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                <div className="flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
                  <div>
                    <strong>Kaggle & Fine-Tuned Model Integration:</strong> Connect any OpenAI-compatible inference endpoint for your fine-tuned weights (Hugging Face Inference Endpoints, Together AI, RunPod vLLM, or Ollama). Select <strong>Custom Fine-Tuned Model</strong> in the top model dropdown to route queries here.
                  </div>
                </div>
              </div>

              {/* Endpoint Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-neutral-500 uppercase">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setKeys({
                      ...keys,
                      customModelBaseUrl: "https://api.together.xyz/v1",
                      customModelName: "togethercomputer/llama-3-8b",
                    })
                  }
                  className="px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-[10px] hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900"
                >
                  Together AI
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setKeys({
                      ...keys,
                      customModelBaseUrl: "https://api-inference.huggingface.co/v1",
                      customModelName: "meta-llama/Meta-Llama-3-8B-Instruct",
                    })
                  }
                  className="px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-[10px] hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900"
                >
                  Hugging Face
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setKeys({
                      ...keys,
                      customModelBaseUrl: "http://localhost:11434/v1",
                      customModelName: "llama3",
                    })
                  }
                  className="px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-800 text-[10px] hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900"
                >
                  Ollama Local
                </button>
              </div>

              {/* CUSTOM_MODEL_BASE_URL */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  CUSTOM_MODEL_BASE_URL (OpenAI-compatible)
                </label>
                <input
                  type="text"
                  value={keys.customModelBaseUrl || ""}
                  onChange={(e) => setKeys({ ...keys, customModelBaseUrl: e.target.value })}
                  placeholder="https://api.together.xyz/v1 or https://xyz.endpoints.huggingface.cloud/v1"
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* CUSTOM_MODEL_NAME */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  CUSTOM_MODEL_NAME (Model ID / Hugging Face repo ID)
                </label>
                <input
                  type="text"
                  value={keys.customModelName || ""}
                  onChange={(e) => setKeys({ ...keys, customModelName: e.target.value })}
                  placeholder="e.g. username/kaggle-finetuned-llama3 or meta-llama/Llama-3-8B"
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* CUSTOM_MODEL_API_KEY */}
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  CUSTOM_MODEL_API_KEY (Bearer Token / HF Token)
                </label>
                <input
                  type="password"
                  value={keys.customModelApiKey || ""}
                  onChange={(e) => setKeys({ ...keys, customModelApiKey: e.target.value })}
                  placeholder="hf_... or tog_... (Optional for local vLLM/Ollama)"
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>
          )}

          {/* Tab 3: System Memory */}
          {activeTab === "memory" && (
            <div className="mt-4 space-y-3 font-sans text-xs">
              <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400">
                Custom instructions entered here are automatically injected into the system prompt for every AI response and stored in your multi-tenant Supabase <code className="px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[11px]">user_memory</code> row.
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-black dark:text-white mb-1.5">
                  Custom Instructions & Role Definition:
                </label>
                <textarea
                  value={keys.systemMemory || ""}
                  onChange={(e) => setKeys({ ...keys, systemMemory: e.target.value })}
                  placeholder="e.g. Always respond with concise executive bullet points. Prioritize TypeScript code examples with strict typing. Keep equations formatted in KaTeX math."
                  rows={6}
                  className="w-full p-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white placeholder:text-neutral-500 font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white leading-relaxed resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-md text-xs font-mono border border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
