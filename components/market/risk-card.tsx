"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/indicator/types";
import { AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";

interface RiskCardProps {
    name: string;
    symbol: string;
    riskLevel: RiskLevel;
    price: number;
    change: number;
    suggestionRatio: number; // 0-100
    summary: string;
    onClick?: () => void;
}

export function RiskCard({
    name,
    symbol,
    riskLevel,
    price,
    change,
    suggestionRatio,
    summary,
    onClick
}: RiskCardProps) {

    const getRiskColor = () => {
        if (riskLevel === "positive") return "emerald";
        if (riskLevel === "conservative") return "rose";
        return "amber";
    };

    const color = getRiskColor();
    const Icon = riskLevel === "positive" ? CheckCircle : riskLevel === "conservative" ? AlertTriangle : MinusCircle;

    return (
        <GlassCard
            onClick={onClick}
            hoverEffect={true}
            className="p-6 cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{symbol}</span>
                </div>
                <Badge variant="outline" className={cn(
                    "capitalize pl-1 pr-3 py-1 flex items-center gap-1",
                    riskLevel === "positive" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
                        riskLevel === "conservative" ? "border-rose-500/50 text-rose-400 bg-rose-500/10" :
                            "border-amber-500/50 text-amber-400 bg-amber-500/10"
                )}>
                    <Icon className="w-3 h-3" />
                    {riskLevel === "positive" ? "偏多操作" : riskLevel === "conservative" ? "保守觀望" : "區間操作"}
                </Badge>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold text-white">{price.toLocaleString()}</span>
                <span className={cn("text-sm font-medium", change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {change > 0 ? "+" : ""}{change}%
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>建議持股水位</span>
                    <span className="text-slate-200">{suggestionRatio}%</span>
                </div>
                <Progress value={suggestionRatio} className={cn("h-2",
                    riskLevel === "positive" ? "bg-emerald-950 [&>div]:bg-emerald-500" :
                        riskLevel === "conservative" ? "bg-rose-950 [&>div]:bg-rose-500" :
                            "bg-amber-950 [&>div]:bg-amber-500"
                )} />
            </div>

            <p className="text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                {summary}
            </p>
        </GlassCard>
    );
}
