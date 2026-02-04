import { MacroScoreCard } from "@/components/dashboard/macro-score-card";
import { IndicatorList } from "@/components/dashboard/indicator-list";
import { MacroHistoryChart } from "@/components/dashboard/macro-chart";
import { MacroScoringEngine } from "@/lib/indicator/macro-engine";
import { getTaiwanIndicators, getTaiwanHistory } from "@/app/actions/taiwan-indicators";
import { GlassCard } from "@/components/glass/glass-card";

export default async function TaiwanDashboard() {
    // Fetch Taiwan Data from DB
    const { leading, coincident, lagging, signal } = await getTaiwanIndicators();
    const history = await getTaiwanHistory();
    const all = [...leading, ...coincident, ...lagging];

    // Calculate Score
    const result = MacroScoringEngine.calculateScore(all);

    // Get signal score (景氣對策信號)
    const signalScore = signal?.lastValue || 0;
    const signalColor = getSignalColor(signalScore);
    const signalLabel = getSignalLabel(signalScore);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">台灣景氣總覽 (Taiwan Economic Dashboard)</h1>
                    <p className="text-slate-400 mt-1">即時監控台灣經濟數據與景氣循環位階</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-900/40 px-3 py-1 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    最新數據月份: {all.length > 0 ? all.reduce((latest, curr) => curr.lastUpdated > latest ? curr.lastUpdated : latest, all[0].lastUpdated) : "N/A"}
                </div>
            </div>

            {/* Signal Score Card */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">景氣對策信號 (Economic Signal)</h3>
                        <p className="text-sm text-slate-400">國發會景氣燈號綜合判斷分數</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{signalScore}</div>
                            <div className="text-sm text-slate-400">分數 (9-45)</div>
                        </div>
                        <div className={`w-16 h-16 rounded-full ${signalColor} flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-sm">{signalLabel}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300">藍燈 9-16</span>
                    <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300">黃藍燈 17-22</span>
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">綠燈 23-31</span>
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">黃紅燈 32-37</span>
                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-300">紅燈 38-45</span>
                </div>
            </GlassCard>

            {/* Main Score Card */}
            <MacroScoreCard
                score={result.totalScore}
                phase={result.phase}
                phaseLabel={result.phaseLabel}
                summary={result.summary}
            />

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Indicator Lists (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <GlassCard className="p-5 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                        <IndicatorList title="領先指標 (Leading)" indicators={leading} color="indigo" />
                        <div className="h-px bg-white/10" />
                        <IndicatorList title="同時指標 (Coincident)" indicators={coincident} color="blue" />
                        <div className="h-px bg-white/10" />
                        <IndicatorList title="落後指標 (Lagging)" indicators={lagging} color="purple" />
                    </GlassCard>
                </div>

                {/* Right Column: History Chart (8 cols) */}
                <div className="lg:col-span-8">
                    <GlassCard className="p-5">
                        <MacroHistoryChart data={history} />
                    </GlassCard>
                </div>
            </div>

            {/* Data Source Info */}
            <GlassCard className="p-4">
                <div className="flex items-start gap-3 text-sm text-slate-400">
                    <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-medium text-slate-300 mb-1">資料來源</p>
                        <p>國家發展委員會（國發會）景氣指標查詢系統 - 政府資料開放平臺</p>
                        <p className="text-xs mt-1">資料更新頻率：每月 | 授權方式：政府資料開放授權條款-第1版</p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

function getSignalColor(score: number): string {
    if (score >= 38) return "bg-red-500";
    if (score >= 32) return "bg-yellow-500";
    if (score >= 23) return "bg-green-500";
    if (score >= 17) return "bg-cyan-500";
    return "bg-blue-500";
}

function getSignalLabel(score: number): string {
    if (score >= 38) return "紅燈";
    if (score >= 32) return "黃紅燈";
    if (score >= 23) return "綠燈";
    if (score >= 17) return "黃藍燈";
    return "藍燈";
}
