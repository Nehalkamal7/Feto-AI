"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Activity,
  Zap,
  Sparkles,
  Eye,
  Cpu,
  Layers,
  Check,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ModelId, ModelOption } from "@/lib/types";
import { AVAILABLE_MODELS } from "@/lib/mockData";

interface HeaderProps {
  currentModelId: ModelId;
  onSelectModel: (id: ModelId) => void;
  onToggleTelemetry: () => void;
  isTelemetryOpen: boolean;
  currentLatencyMs?: number;
  chatTitle?: string;
  onOpenProModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModelId,
  onSelectModel,
  onToggleTelemetry,
  isTelemetryOpen,
  currentLatencyMs = 248,
  chatTitle = "New Research Session",
  onOpenProModal,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === currentModelId) || AVAILABLE_MODELS[0];

  const getModelIcon = (id: ModelId, className = "w-3.5 h-3.5") => {
    switch (id) {
      case "feto-fast":
        return <Zap className={className} />;
      case "feto-vision":
        return <Eye className={className} />;
      case "feto-custom":
        return <Cpu className={className} />;
      case "feto-auto":
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md flex items-center justify-between z-20 font-sans">
      {/* Left: Chat Session Title */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-black dark:text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
          {chatTitle}
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-dotted border-neutral-400 dark:border-neutral-700 text-neutral-500 bg-neutral-50 dark:bg-[#0A0A0A]">
          <ShieldCheck className="w-3 h-3 text-neutral-400" />
          AES-256 Active
        </span>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Smart Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#0D0D0D] dark:hover:bg-[#171717] text-xs font-mono text-black dark:text-white transition-colors"
          >
            {getModelIcon(currentModel.id)}
            <span className="font-medium hidden xs:inline">{currentModel.name}</span>
            <span className="text-[10px] text-neutral-500 uppercase px-1 py-0.2 rounded border border-neutral-200 dark:border-neutral-800">
              {currentModel.badge}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          </button>

          {/* Dropdown Menu */}
          {modelDropdownOpen && (
            <div className="absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-[#050505] p-2 shadow-2xl z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 text-[10px] uppercase text-neutral-500 font-semibold tracking-wider border-b border-dashed border-neutral-200 dark:border-neutral-800">
                Inference Engines
              </div>
              <div className="mt-1 space-y-1">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = model.id === currentModelId;
                  return (
                    <div
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white font-semibold shadow-xs"
                          : "border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#0E0E0E]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-medium">
                          {getModelIcon(model.id)}
                          <span>{model.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`text-[11px] font-sans leading-tight ${
                          isSelected
                            ? "text-neutral-300 dark:text-neutral-700"
                            : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {model.description}
                      </div>

                      <div
                        className={`mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t ${
                          isSelected
                            ? "border-neutral-800 dark:border-neutral-200 text-neutral-300 dark:text-neutral-700"
                            : "border-neutral-100 dark:border-neutral-900 text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        <span>Speed: {model.speed}</span>
                        <span>Ctx: {model.contextWindow}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Drawer Toggle Button */}
        <button
          type="button"
          onClick={onToggleTelemetry}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
            isTelemetryOpen
              ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-xs"
              : "border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/60 hover:bg-neutral-200 dark:bg-[#0A0A0A] dark:hover:bg-[#121212] text-neutral-800 dark:text-neutral-200"
          }`}
          title="Toggle Inference Telemetry Drawer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{currentLatencyMs}ms</span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <ThemeToggle />

        {/* Pro Plan Trigger */}
        <button
          type="button"
          onClick={onOpenProModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:opacity-90 transition-all shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Pro</span>
        </button>
      </div>
    </header>
  );
};
