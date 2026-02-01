import { EconomicIndicator, MacroScoreResult, CyclePhase } from "./types";

export class MacroScoringEngine {
    // Configurable weights
    private static WEIGHTS = {
        leading: 0.6,
        coincident: 0.3,
        lagging: 0.1,
    };

    /**
     * Calculates the macro score based on a list of indicators.
     * Assumes indicators come with pre-calculated 'scores' or normalized values 
     * mapped to 0-100 if possible, or we perform simple normalization here.
     * 
     * For this mock implementation, we assume the 'value' in EconomicIndicator
     * is strictly the raw value, so we might need a separate mapping or 
     * assume the inputs are already processed/normalized indices (like PMI).
     */
    static calculateScore(indicators: EconomicIndicator[]): MacroScoreResult {
        const leading = indicators.filter((i) => i.type === "leading");
        const coincident = indicators.filter((i) => i.type === "coincident");
        const lagging = indicators.filter((i) => i.type === "lagging");

        const leadingScore = this.averageScore(leading);
        const coincidentScore = this.averageScore(coincident);
        const laggingScore = this.averageScore(lagging);

        const totalScore = Math.round(
            leadingScore * this.WEIGHTS.leading +
            coincidentScore * this.WEIGHTS.coincident +
            laggingScore * this.WEIGHTS.lagging
        );

        const phase = this.determinePhase(totalScore, leadingScore, laggingScore);

        return {
            totalScore,
            phase,
            phaseLabel: this.getPhaseLabel(phase),
            summary: this.generateSummary(phase, totalScore),
            details: {
                leadingScore,
                coincidentScore,
                laggingScore,
            },
        };
    }

    private static averageScore(indicators: EconomicIndicator[]): number {
        if (indicators.length === 0) return 50;

        // indicators now come with a 'score' property (0-100 health signal)
        // from our new IndicatorNormalizer.
        const sum = indicators.reduce((acc, curr) => {
            // @ts-ignore
            const signal = curr.score !== undefined ? curr.score : curr.value;
            return acc + signal;
        }, 0);

        return Math.round(sum / indicators.length);
    }

    private static determinePhase(totalScore: number, leading: number, lagging: number): CyclePhase {
        // Simple logic map
        if (totalScore >= 60 && leading >= 60) return "expansion";
        if (totalScore >= 50 && leading < totalScore) return "slowdown";
        if (totalScore < 40) return "recession";
        if (totalScore >= 40 && totalScore < 60 && leading > lagging) return "recovery";
        if (totalScore < 60 && leading < 50) return "recession"; // Fallback

        return "recovery"; // Default
    }

    private static getPhaseLabel(phase: CyclePhase): string {
        const map: Record<CyclePhase, string> = {
            expansion: "擴張期 (Expansion)",
            slowdown: "趨緩期 (Slowdown)",
            recession: "衰退期 (Recession)",
            recovery: "復甦期 (Recovery)",
        };
        return map[phase];
    }

    private static generateSummary(phase: CyclePhase, score: number): string {
        const prep = "預期短線仍有 15-20% 機率出現明顯回檔，但中長期報酬/風險比優於衰退期。";

        switch (phase) {
            case "expansion":
                return `目前景氣位階：擴張期。需求持續增長、企業營收亮眼，且通膨壓力尚在可控範圍。這意味著市場獲利空間穩健，但需留意估值過高的部分。建議關注資產成長性。心理準備：${prep}`;
            case "slowdown":
                return `目前景氣位階：趨緩期。數據動能觸頂放緩、企業獲利預期下修。這意味著防守優於進攻，資產波動度將大幅增加。心理準備：預期短線震盪頻繁，需嚴格控制持倉水位，避免過度曝險。`;
            case "recession":
                return `目前景氣位階：衰退期。需求全面收縮、失業率上升、市場信心低迷。這意味著雖然過程痛苦，但長線價值正在孕育。心理準備：底部磨合期可能極其漫長且充滿負面消息，應保留足夠現金流。`;
            case "recovery":
                return `目前景氣位階：復甦期。需求從谷底回升、企業獲利開始修復，但數據仍不穩定。這意味著進入較穩定的獲利空間，回檔通常是健康的修正。心理準備：${prep}`;
        }
    }
}
