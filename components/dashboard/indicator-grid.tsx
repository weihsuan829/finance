"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { EconomicIndicator } from "@/lib/indicator/types";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";
import { useState } from "react";
import { IndicatorDetailDialog } from "./indicator-detail-dialog";
import { getIndicatorHistory, IndicatorDetailData } from "@/app/actions/indicators";

interface IndicatorGridProps {
    indicators: EconomicIndicator[];
}

export function IndicatorGrid({ indicators }: IndicatorGridProps) {
    const [selectedIndicator, setSelectedIndicator] = useState<IndicatorDetailData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleClick = async (ind: EconomicIndicator) => {
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

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {indicators.map((ind) => (
                    <GlassCard
                        key={ind.id}
                        variant="clean"
                        className="p-5 flex flex-col gap-4 group hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer border-transparent hover:border-indigo-500/30"
                        onClick={() => handleClick(ind)}
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 uppercase font-mono">{ind.lastUpdated}</span>
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
                            </div>
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors flex items-center gap-2">
                                {ind.name}
                                {loadingId === ind.id && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                            </h4>
                        </div>

                        <div className="flex items-end justify-between mt-auto">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {ind.value}{(ind.id !== "pmi" && ind.id !== "confidence") ? "%" : ""}
                                </span>
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-mono font-bold",
                                    ind.change > 0 ? "text-emerald-500" : ind.change < 0 ? "text-rose-500" : "text-slate-400"
                                )}>
                                    {ind.change > 0 ? <ArrowUp className="w-3 h-3" /> : ind.change < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                    {Math.abs(ind.change)}%
                                </div>
                            </div>
                        </div>

                        {/* @ts-ignore */}
                        {ind.explanation && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 pt-3 italic leading-relaxed">
                                {/* @ts-ignore */}
                                {ind.explanation}
                            </p>
                        )}
                    </GlassCard>
                ))}
            </div>

            <IndicatorDetailDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                indicator={selectedIndicator}
            />
        </>
    );
}
