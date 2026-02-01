"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2 } from "lucide-react";
import { getWatchlistAssets } from "@/lib/data/market";
import { MacroScoringEngine } from "@/lib/indicator/macro-engine";
import { TechnicalScoringEngine } from "@/lib/indicator/technical-engine";
import { EntrySignalEngine } from "@/lib/indicator/entry-engine";
import { getAllIndicators } from "@/lib/data/economic";
import { cn } from "@/lib/utils";

export default function WatchlistPage() {
    // Mock Data Logic
    const indicators = getAllIndicators();
    const macroResult = MacroScoringEngine.calculateScore(indicators);

    // Initial Assets
    const [assets, setAssets] = useState(getWatchlistAssets());
    const [searchTerm, setSearchTerm] = useState("");

    const processAsset = (asset: any) => {
        const techResult = TechnicalScoringEngine.analyze(asset.history);
        const signal = EntrySignalEngine.evaluate(macroResult, techResult);
        return { ...asset, techResult, signal };
    };

    const processedAssets = assets.map(processAsset);

    const handleAdd = () => {
        if (!searchTerm) return;
        // Mock add
        const newAsset = {
            symbol: searchTerm.toUpperCase(),
            name: searchTerm.toUpperCase(),
            type: "Stock",
            history: Array(60).fill(0).map(() => Math.random() * 100 + 50)
        };
        setAssets([...assets, newAsset]);
        setSearchTerm("");
    };

    const handleRemove = (symbol: string) => {
        setAssets(assets.filter(a => a.symbol !== symbol));
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">自選觀察清單 (Watchlist)</h1>
                <p className="text-slate-400 mt-1">即時監控標的進場訊號</p>
            </div>

            {/* Input Section */}
            <GlassCard variant="clean" className="p-4 flex gap-4 max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="輸入代號或名稱 (例如: AAPL, 2330)"
                        className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                </div>
                <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> 加入清單
                </Button>
            </GlassCard>

            {/* Table Section */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-sm">
                                <th className="p-4 font-medium">標的 (Symbol)</th>
                                <th className="p-4 font-medium">類型</th>
                                <th className="p-4 font-medium">技術評分</th>
                                <th className="p-4 font-medium">進場總分</th>
                                <th className="p-4 font-medium">建議操作</th>
                                <th className="p-4 font-medium text-right">管理</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {processedAssets.map((asset) => (
                                <tr key={asset.symbol} className="border-b border-white/5 hover:bg-slate-800/40 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold">{asset.name}</div>
                                        <div className="text-xs text-slate-400">{asset.symbol}</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="border-white/10 text-slate-300">{asset.type}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono">{asset.techResult.score}</span>
                                            <div className={cn("w-2 h-2 rounded-full", asset.techResult.trend === "bullish" ? "bg-emerald-500" : asset.techResult.trend === "bearish" ? "bg-rose-500" : "bg-amber-500")}></div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn("text-lg font-bold",
                                            asset.signal.entryScore >= 75 ? "text-emerald-400" :
                                                asset.signal.entryScore <= 30 ? "text-rose-400" : "text-slate-200"
                                        )}>
                                            {asset.signal.entryScore}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Badge className={cn("capitalize min-w-[80px] justify-center",
                                            asset.signal.action === "buy" ? "bg-emerald-500 hover:bg-emerald-600" :
                                                asset.signal.action === "sell" ? "bg-rose-500 hover:bg-rose-600" :
                                                    asset.signal.action === "accumulate" ? "bg-indigo-500 hover:bg-indigo-600" :
                                                        "bg-slate-600 hover:bg-slate-500"
                                        )}>
                                            {asset.signal.action === "buy" ? "積極進場" :
                                                asset.signal.action === "accumulate" ? "分批佈局" :
                                                    asset.signal.action === "sell" ? "保守退場" :
                                                        asset.signal.action === "reduce" ? "減碼" : "觀望"}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemove(asset.symbol)} className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {processedAssets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        目前清單為空，請由上方加入關注標的。
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
