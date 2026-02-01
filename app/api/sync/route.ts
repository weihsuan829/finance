import { NextResponse } from "next/server";
import { FredFetcher } from "@/lib/services/fred-fetcher";
import { SyncService } from "@/lib/services/sync-service";

// In production, you might protect this route with a secret key
// e.g., if (req.headers.get("Authorization") !== process.env.CRON_SECRET) ...

export async function GET() {
    try {
        const fetcher = new FredFetcher();
        const syncer = new SyncService(fetcher);

        // List of indicators to sync (syncing all mapped ones)
        // Leading: pmi, orders, confidence
        // Coincident: employment, production
        // Lagging: cpi, unemployment
        const targets = ["pmi", "orders", "confidence", "employment", "production", "cpi", "unemployment"];
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
