"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CyclePhase } from "@/lib/indicator/types";
import { TrendingUp, TrendingDown, Activity, RefreshCcw } from "lucide-react";

interface MacroScoreCardProps {
    score: number;
    phase: CyclePhase;
    phaseLabel: string;
    summary: string;
}

export function MacroScoreCard({ score, phase, phaseLabel, summary }: MacroScoreCardProps) {
    // Determine color based on score/phase
    const getColor = () => {
        if (phase === "expansion") return "text-emerald-400";
        if (phase === "recovery") return "text-blue-400";
        if (phase === "slowdown") return "text-amber-400";
        return "text-rose-400";
    };

    const getIcon = () => {
        if (phase === "expansion") return TrendingUp;
        if (phase === "recovery") return RefreshCcw;
        if (phase === "slowdown") return Activity;
        return TrendingDown;
    };

    const Icon = getIcon();
    const colorClass = getColor();

    // Simple Gauge Calculation
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <GlassCard variant="hero" className="p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden ring-1 ring-white/5">
            {/* Background Glow */}
            <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none",
                phase === "expansion" ? "bg-emerald-500" :
                    phase === "recovery" ? "bg-blue-500" :
                        phase === "slowdown" ? "bg-amber-500" : "bg-rose-500"
            )} />

            {/* Gauge Section */}
            <div className="relative flex-shrink-0">
                <svg className="w-40 h-40 -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-800"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={cn("transition-all duration-1000 ease-out", colorClass)}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-4xl font-bold tab-nums", colorClass)}>{score}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Macro Score</span>
                </div>
            </div>

            {/* Text Info Section */}
            <div className="flex-1 text-center md:text-left z-10">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <Badge variant="outline" className={cn("border-2 px-3 py-1 text-base capitalize backdrop-blur-md",
                        phase === "expansion" ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10" :
                            phase === "recovery" ? "border-blue-500/50 text-blue-600 dark:text-blue-300 bg-blue-500/10" :
                                phase === "slowdown" ? "border-amber-500/50 text-amber-600 dark:text-amber-300 bg-amber-500/10" :
                                    "border-rose-500/50 text-rose-600 dark:text-rose-300 bg-rose-500/10"
                    )}>
                        <Icon className="w-4 h-4 mr-2" />
                        {phaseLabel}
                    </Badge>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {score >= 70 ? "景氣強勁擴張中" :
                        score >= 50 ? "景氣穩定復甦與成長" :
                            score >= 30 ? "景氣正值轉折打底" :
                                "景氣處於深度衰退"}
                </h2>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mb-6">
                    {summary}
                </p>

                {/* Score Range Explanation Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
                    {[
                        { range: "0-30", name: "深度衰退", desc: "經濟全面收縮，痛苦但孕育長線價值。" },
                        { range: "30-50", name: "衰退末期", desc: "風險大幅釋放，等待領先指標翻紅。" },
                        { range: "50-70", name: "復甦成長", desc: "獲利回溫，回檔屬健康的趨勢修正。" },
                        { range: "70-100", name: "擴張過熱", desc: "數據亮眼但動能放緩，提防劇烈波動。" },
                    ].map((item) => (
                        <div key={item.range} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{item.range}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}
