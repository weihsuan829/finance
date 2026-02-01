import { GlassCard } from "@/components/glass/glass-card";

export default function MethodologyPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">方法論與指標說明 (Methodology)</h1>
                <p className="text-slate-400 mt-1">本平台之核心邏輯與計算模型說明</p>
            </div>

            <GlassCard className="p-8 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-indigo-500 pl-3">1. 景氣循環模型 (Business Cycle Model)</h2>
                    <p className="text-slate-300 leading-relaxed mb-4">
                        我們將總體經濟指標分為三類，透過加權計算出「整體景氣分數 (Macro Score)」，並定義四個循環階段。
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                        <li><strong className="text-indigo-400">領先指標 (Weight 60%)</strong>: 採購經理人指數 (PMI)、新訂單、消費者信心、股價指數。</li>
                        <li><strong className="text-blue-400">同步指標 (Weight 30%)</strong>: 非農就業數據、工業生產指數、零售銷售。</li>
                        <li><strong className="text-purple-400">落後指標 (Weight 10%)</strong>: 通膨率 (CPI/PCE)、失業率、基準利率。</li>
                    </ul>
                </section>

                <hr className="border-white/10" />

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-indigo-500 pl-3">2. 評分與階段定義</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                            <h3 className="font-bold text-emerald-400 mb-2">分數區間</h3>
                            <ul className="text-sm text-slate-300 space-y-1">
                                <li><span className="text-white font-mono">80-100</span>: 過熱 / 繁榮頂部</li>
                                <li><span className="text-white font-mono">60-80</span>: 穩健擴張期</li>
                                <li><span className="text-white font-mono">40-60</span>: 趨緩 / 轉折期</li>
                                <li><span className="text-white font-mono">20-40</span>: 衰退期</li>
                                <li><span className="text-white font-mono">0-20</span>: 深度蕭條 / 恐慌底部</li>
                            </ul>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                            <h3 className="font-bold text-blue-400 mb-2">階段標籤邏輯</h3>
                            <ul className="text-sm text-slate-300 space-y-1">
                                <li><span className="font-mono text-emerald-300">擴張 (Expansion)</span>: 總分 {">="} 60 且領先指標強勁</li>
                                <li><span className="font-mono text-amber-300">轉折 (Slowdown)</span>: 總分 {">="} 50 但領先指標轉弱</li>
                                <li><span className="font-mono text-rose-300">衰退 (Recession)</span>: 總分 {"<"} 40 或各項指標明確下滑</li>
                                <li><span className="font-mono text-blue-300">復甦 (Recovery)</span>: 總分谷底翻揚，領先指標率先轉強</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <hr className="border-white/10" />

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-indigo-500 pl-3">3. 進出場訊號 (Entry Signal)</h2>
                    <p className="text-slate-300 leading-relaxed">
                        進場訊號結合「景氣位階 (Fundamentals)」與「技術面 (Technicals)」雙重確認。
                        <br />
                        <code className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 text-sm mt-2 inline-block">Entry Score = Macro Score * 0.6 + Tech Score * 0.4</code>
                    </p>
                </section>
            </GlassCard>
        </div>
    );
}
