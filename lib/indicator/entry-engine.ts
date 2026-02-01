import { EntrySignalResult, MacroScoreResult, TechnicalScoreResult, RiskLevel, ActionSuggestion } from "./types";

export class EntrySignalEngine {
    static evaluate(
        macro: MacroScoreResult,
        technical: TechnicalScoreResult
    ): EntrySignalResult {
        const { totalScore: macroScore, phase } = macro;
        const { score: techScore } = technical;

        // Weighted combination: Macro (60%) + Technical (40%) usually good for mid-term
        const entryScore = Math.round(macroScore * 0.6 + techScore * 0.4);

        let riskLevel: RiskLevel = "neutral";
        let action: ActionSuggestion = "hold";
        let allocation = 50;

        if (entryScore >= 75) {
            riskLevel = "positive";
            action = "buy";
            allocation = 80;
        } else if (entryScore >= 60) {
            riskLevel = "positive";
            action = "accumulate";
            allocation = 65;
        } else if (entryScore <= 30) {
            riskLevel = "conservative";
            action = "sell";
            allocation = 10;
        } else if (entryScore <= 45) {
            riskLevel = "conservative";
            action = "reduce";
            allocation = 30;
        } else {
            riskLevel = "neutral";
            action = "hold";
            allocation = 50;
        }

        // Refinement based on Phase
        if (phase === "recovery" && techScore > 50) {
            action = "accumulate"; // Recovery is best time even if score isn't maxed
            allocation = Math.max(allocation, 70);
        }
        else if (phase === "recession") {
            allocation = Math.min(allocation, 30);
            action = entryScore > 40 ? "hold" : "sell";
        }

        return {
            entryScore,
            riskLevel,
            action,
            allocationSuggestion: allocation,
            reasoning: `目前處於${macro.phaseLabel}，景氣分數 ${macroScore}，技術面評分 ${techScore}。建議${this.getActionText(action)}，股票配置約 ${allocation}%。`
        };
    }

    private static getActionText(action: ActionSuggestion): string {
        const map: Record<ActionSuggestion, string> = {
            buy: "積極進場",
            accumulate: "分批佈局",
            hold: "續抱觀望",
            reduce: "減碼防禦",
            sell: "保守退場",
        };
        return map[action];
    }
}
