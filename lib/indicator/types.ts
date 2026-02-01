export type IndicatorDirection = "up" | "down" | "flat";
export type IndicatorType = "leading" | "coincident" | "lagging";
export type CyclePhase = "expansion" | "slowdown" | "recession" | "recovery";
export type RiskLevel = "conservative" | "neutral" | "positive";
export type ActionSuggestion = "buy" | "hold" | "sell" | "reduce" | "accumulate";

export interface EconomicIndicator {
    id: string;
    name: string;
    value: number;
    change: number; // Percentage or absolute change
    direction: IndicatorDirection;
    type: IndicatorType;
    lastUpdated: string;
}

export interface MacroScoreResult {
    totalScore: number; // 0-100
    phase: CyclePhase;
    phaseLabel: string;
    summary: string;
    details: {
        leadingScore: number;
        coincidentScore: number;
        laggingScore: number;
    };
}

export interface TechnicalIndicator {
    name: string;
    value: number;
    signal: "bullish" | "bearish" | "neutral";
}

export interface TechnicalScoreResult {
    score: number; // 0-100
    trend: "bullish" | "bearish" | "neutral";
    signals: TechnicalIndicator[];
}

export interface EntrySignalResult {
    entryScore: number; // 0-100
    riskLevel: RiskLevel;
    action: ActionSuggestion;
    reasoning: string;
    allocationSuggestion: number; // 0-100% (equity)
}
