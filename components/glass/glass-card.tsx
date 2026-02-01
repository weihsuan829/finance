import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "clean" | "hero";
  hoverEffect?: boolean;
}

export function GlassCard({
  className,
  variant = "default",
  hoverEffect = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300 ease-out",

        // --- Light Mode Defaults (White Frost) ---
        "bg-white/60 border border-slate-200/50 backdrop-blur-md shadow-sm",

        // --- Dark Mode Overrides (Deep Slate Glass) ---
        "dark:bg-slate-900/40 dark:border-white/15 dark:shadow-lg dark:shadow-black/40",

        // Variant: Default
        variant === "default" && "shadow-slate-200/50 dark:shadow-black/40",

        // Variant: Hero (More transparent, blurrier)
        variant === "hero" &&
        "bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl border-slate-200/60 dark:border-white/15 shadow-xl shadow-slate-300/50 dark:shadow-black/50",

        // Variant: Clean (Simpler)
        variant === "clean" &&
        "bg-white/40 dark:bg-slate-900/30 border-slate-200/40 dark:border-white/10 shadow-sm",

        // Hover Effects (Dual Mode)
        hoverEffect && [
          "hover:scale-[1.01]",
          // Light Hover
          "hover:bg-white/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-300/40",
          // Dark Hover
          "dark:hover:bg-slate-900/50 dark:hover:border-white/25 dark:hover:shadow-black/50"
        ],

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
