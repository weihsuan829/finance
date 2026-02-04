"use server";

import prisma from "@/lib/prisma";
import { EconomicIndicator } from "@/lib/indicator/types";

export async function getTaiwanIndicators() {
    try {
        // Fetch all Taiwan indicators from database
        const indicators = await prisma.indicator.findMany({
            where: {
                code: {
                    startsWith: "tw_"
                }
            },
            include: {
                values: {
                    orderBy: { date: "desc" },
                    take: 1
                }
            }
        });

        // Group by type
        const leading: EconomicIndicator[] = [];
        const coincident: EconomicIndicator[] = [];
        const lagging: EconomicIndicator[] = [];
        let signal: EconomicIndicator | null = null;

        for (const ind of indicators) {
            const latestValue = ind.values[0];
            
            const indicator: EconomicIndicator = {
                id: ind.code,
                name: ind.name,
                value: latestValue?.value || ind.lastValue || 0,
                change: 0, // TODO: Calculate from historical data
                direction: "flat",
                type: ind.type as any,
                lastUpdated: ind.lastUpdated?.toISOString().split('T')[0] || "N/A"
            };

            if (ind.type === "leading") {
                leading.push(indicator);
            } else if (ind.type === "coincident") {
                coincident.push(indicator);
            } else if (ind.type === "lagging") {
                lagging.push(indicator);
            } else if (ind.type === "signal") {
                signal = indicator;
            }
        }

        return { leading, coincident, lagging, signal };
    } catch (error) {
        console.error("Failed to fetch Taiwan indicators:", error);
        return {
            leading: [],
            coincident: [],
            lagging: [],
            signal: null
        };
    }
}

export async function getTaiwanHistory() {
    try {
        // Fetch Taiwan leading index history for chart
        const indicator = await prisma.indicator.findUnique({
            where: { code: "tw_leading_index" },
            include: {
                values: {
                    orderBy: { date: "asc" },
                    take: 24 // Last 24 months
                }
            }
        });

        if (!indicator) {
            return [];
        }

        return indicator.values.map((v: any) => ({
            month: v.date.toISOString().split('T')[0],
            score: v.value,
            market: v.value // Use same value for now
        }));
    } catch (error) {
        console.error("Failed to fetch Taiwan history:", error);
        return [];
    }
}
