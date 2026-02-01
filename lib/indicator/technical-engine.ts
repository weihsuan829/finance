import { TechnicalScoreResult, TechnicalIndicator } from "./types";

export class TechnicalScoringEngine {
    /**
     * Evaluates technical score for a given asset based on price history.
     * @param priceHistory Simplified array of numbers for now.
     */
    static analyze(priceHistory: number[]): TechnicalScoreResult {
        if (priceHistory.length < 2) {
            return { score: 50, trend: "neutral", signals: [] };
        }

        const currentPrice = priceHistory[priceHistory.length - 1];
        const prevPrice = priceHistory[priceHistory.length - 2];

        // Mock MA calculation
        const ma20 = this.calculateSMA(priceHistory, 20);
        const ma60 = this.calculateSMA(priceHistory, 60);

        const signals: TechnicalIndicator[] = [];
        let score = 50;

        // Price vs MA logic
        if (ma20 && currentPrice > ma20) {
            score += 15;
            signals.push({ name: "Price > MA20", value: ma20, signal: "bullish" });
        } else if (ma20) {
            score -= 15;
            signals.push({ name: "Price < MA20", value: ma20, signal: "bearish" });
        }

        if (ma60 && currentPrice > ma60) {
            score += 10;
            signals.push({ name: "Price > MA60", value: ma60, signal: "bullish" });
        }

        // Trend
        const trend = score > 60 ? "bullish" : score < 40 ? "bearish" : "neutral";

        return {
            score: Math.min(100, Math.max(0, score)),
            trend,
            signals,
        };
    }

    private static calculateSMA(data: number[], period: number): number | null {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    }
}
