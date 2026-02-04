"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlassCard } from "@/components/glass/glass-card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";

interface IndicatorHistory {
    date: string;
    value: number;
}

interface IndicatorDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    indicator: {
        name: string;
        code: string;
        description?: string;
        history: IndicatorHistory[];
        unit?: string;
    } | null;
}

export function IndicatorDetailDialog({ open, onOpenChange, indicator }: IndicatorDetailDialogProps) {
    if (!indicator) return null;

    const lastPoint = indicator.history[indicator.history.length - 1];
    const latestDate = lastPoint ? new Date(lastPoint.date).toISOString().split('T')[0].substring(0, 7) : "N/A";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] h-auto bg-white/95 dark:bg-slate-950/90 border-slate-200 dark:border-white/10 backdrop-blur-3xl text-slate-900 dark:text-white shadow-2xl ring-1 ring-white/10">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {indicator.name}
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                            {indicator.code}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-4xl">
                        {indicator.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-[400px]">
                    <GlassCard variant="clean" className="p-6 h-full border-white/5 bg-slate-900/40">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={indicator.history}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getMonth() + 1}/${d.getFullYear().toString().substring(2)}`;
                                    }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => val.toFixed(1)}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", borderRadius: "8px" }}
                                    itemStyle={{ color: "#f8fafc" }}
                                    formatter={(value: number | undefined) => value ? [value.toFixed(2), "數值"] : ["", "數值"]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorVal)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 italic px-2 mt-4 border-t border-white/5 pt-4">
                            <p>* 數據來源：聖路易斯聯儲 FRED。歷史趨勢反映景氣循環動能。</p>
                            <p>註：經濟數據發布通常有 1-2 個月的落後性，此為正常現象。</p>
                        </div>
                    </GlassCard>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-6 mt-4">
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-white/5">
                        <span className="text-xs text-slate-500 font-medium">最新數值 ({latestDate})</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {lastPoint ? lastPoint.value.toFixed(2) : "N/A"}
                            {(indicator.code !== "pmi" && indicator.code !== "confidence") ? "%" : ""}
                        </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-white/5">
                        <span className="text-xs text-slate-500 font-medium">區間最高</span>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            {Math.max(...indicator.history.map(h => h.value)).toFixed(2)}
                            {(indicator.code !== "pmi" && indicator.code !== "confidence") ? "%" : ""}
                        </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-white/5">
                        <span className="text-xs text-slate-500 font-medium">區間最低</span>
                        <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                            {Math.min(...indicator.history.map(h => h.value)).toFixed(2)}
                            {(indicator.code !== "pmi" && indicator.code !== "confidence") ? "%" : ""}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
