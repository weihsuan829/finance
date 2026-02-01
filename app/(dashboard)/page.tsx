import { MacroScoreCard } from "@/components/dashboard/macro-score-card";
import { IndicatorList } from "@/components/dashboard/indicator-list";
import { MacroHistoryChart } from "@/components/dashboard/macro-chart";
import { MacroScoringEngine } from "@/lib/indicator/macro-engine";
import { getDashboardIndicators, getAllIndicators } from "@/lib/data/economic";
import { getMacroHistory } from "@/app/actions/indicators";
import { GlassCard } from "@/components/glass/glass-card";

export default async function MacroDashboard() {
    // Fetch Data from DB (with fallback)
    const { leading, coincident, lagging } = await getDashboardIndicators();
    const history = await getMacroHistory();
    const all = [...leading, ...coincident, ...lagging];

    // Calculate Score
    const result = MacroScoringEngine.calculateScore(all);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">景氣總覽 (Macro Dashboard)</h1>
                    <p className="text-slate-400 mt-1">即時監控全球經濟數據與景氣循環位階</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-900/40 px-3 py-1 rounded-full border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    最新數據月份: {all.length > 0 ? all.reduce((latest, curr) => curr.lastUpdated > latest ? curr.lastUpdated : latest, all[0].lastUpdated) : "N/A"}
                </div>
            </div>

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
                        <IndicatorList title="同步指標 (Coincident)" indicators={coincident} color="blue" />
                        <div className="h-px bg-white/10" />
                        <IndicatorList title="落後指標 (Lagging)" indicators={lagging} color="purple" />
                    </GlassCard>
                </div>

                {/* Right Column: Charts & Analysis (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* History Chart */}
                    <MacroHistoryChart data={history} />

                    {/* Risk & Psychological Prep */}
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">階段性風險與心理準備</h3>
                        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                            <p className="flex gap-2">
                                <span className="text-indigo-400 font-bold shrink-0">當前優勢:</span>
                                獲利動能開始修復，市場評價通常處於相對合理的起點，適合建立長期核心部位。
                            </p>
                            <p className="flex gap-2">
                                <span className="text-rose-400 font-bold shrink-0">潛在風險:</span>
                                數據好轉初期常有反覆，政策面的不明確或是外部地緣政治可能引發短線劇烈波動。
                            </p>
                            <p className="flex gap-2">
                                <span className="text-amber-400 font-bold shrink-0">進場節奏:</span>
                                適合開始分批佈局。心理上需預留 5-10% 的帳面浮動虧損空間，但歷史勝率隨持有時間拉長而明顯增加。
                            </p>
                            <div className="pt-2 border-t border-white/5 mt-2 italic text-slate-400 text-xs">
                                「自我提醒：現在不是絕對低點，但對中長期布局來說，風險報酬比已經明顯優於景氣高峰期。」
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
