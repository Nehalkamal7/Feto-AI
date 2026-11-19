"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Paperclip,
  Globe,
  Database,
  Terminal,
  X,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { FileAttachment } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface InputDockProps {
  onSendMessage: (
    content: string,
    attachments: FileAttachment[],
    flags: {
      webSearch: boolean;
      deepRag: boolean;
      codeInterpreter: boolean;
    }
  ) => void;
  isLoading: boolean;
  initialPrompt?: string;
  initialFlags?: {
    webSearch?: boolean;
    deepRag?: boolean;
    codeInterpreter?: boolean;
  };
}

export const InputDock: React.FC<InputDockProps> = ({
  onSendMessage,
  isLoading,
  initialPrompt = "",
  initialFlags,
}) => {
  const [content, setContent] = useState(initialPrompt);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [webSearch, setWebSearch] = useState(initialFlags?.webSearch ?? true);
  const [deepRag, setDeepRag] = useState(initialFlags?.deepRag ?? false);
  const [codeInterpreter, setCodeInterpreter] = useState(
    initialFlags?.codeInterpreter ?? false
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialPrompt if passed in query
  useEffect(() => {
    if (initialPrompt) {
      setContent(initialPrompt);
    }
  }, [initialPrompt]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        220,
        Math.max(52, textareaRef.current.scrollHeight)
      )}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!content.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage(content, attachments, {
      webSearch,
      deepRag,
      codeInterpreter,
    });

    setContent("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith("image/");
      const isText = file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv");
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          dataUrl: isImg || !isText ? result : undefined,
          textPreview: isText ? result.substring(0, 3000) : undefined,
        };
        setAttachments((prev) => [...prev, newAttachment]);
        // Auto-enable Deep RAG when documents are attached
        if (!isImg) {
          setDeepRag(true);
        }
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const getFileIcon = (name: string, type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />;
    }
    if (name.endsWith(".xlsx") || name.endsWith(".csv")) {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-t from-white via-white dark:from-black dark:via-black to-transparent">
      <div className="max-w-4xl mx-auto rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl transition-all focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white">
        {/* Attachment preview chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 font-mono text-xs text-black dark:text-white"
              >
                {file.dataUrl ? (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  getFileIcon(file.name, file.type)
                )}
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {file.name}
                </span>
                <span className="text-[10px] text-neutral-500">
                  ({formatBytes(file.size)})
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input Row */}
        <div className="flex items-end gap-2 p-3">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            title="Attach documents or images (PDF, DOCX, TXT, CSV, XLSX, PNG, JPG)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Auto-expanding Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FetoAI anything... (Shift+Enter for newline, Enter to send)"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm sm:text-base text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none resize-none py-1.5 font-sans leading-relaxed max-h-[220px]"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!content.trim() && attachments.length === 0) || isLoading}
            className="p-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0 shadow-sm"
            title="Execute prompt"
          >
            {isLoading ? (
              <span className="animate-spin inline-block text-[13px] leading-none select-none">◴</span>
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Interactive Capability Toggle Pills with Inverted Contrast Selected States */}
        <div className="px-3 pb-3 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-850 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pill 1: Web Search */}
            <button
              type="button"
              onClick={() => setWebSearch(!webSearch)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                webSearch
                  ? "bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white font-bold shadow-xs"
                  : "bg-transparent text-neutral-500 hover:text-black dark:hover:text-white border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Web Search</span>
            </button>

            {/* Pill 2: Deep RAG */}
            <button
              type="button"
              onClick={() => setDeepRag(!deepRag)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                deepRag
                  ? "bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white font-bold shadow-xs"
                  : "bg-transparent text-neutral-500 hover:text-black dark:hover:text-white border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white"
              }`}
            >
              <Database className="w-3 h-3" />
              <span>Deep RAG</span>
            </button>

            {/* Pill 3: Code Interpreter */}
            <button
              type="button"
              onClick={() => setCodeInterpreter(!codeInterpreter)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                codeInterpreter
                  ? "bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white font-bold shadow-xs"
                  : "bg-transparent text-neutral-500 hover:text-black dark:hover:text-white border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white"
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Code Interpreter</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 hidden sm:block">
            Strictly Private &bull; 0-Retention
          </div>
        </div>
      </div>
    </div>
  );
};
