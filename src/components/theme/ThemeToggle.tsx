"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle monochrome color theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-mono transition-colors duration-150 ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-3.5 h-3.5 text-neutral-300" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-neutral-700" />
      )}
      {showLabel && (
        <span className="capitalize">{theme === "dark" ? "Light" : "Dark"}</span>
      )}
    </button>
  );
};
