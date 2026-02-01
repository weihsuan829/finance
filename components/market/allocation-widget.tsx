"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AllocationWidgetProps {
    stock: number;
    cash: number;
}

export function AllocationWidget({ stock, cash }: AllocationWidgetProps) {
    const data = [
        { name: "股票部位", value: stock, color: "#6366f1" }, // indigo-500
        { name: "現金/避險", value: cash, color: "#94a3b8" }, // slate-400
    ];

    return (
        <GlassCard className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-white mb-2 self-start w-full">建議資產配置</h3>
            <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                            itemStyle={{ color: "#fff" }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-indigo-400">{stock}%</span>
                    <span className="text-xs text-slate-500">股票</span>
                </div>
            </div>
        </GlassCard>
    );
}
