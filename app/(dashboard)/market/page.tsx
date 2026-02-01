"use client";

import { useState } from "react";
import { RiskCard } from "@/components/market/risk-card";
import { AllocationWidget } from "@/components/market/allocation-widget";
import { GlassCard } from "@/components/glass/glass-card";
import { getMarketIndices } from "@/lib/data/market";
import { MacroScoringEngine } from "@/lib/indicator/macro-engine";
import { TechnicalScoringEngine } from "@/lib/indicator/technical-engine";
import { EntrySignalEngine } from "@/lib/indicator/entry-engine";
import { getAllIndicators } from "@/lib/data/economic";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

export default function MarketPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // 1. Get Macro Data & Score
    const indicators = getAllIndicators();
    const macroResult = MacroScoringEngine.calculateScore(indicators);

    // 2. Get Market Data
    const indices = getMarketIndices();

    // 3. Process Each Index through Engines
    const analyzedIndices = indices.map((idx) => {
        const techResult = TechnicalScoringEngine.analyze(idx.history);
        const signal = EntrySignalEngine.evaluate(macroResult, techResult);
        return {
            ...idx,
            techResult,
            signal,
        };
    });

    const selectedAsset = analyzedIndices[selectedIndex];

    // Helper for mock chart data format
    const chartData = selectedAsset.history.slice(-30).map((price, i) => ({
        day: i,
        price,
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">市場風險與進出場建議</h1>
                <p className="text-slate-400 mt-1">結合景氣位階與技術面分析的綜合評估</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Overall Allocation */}
                <div className="lg:col-span-3">
                    <AllocationWidget
                        stock={selectedAsset.signal.allocationSuggestion}
                        cash={100 - selectedAsset.signal.allocationSuggestion}
                    />
                    <div className="mt-4">
                        <GlassCard className="p-4 bg-slate-900/40">
                            <h4 className="text-sm font-semibold text-slate-400 mb-2">策略邏輯</h4>
                            <p className="text-sm text-slate-300">
                                目前景氣評分 {macroResult.totalScore} ({macroResult.phaseLabel})。<br />
                                {selectedAsset.name} 技術面評分 {selectedAsset.techResult.score}。
                            </p>
                        </GlassCard>
                    </div>
                </div>

                {/* Right: Index Cards */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {analyzedIndices.map((item, idx) => (
                        <RiskCard
                            key={item.symbol}
                            onClick={() => setSelectedIndex(idx)}
                            name={item.name}
                            symbol={item.symbol}
                            price={item.price}
                            change={item.change}
                            riskLevel={item.signal.riskLevel}
                            suggestionRatio={item.signal.allocationSuggestion}
                            summary={item.signal.reasoning}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Section (Collapsible or always visible) */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    {selectedAsset.name} 技術分析詳情
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="day" hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#6366f1" fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAsset.techResult.signals.map((sig, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <span className={cn("w-2 h-2 rounded-full", sig.signal === "bullish" ? "bg-emerald-500" : sig.signal === "bearish" ? "bg-rose-500" : "bg-amber-500")}></span>
                            {sig.name} ({sig.signal})
                        </div>
                    ))}
                    {selectedAsset.techResult.signals.length === 0 && (
                        <p className="text-slate-500 text-sm">無顯著技術訊號</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
