"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Database,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Search,
  Sparkles,
  Layers,
  BookOpen,
} from "lucide-react";
import { KnowledgeDocument } from "@/lib/types";
import { INITIAL_KNOWLEDGE_DOCS } from "@/lib/mockData";
import { useAuth } from "@/lib/authContext";

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<KnowledgeDocument[]>(INITIAL_KNOWLEDGE_DOCS);
  const [searchTest, setSearchTest] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const url = user?.id ? `/api/knowledge?userId=${user.id}` : "/api/knowledge";
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data?.documents && data.documents.length > 0) {
            setDocs(data.documents);
          }
        })
        .catch(() => { });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (user?.id) formData.append("userId", user.id);

      const res = await fetch("/api/knowledge", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.document) {
        setDocs((prev) => [data.document, ...prev]);
      }
    } catch (err) {
      console.warn("Upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const url = user?.id ? `/api/knowledge?id=${id}&userId=${user.id}` : `/api/knowledge?id=${id}`;
      await fetch(url, { method: "DELETE" });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTest.trim()) return;

    setIsSearching(true);
    try {
      const url = user?.id
        ? `/api/knowledge?search=${encodeURIComponent(searchTest)}&userId=${user.id}`
        : `/api/knowledge?search=${encodeURIComponent(searchTest)}`;
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.warn("Search test error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const getDocIcon = (type: string) => {
    if (type === "xlsx" || type === "csv") {
      return <FileSpreadsheet className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
    }
    return <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-2xl font-sans max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black dark:text-white font-sans">
                Enterprise Knowledge Base & Vector RAG
              </h3>
              <p className="text-xs text-neutral-500 font-mono">
                {docs.length} Indexed Documents | Supabase pgvector Compatible
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-neutral-50 dark:bg-neutral-900/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 mx-auto text-neutral-500 mb-2" />
            <div className="text-xs font-mono font-medium text-black dark:text-white">
              {isUploading ? "Chunking & Vectorizing (all-MiniLM-L6-v2)..." : "Drop PDF, DOCX, TXT, MD, or CSV files here"}
            </div>
            <div className="text-[11px] text-neutral-500 font-mono mt-1">
              Recursive Semantic Chunking (800 chars / 150 overlap) &bull; 384-dim Local Vectors &bull; Supabase pgvector
            </div>
          </div>

          {/* Hybrid RAG Diagnostic & Search Test */}
          <form onSubmit={handleTestSearch} className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50">
            <div className="text-[11px] font-mono font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Hybrid Vector + Keyword Diagnostic (RRF)</span>
              </span>
              <span className="text-[10px] text-neutral-400">pgvector &lt;=&gt; + ts_rank</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTest}
                onChange={(e) => setSearchTest(e.target.value)}
                placeholder="Test query (e.g. data encryption standards, TLS policies)..."
                className="flex-1 px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black text-xs font-mono text-black dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-3 py-1.5 rounded-md bg-black text-white dark:bg-white dark:text-black text-xs font-mono hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Test RRF Match"}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                <div className="text-[10px] uppercase font-mono text-neutral-500 font-bold">
                  Top {searchResults.length} Grounded Semantic Chunks:
                </div>
                {searchResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                      <span className="font-bold text-black dark:text-white">
                        {r.badgeText || `[${r.fileName} - Page ${r.pageNumber}]`}
                      </span>
                      <span>RRF Score: {r.rrfScore || "0.0328"}</span>
                    </div>
                    <p className="font-sans text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {r.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Document Table */}
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Active Vector Stores
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-black">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 flex items-center justify-between text-xs font-mono hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getDocIcon(doc.type)}
                    <div className="truncate">
                      <div className="font-medium text-black dark:text-white truncate">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span>{doc.size}</span>
                        <span>&bull;</span>
                        <span>{doc.chunkCount} chunks</span>
                        <span>&bull;</span>
                        <span className="text-neutral-400">{doc.vectorId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>Ready</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                      title="Remove from knowledge base"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between font-mono text-xs">
          <span className="text-neutral-500 text-[11px]">
            Embeddings: all-MiniLM-L6-v2 (384-dim) &bull; Zero API Cost
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black font-medium text-xs hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
