import prisma from "@/lib/prisma";
import { EconomicIndicator } from "@/lib/indicator/types";
import { IndicatorNormalizer } from "@/lib/indicator/normalizer";

export async function getDashboardIndicators(): Promise<{
    leading: EconomicIndicator[];
    coincident: EconomicIndicator[];
    lagging: EconomicIndicator[];
}> {
    if (!prisma) {
        return {
            leading: getLeadingIndicators(),
            coincident: getCoincidentIndicators(),
            lagging: getLaggingIndicators(),
        };
    }

    try {
        const indicators = await prisma.indicator.findMany({
            include: {
                values: {
                    orderBy: { date: "desc" },
                    take: 13, // Fetch 13 months to get YoY (current vs 12 months ago)
                },
            },
        });

        if (indicators.length === 0) {
            return {
                leading: getLeadingIndicators(),
                coincident: getCoincidentIndicators(),
                lagging: getLaggingIndicators(),
            };
        }

        const mapToIndicator = (ind: any): EconomicIndicator => {
            const latest = ind.values[0];
            const prevMonth = ind.values[1];
            const prevYear = ind.values[12]; // 12 months before

            // Use Normalizer to get Growth and Score
            const norm = IndicatorNormalizer.normalize(
                ind.code,
                ind.type as any,
                latest?.value ?? 0,
                prevYear?.value ?? null,
                prevMonth?.value ?? null
            );

            // Calculate change in growth rate (momentum)
            const prevMonthNorm = prevMonth ? IndicatorNormalizer.normalize(
                ind.code,
                ind.type as any,
                prevMonth.value,
                ind.values[13]?.value ?? null, // Would need more history for 100% accurate YoY change
                ind.values[2]?.value ?? null
            ) : null;

            const change = prevMonthNorm ? parseFloat((norm.growthRate - prevMonthNorm.growthRate).toFixed(2)) : 0;

            return {
                id: ind.code,
                name: ind.name,
                // The 'value' is what is shown prominently. User wants percentage.
                value: norm.growthRate,
                change: change,
                direction: norm.direction,
                type: ind.type as any,
                lastUpdated: ind.lastUpdated?.toISOString().split('T')[0] ?? "N/A",
                // Note: We'll store the 'score' in a hidden field or pass it along if types allow.
                // For now, MacroScoringEngine will recalculate or we can attach it.
                // @ts-ignore - Dynamic property to pass score to engine
                score: norm.score,
                // @ts-ignore
                heatLabel: norm.heatLabel,
                // @ts-ignore
                explanation: norm.explanation
            };
        };

        const processed = {
            leading: indicators.filter((i: any) => i.type === "leading").map(mapToIndicator),
            coincident: indicators.filter((i: any) => i.type === "coincident").map(mapToIndicator),
            lagging: indicators.filter((i: any) => i.type === "lagging").map(mapToIndicator),
        };

        return processed;
    } catch (e) {
        console.error("Dashboard DB fetch error:", e);
        return {
            leading: getLeadingIndicators(),
            coincident: getCoincidentIndicators(),
            lagging: getLaggingIndicators(),
        };
    }
}

export const getLeadingIndicators = (): EconomicIndicator[] => [
    {
        id: "pmi",
        name: "製造業 PMI (Manufacturing PMI)",
        value: 52.4, // > 50 Expansion
        change: 1.2,
        direction: "up",
        type: "leading",
        lastUpdated: "2024-05-01",
    },
    {
        id: "orders",
        name: "新訂單指數 (New Orders)",
        value: 54.1,
        change: 2.5,
        direction: "up",
        type: "leading",
        lastUpdated: "2024-05-01",
    },
    {
        id: "confidence",
        name: "消費者信心 (Consumer Confidence)",
        value: 68.5,
        change: -0.5,
        direction: "down",
        type: "leading",
        lastUpdated: "2024-04-20",
    },
];

export const getCoincidentIndicators = (): EconomicIndicator[] => [
    {
        id: "employment",
        name: "非農就業 (Non-Farm Payrolls)",
        value: 175, // k
        change: -10,
        direction: "down",
        type: "coincident",
        lastUpdated: "2024-05-05",
    },
    {
        id: "production",
        name: "工業生產 (Industrial Production)",
        value: 102.3, // index
        change: 0.4,
        direction: "up",
        type: "coincident",
        lastUpdated: "2024-04-15",
    },
];

export const getLaggingIndicators = (): EconomicIndicator[] => [
    {
        id: "cpi",
        name: "核心通膨率 (Core CPI)",
        value: 3.4, // %
        change: -0.1,
        direction: "down",
        type: "lagging",
        lastUpdated: "2024-05-10",
    },
    {
        id: "unemployment",
        name: "失業率 (Unemployment Rate)",
        value: 3.9, // %
        change: 0.1,
        direction: "up", // rising unemployment is usually bad, but indicator direction is strictly numeric trend
        type: "lagging",
        lastUpdated: "2024-05-05",
    },
];

export const getAllIndicators = () => [
    ...getLeadingIndicators(),
    ...getCoincidentIndicators(),
    ...getLaggingIndicators(),
];
