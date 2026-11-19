import React from "react";

interface FetoLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  iconOnly?: boolean;
  badge?: string;
}

export const FetoLogo: React.FC<FetoLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
  iconOnly = false,
  badge,
}) => {
  const sizeMap = {
    xs: { icon: 18, box: 24, text: "text-sm", pill: "text-[9px] px-1 py-0.2" },
    sm: { icon: 22, box: 28, text: "text-base", pill: "text-[10px] px-1.5 py-0.2" },
    md: { icon: 26, box: 34, text: "text-lg", pill: "text-[10px] px-1.5 py-0.5" },
    lg: { icon: 32, box: 40, text: "text-xl", pill: "text-[11px] px-2 py-0.5" },
    xl: { icon: 42, box: 52, text: "text-2xl", pill: "text-xs px-2.5 py-1" },
  };

  const { icon: px, box, text: textSize, pill: pillClass } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Architectural 3D Isometric Cube/Prism 'F' Mark */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-lg p-1 bg-black text-white dark:bg-white dark:text-black border border-neutral-900 dark:border-neutral-100 shadow-xs transition-transform duration-150 hover:scale-[1.02]"
        style={{ width: box, height: box }}
      >
        <svg
          width={px}
          height={px}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current transition-colors"
        >
          {/* Architectural 3D Isometric Cube Facets forming 'F' */}
          {/* 1. Top isometric plane of upper arm */}
          <polygon
            points="14,4 28,4 34,9 20,9"
            fill="currentColor"
            fillOpacity="0.95"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* 2. Front isometric plane of upper arm */}
          <polygon
            points="20,9 34,9 34,14 20,14"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* 3. Top isometric plane of middle crossbar */}
          <polygon
            points="14,17 24,17 28,21 18,21"
            fill="currentColor"
            fillOpacity="0.9"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* 4. Front isometric plane of middle crossbar */}
          <polygon
            points="18,21 28,21 28,25 18,25"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* 5. Main vertical architectural spine - Left isometric facet */}
          <polygon
            points="8,9 14,4 14,35 8,30"
            fill="currentColor"
            fillOpacity="1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* 6. Main vertical architectural spine - Front facet */}
          <polygon
            points="14,4 20,9 20,35 14,35"
            fill="currentColor"
            fillOpacity="0.65"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* 7. Precision geometric structural wireframe accent lines */}
          <line x1="8" y1="9" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="4" x2="28" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="28" y1="4" x2="34" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="34" y1="9" x2="34" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="34" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="14" x2="20" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="35" x2="14" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="35" x2="8" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="30" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Wordmark & Inline "AI" Pill Badge */}
      {showText && !iconOnly && (
        <div className="flex items-center gap-1.5">
          {/* Bold "Feto" Lettering */}
          <span
            className={`font-bold tracking-tight text-black dark:text-white ${textSize} font-sans`}
          >
            Feto
          </span>

          {/* Sharp, Rounded Inline "AI" Pill Badge */}
          <span
            className={`inline-flex items-center justify-center font-mono font-extrabold uppercase rounded-md border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black tracking-widest leading-none ${pillClass}`}
          >
            AI
          </span>

          {badge && (
            <span className="ml-1 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border border-dotted border-neutral-400 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
