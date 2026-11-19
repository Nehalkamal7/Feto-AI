"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MessageSquare,
  Database,
  Key,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Zap,
  Sparkles,
  Shield,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { FetoLogo } from "@/components/brand/FetoLogo";
import { ChatSession } from "@/lib/types";
import { groupSessionsByDate } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenKnowledgeBase: () => void;
  onOpenSettings: () => void;
  onOpenProModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenKnowledgeBase,
  onOpenSettings,
  onOpenProModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = groupSessionsByDate(filteredSessions);

  const isPro = user?.planTier === "pro" || user?.planTier === "enterprise";
  const used = user?.dailyCreditsUsed ?? 0;
  const limit = user?.dailyCreditsLimit ?? (user?.isGuest ? 5 : 15);

  return (
    <aside
      className={`relative z-30 flex flex-col justify-between border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#000000] transition-all duration-200 font-sans ${
        collapsed ? "w-16" : "w-64 sm:w-72"
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2">
              <FetoLogo size="sm" />
            </Link>
          ) : (
            <div className="mx-auto">
              <FetoLogo size="xs" iconOnly />
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1.5 rounded-md text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewChat}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-black dark:text-white font-mono text-xs font-medium transition-colors shadow-sm ${
              collapsed ? "px-0" : ""
            }`}
            title="Start a new chat"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span>New Chat</span>
                <kbd className="text-[10px] text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-1 rounded">
                  Ctrl+K
                </kbd>
              </div>
            )}
          </button>
        </div>

        {/* Search Input (visible when expanded) */}
        {!collapsed && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black text-xs font-mono text-black dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>
        )}

        {/* Knowledge Base Navigation Tab */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onOpenKnowledgeBase}
            className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-md text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title="Open Enterprise Knowledge Base"
          >
            <Database className="w-4 h-4 shrink-0 text-black dark:text-white" />
            {!collapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Knowledge Base</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-300 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                  4 Docs
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Chat History List (Grouped by Date) */}
        {!collapsed && (
          <div className="px-3 py-2 overflow-y-auto max-h-[calc(100vh-390px)] space-y-4">
            {grouped.length === 0 ? (
              <div className="text-center py-6 text-xs text-neutral-500 font-mono">
                No matching chats found
              </div>
            ) : (
              grouped.map(({ group, items }) => (
                <div key={group} className="space-y-1 pb-3 mb-2 border-b border-dashed border-neutral-200 dark:border-neutral-850 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2">
                    {group}
                  </div>
                  {items.map((session) => {
                    const isActive = session.id === currentSessionId;
                    return (
                      <div
                        key={session.id}
                        className={`group relative flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-sans transition-colors cursor-pointer ${
                          isActive
                            ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                        }`}
                        onClick={() => onSelectSession(session.id)}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{session.title}</span>
                        </div>

                        {/* Delete Session Icon on Hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-white dark:hover:text-black transition-opacity"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Section: User Profile, Credits & Settings */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        {/* User Profile Card / Guest Indicator */}
        {!collapsed ? (
          <div className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-bold shrink-0">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-medium text-black dark:text-white truncate">
                  {user?.fullName || user?.email}
                </div>
                <div className="text-[9px] text-neutral-500 uppercase flex items-center gap-1">
                  <span>{user?.isGuest ? "Guest Mode" : `${user?.planTier} plan`}</span>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={signOut}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white"
                title="Sign In"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (!isAuthenticated ? openAuthModal("signin") : signOut())}
            className="w-full p-2 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            title={isAuthenticated ? "Sign Out" : "Sign In"}
          >
            <User className="w-4 h-4" />
          </button>
        )}

        {/* User Credit Counter Badge (Dotted Gray Container) */}
        {!collapsed ? (
          <div
            onClick={onOpenProModal}
            className="p-2.5 rounded-lg border border-dotted border-neutral-400 dark:border-neutral-700 bg-neutral-50 dark:bg-[#070707] cursor-pointer hover:border-black dark:hover:border-white transition-all group"
            title="Click to view upgrade options"
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Zap className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>
                  {isPro
                    ? "FetoAI Pro"
                    : user?.isGuest
                    ? `${used}/${limit} Guest Credits`
                    : `${used}/${limit} Free Credits`}
                </span>
              </span>
              <span className="text-[10px] text-neutral-500 uppercase">
                {isPro ? "UNLIMITED" : "DAILY"}
              </span>
            </div>

            {/* Credit Progress Bar */}
            {!isPro && (
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-black dark:bg-white h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, ((limit - used) / limit) * 100)
                    )}%`,
                  }}
                />
              </div>
            )}

            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
              <span>{isPro ? "Priority LPU" : user?.isGuest ? "5 Free Msgs" : "Resets 24h"}</span>
              <span className="underline group-hover:text-black dark:group-hover:text-white">
                {isPro ? "Manage" : "Upgrade Pro"}
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenProModal}
            className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-800 flex items-center justify-center text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
            title={`${used}/${limit} Credits`}
          >
            <Zap className="w-4 h-4" />
          </button>
        )}

        {/* Settings / API Keys Modal Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-2 py-2 px-2.5 rounded-md text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title="Configure API Keys & Endpoints"
        >
          <Key className="w-4 h-4 shrink-0 text-black dark:text-white" />
          {!collapsed && <span>Settings / API Keys</span>}
        </button>
      </div>
    </aside>
  );
};
