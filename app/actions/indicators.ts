"use server";

import prisma from "@/lib/prisma";
import { MacroScoringEngine } from "@/lib/indicator/macro-engine";
import { IndicatorNormalizer } from "@/lib/indicator/normalizer";

export interface IndicatorDetailData {
    name: string;
    code: string;
    description?: string;
    history: { date: string; value: number }[];
    unit?: string;
}

export async function getIndicatorHistory(id: string): Promise<IndicatorDetailData | null> {
    // 1. Try DB Fetch
    if (prisma) {
        try {
            const indicator = await prisma.indicator.findFirst({
                where: { OR: [{ id }, { code: id }] },
                include: {
                    values: {
                        orderBy: { date: "asc" },
                        take: 24, // Last 2 years
                    },
                },
            });

            if (indicator && indicator.values.length > 0) {
                const history = indicator.values.map((v: any, index: number) => {
                    // Calculate YoY growth for this point if possible
                    // Requires finding the value from 12 entries back
                    const targetDate = new Date(v.date);
                    targetDate.setFullYear(targetDate.getFullYear() - 1);

                    // This is a naive lookup in the already fetched array (if it has enough points)
                    // Since we take 24, we can do YoY for the latest 12.
                    const prevYearPoint = indicator.values.find((pv: any) =>
                        new Date(pv.date).getMonth() === targetDate.getMonth() &&
                        new Date(pv.date).getFullYear() === targetDate.getFullYear()
                    );

                    let displayValue = v.value;
                    if (indicator.code === "pmi") {
                        // Consistently apply the +50 shift for OECD proxy
                        displayValue = parseFloat((50 + v.value).toFixed(2));
                    } else if (indicator.code !== "confidence" && prevYearPoint) {
                        displayValue = parseFloat(((v.value / prevYearPoint.value - 1) * 100).toFixed(2));
                    } else {
                        displayValue = parseFloat(v.value.toFixed(2));
                    }

                    return {
                        date: v.date.toISOString(),
                        value: displayValue,
                    };
                });

                return {
                    name: indicator.name,
                    code: indicator.code,
                    description: indicator.description || undefined,
                    history: history.slice(0, 12).reverse(), // Show last 12 months YoY, asc order
                };
            }
        } catch (error) {
            console.warn("DB Fetch Error (falling back to mock):", error);
        }
    }

    // 2. Mock Fallback (if DB failed or empty)
    // We map the ID to a name if possible, or generic
    const nameMap: Record<string, string> = {
        pmi: "製造業 PMI",
        orders: "新訂單指數",
        confidence: "消費者信心",
        employment: "非農就業",
        production: "工業生產",
        cpi: "核心通膨率",
        unemployment: "失業率",
    };

    return {
        name: nameMap[id] || id,
        code: id,
        description: "提供實時數據走勢圖供投資決策參考。",
        history: generateMockHistory(12),
    };
}

export async function getMacroHistory() {
    if (!prisma) return [];

    try {
        const indicators = await prisma.indicator.findMany({
            where: { NOT: { code: "market" } },
            include: {
                values: {
                    orderBy: { date: "desc" },
                    take: 24, // Enough to look back for YoY
                },
            },
        });

        const market = await prisma.indicator.findUnique({
            where: { code: "market" },
            include: {
                values: {
                    orderBy: { date: "desc" },
                    take: 12,
                },
            },
        });

        const history = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1);

            // Calculate score for this month
            // Simple approach: find value closest to this date in the pre-fetched list
            const indicatorsAtDate = indicators.map((ind: any) => {
                const val = ind.values.find((v: any) => v.date <= date) || ind.values[ind.values.length - 1];
                const prevYear = ind.values.find((v: any) => {
                    const d = new Date(v.date);
                    return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() - 1;
                });

                // Use the Normalizer logic (conceptually)
                const norm = IndicatorNormalizer.normalize(
                    ind.code,
                    ind.type as any,
                    val?.value ?? 0,
                    prevYear?.value ?? null,
                    null
                );

                return {
                    id: ind.code,
                    type: ind.type as any,
                    value: norm.growthRate,
                    score: norm.score
                } as any;
            });

            const scoreResult = MacroScoringEngine.calculateScore(indicatorsAtDate);
            const marketVal = market?.values.find((v: any) => v.date.getMonth() === date.getMonth() && v.date.getFullYear() === date.getFullYear());

            history.push({
                month: `${date.getFullYear()}/${date.getMonth() + 1}`,
                score: scoreResult.totalScore,
                market: marketVal?.value ?? 0,
                fullDate: date.toISOString()
            });
        }

        return history.reverse();
    } catch (e) {
        console.error("Macro History Fetch Error:", e);
        return [];
    }
}

function generateMockHistory(months: number) {
    const data = [];
    let value = 50 + Math.random() * 20;
    for (let i = months; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        // Random walk
        value = value * (1 + (Math.random() * 0.1 - 0.05));

        data.push({
            date: date.toISOString(),
            value: parseFloat(value.toFixed(2)),
        });
    }
    return data;
}
