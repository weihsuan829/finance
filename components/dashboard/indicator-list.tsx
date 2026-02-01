"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { EconomicIndicator } from "@/lib/indicator/types";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { useState } from "react";
import { IndicatorDetailDialog } from "./indicator-detail-dialog";
import { getIndicatorHistory, IndicatorDetailData } from "@/app/actions/indicators";

interface IndicatorListProps {
    title: string;
    indicators: EconomicIndicator[];
    color?: "blue" | "indigo" | "purple";
}

export function IndicatorList({ title, indicators, color = "indigo" }: IndicatorListProps) {
    const [selectedIndicator, setSelectedIndicator] = useState<IndicatorDetailData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleClick = async (ind: EconomicIndicator) => {
        // Immediate visual feedback
        setLoadingId(ind.id);

        try {
            const data = await getIndicatorHistory(ind.id);

            if (data) {
                setSelectedIndicator(data);
                setIsOpen(true);
            }
        } catch (e: any) {
            console.error("Indicator click failed", e);
        } finally {
            setLoadingId(null);
        }
    };

    const getBlockDesc = () => {
        if (title.includes("領先")) return "預判景氣轉折的訊號燈，幫助你決定下一步的資產水位。";
        if (title.includes("同步")) return "反映實體經濟的當下溫度，確認你是否正處於成長趨勢中。";
        return "最後的確認機制，通常在景氣反轉後才確立長期趨勢。";
    };

    return (
        <>
            <div className="space-y-3">
                <div className="px-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{getBlockDesc()}</p>
                </div>
                <div className="grid gap-3">
                    {indicators.map((ind) => (
                        <GlassCard
                            key={ind.id}
                            variant="clean"
                            className="p-4 flex flex-col gap-3 group hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer border-transparent hover:border-indigo-500/30"
                            onClick={() => handleClick(ind)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors flex items-center gap-2">
                                        {ind.name}
                                        {loadingId === ind.id && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                                        {/* @ts-ignore */}
                                        {ind.heatLabel && (
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                                // @ts-ignore
                                                ind.heatLabel.includes("強") ? "bg-emerald-500/10 text-emerald-500" :
                                                    // @ts-ignore
                                                    ind.heatLabel.includes("弱") ? "bg-rose-500/10 text-rose-500" :
                                                        "bg-slate-500/10 text-slate-500"
                                            )}>
                                                {/* @ts-ignore */}
                                                {ind.heatLabel}
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-mono">{ind.lastUpdated}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            {ind.value}{(ind.id !== "pmi" && ind.id !== "confidence") ? "%" : ""}
                                        </span>
                                        {ind.direction === "up" ? (
                                            <ArrowUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                        ) : ind.direction === "down" ? (
                                            <ArrowDown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                                        ) : (
                                            <Minus className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-[10px] font-mono",
                                        ind.change > 0 ? "text-emerald-600 dark:text-emerald-400" : ind.change < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"
                                    )}>
                                        {ind.change > 0 ? "+" : ""}{ind.change}%
                                    </p>
                                </div>
                            </div>

                            {/* @ts-ignore */}
                            {ind.explanation && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 pt-2 italic leading-relaxed">
                                    {/* @ts-ignore */}
                                    {ind.explanation}
                                </p>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>

            <IndicatorDetailDialog
                open={isOpen}
                onOpenChange={(v) => {
                    setIsOpen(v);
                }}
                indicator={selectedIndicator}
            />
        </>
    );
}
