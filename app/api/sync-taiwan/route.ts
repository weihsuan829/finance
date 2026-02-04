import { NextResponse } from "next/server";
import { TaiwanFetcher } from "@/lib/services/taiwan-fetcher";
import { SyncService } from "@/lib/services/sync-service";

export async function GET() {
    try {
        const fetcher = new TaiwanFetcher();
        const syncer = new SyncService(fetcher);

        // List of Taiwan indicators to sync
        const targets = [
            "tw_leading_index",
            "tw_coincident_index",
            "tw_lagging_index",
            "tw_signal_score",
            "tw_export_orders",
            "tw_stock_index",
            "tw_m1b",
            "tw_industrial_production",
            "tw_manufacturing_sales",
            "tw_exports",
            "tw_retail_sales",
            "tw_unemployment"
        ];

        const results: Record<string, string> = {};

        for (const code of targets) {
            try {
                const count = await syncer.syncIndicator(code);
                results[code] = `Synced ${count} records`;
            } catch (e: any) {
                console.error(`Failed to sync ${code}`, e);
                results[code] = `Error: ${e.message}`;
            }
        }

        return NextResponse.json({
            success: true,
            provider: fetcher.getProviderName(),
            results
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
