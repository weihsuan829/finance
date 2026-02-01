import { IndicatorType, IndicatorDirection } from "./types";

export interface NormalizedIndicatorData {
    growthRate: number; // YoY or MoM percentage
    score: number;      // 0-100 normalized signal
    direction: IndicatorDirection;
    heatLabel: string;  // "明顯轉強", etc.
    explanation: string; // Plain language snippet
}

export class IndicatorNormalizer {
    /**
     * Normalizes an indicator based on its type and historical values.
     * Most economic indicators are best viewed as Year-over-Year (YoY) growth.
     */
    static normalize(
        code: string,
        type: IndicatorType,
        currentValue: number,
        previousYearValue: number | null,
        previousMonthValue: number | null
    ): NormalizedIndicatorData {
        // 1. Calculate Growth Rate
        // If it's already a percentage-like index (PMI, UMCSENT), we might use it directly
        // but often YoY is still better for "momentum".
        // For now, let's treat PMI/Confidence as absolute levels and others as YoY.

        let growthRate = 0;
        let score = 50;

        if (code === "pmi" || code === "confidence") {
            // These are indices/confidence measures
            // OECD PMI Proxy needs to be shifted by 50 to match 50-neutral scale
            growthRate = code === "pmi" ? (50 + currentValue) : currentValue;
            score = this.mapLevelToScore(code, currentValue);
        } else if (previousYearValue) {
            // Calculate YoY Growth
            growthRate = parseFloat(((currentValue / previousYearValue - 1) * 100).toFixed(2));
            score = this.mapGrowthToScore(code, growthRate);
        }

        // 2. Determine Direction (Relative to previous month)
        let direction: IndicatorDirection = "flat";
        if (previousMonthValue) {
            if (currentValue > previousMonthValue) direction = "up";
            else if (currentValue < previousMonthValue) direction = "down";
        }

        // Special logic for Unemployment (lower is better for score)
        if (code === "unemployment") {
            score = 100 - score;
        }

        return {
            growthRate,
            score,
            direction,
            heatLabel: this.getHeatLabel(score),
            explanation: this.getExplanation(code, score, currentValue)
        };
    }

    private static getHeatLabel(score: number): string {
        if (score >= 80) return "明顯轉強";
        if (score >= 60) return "略為轉強";
        if (score >= 40) return "中性";
        if (score >= 20) return "略為轉弱";
        return "明顯轉弱";
    }

    private static getExplanation(code: string, score: number, val: number): string {
        const strength = score >= 60 ? "偏強" : score <= 40 ? "偏弱" : "中性";
        const map: Record<string, string> = {
            pmi: `反映製造業擴張動能。目前指標${strength}，企業需求與訂單仍在發酵。`,
            orders: `代表未來營收來源。目前的增長態勢顯示未來產能利用率${strength}。`,
            confidence: `反映民生消費意願。目前數值顯示大眾對於未來的景氣展望${strength}。`,
            employment: `就業市場的硬指標。勞動力需求${strength}，是支撐消費成長的核心。`,
            production: `實體產出的量化指標。衡量當前工廠營運與能源消耗的${strength}。`,
            cpi: `物價壓力的關鍵指標。${strength === "偏強" ? "物價仍有攀升壓力" : "通膨壓力目前相對受控"}。`,
            unemployment: `景氣好壞的終極確認。失業率${strength === "偏強" ? "偏低（對景氣有利）" : "回升（需提防下行風險）"}。`,
        };
        return map[code] || "經濟數據觀測指標。";
    }

    private static mapLevelToScore(code: string, level: number): number {
        if (code === "pmi") {
            // OECD Confidence is centered at 0. Converting to 50-neutral scale.
            // Example: -4.2 -> 45.8. 
            const displayLevel = 50 + level;

            // Score mapping based on the 50-neutral scale
            if (displayLevel >= 60) return 90;
            if (displayLevel >= 50) return 50 + (displayLevel - 50) * 4;
            return Math.max(0, 50 - (50 - displayLevel) * 5);
        }
        if (code === "confidence") {
            // Consumer Confidence (UMich): ~70-80 is neutral
            if (level >= 100) return 95;
            if (level <= 50) return 5;
            return (level - 50) * 2; // 50->0, 75->50, 100->100 approx
        }
        return 50;
    }

    private static mapGrowthToScore(code: string, growth: number): number {
        // Default mapping: 2-3% growth is healthy (score 50-60)
        // Recession (growth < 0) -> score < 40
        if (growth > 5) return 90;
        if (growth > 0) return 40 + growth * 10; // 0->40, 2->60, 5->90
        return Math.max(0, 40 + growth * 20); // 0->40, -1->20, -2->0
    }
}
