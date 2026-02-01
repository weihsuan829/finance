import { getDashboardIndicators } from "@/lib/data/economic";
import { IndicatorGrid } from "@/components/dashboard/indicator-grid";
import { GlassCard } from "@/components/glass/glass-card";

export default async function IndicatorsPage() {
    const { leading, coincident, lagging } = await getDashboardIndicators();

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">指標數據中心 (Economic Indicators)</h1>
                <p className="text-slate-400 mt-1">全面追蹤全球核心經濟數據，深入掌握景氣轉折訊號。</p>
            </div>

            {/* Leading Indicators */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    <h2 className="text-xl font-bold text-white">領先指標 (Leading)</h2>
                    <span className="text-xs text-slate-500 font-medium">預判景氣轉折的訊號燈</span>
                </div>
                <IndicatorGrid indicators={leading} />
            </section>

            {/* Coincident Indicators */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-xl font-bold text-white">同步指標 (Coincident)</h2>
                    <span className="text-xs text-slate-500 font-medium">反映實體經濟的當下溫度</span>
                </div>
                <IndicatorGrid indicators={coincident} />
            </section>

            {/* Lagging Indicators */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    <h2 className="text-xl font-bold text-white">落後指標 (Lagging)</h2>
                    <span className="text-xs text-slate-500 font-medium">最後的確認機制</span>
                </div>
                <IndicatorGrid indicators={lagging} />
            </section>

            {/* Footer Tip */}
            <GlassCard variant="clean" className="p-6 border-indigo-500/20 bg-indigo-500/5">
                <p className="text-sm text-slate-300 leading-relaxed text-center italic">
                    「提示：點擊任何指標卡片，即可查看該指標的歷史趨勢圖與更詳細的經濟解讀。」
                </p>
            </GlassCard>
        </div>
    );
}
