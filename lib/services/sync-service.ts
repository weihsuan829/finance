import prisma from "@/lib/prisma";
import { DataFetcher } from "./fetcher";

// Map your internal Indicator Codes to External Source IDs
const SOURCE_MAP: Record<string, string> = {
    // Leading
    "pmi": "BSCICP02USM460S", // OECD Business Confidence Index (Proxy for ISM PMI)
    "orders": "AMTMNO", // Manufacturers' New Orders: Total Manufacturing
    "confidence": "UMCSENT", // University of Michigan: Consumer Sentiment

    // Coincident
    "employment": "PAYEMS", // All Employees, Total Nonfarm
    "production": "INDPRO", // Industrial Production: Total Index

    // Lagging
    "cpi": "CPILFESL",
    "unemployment": "UNRATE",

    // Market context
    "market": "SP500",

    // Taiwan indicators - code is used directly as source ID
    "tw_leading_index": "tw_leading_index",
    "tw_coincident_index": "tw_coincident_index",
    "tw_lagging_index": "tw_lagging_index",
    "tw_signal_score": "tw_signal_score",
    "tw_export_orders": "tw_export_orders",
    "tw_stock_index": "tw_stock_index",
    "tw_m1b": "tw_m1b",
    "tw_industrial_production": "tw_industrial_production",
    "tw_manufacturing_sales": "tw_manufacturing_sales",
    "tw_exports": "tw_exports",
    "tw_retail_sales": "tw_retail_sales",
    "tw_unemployment": "tw_unemployment",
};

export class SyncService {
    constructor(private fetcher: DataFetcher) { }

    async syncIndicator(indicatorCode: string) {
        const sourceId = SOURCE_MAP[indicatorCode];
        if (!sourceId) {
            console.warn(`No source ID found for indicator: ${indicatorCode}`);
            return;
        }

        console.log(`Syncing ${indicatorCode} from ${this.fetcher.getProviderName()}...`);
        const data = await this.fetcher.fetchData(sourceId);

        // Get the indicator ID from DB
        const indicator = await prisma.indicator.findUnique({
            where: { code: indicatorCode },
        });

        if (!indicator) {
            console.error(`Indicator not found in DB: ${indicatorCode}`);
            return;
        }

        // Upsert values
        let count = 0;
        for (const point of data) {
            await prisma.indicatorValue.upsert({
                where: {
                    indicatorId_date: {
                        indicatorId: indicator.id,
                        date: new Date(point.date),
                    },
                },
                update: {
                    value: point.value,
                },
                create: {
                    indicatorId: indicator.id,
                    date: new Date(point.date),
                    value: point.value,
                },
            });
            count++;
        }

        // Update last updated timestamp
        await prisma.indicator.update({
            where: { id: indicator.id },
            data: {
                lastUpdated: new Date(),
                lastValue: data[0]?.value // Assuming first is latest
            }
        });

        console.log(`Synced ${count} points for ${indicatorCode}`);
        return count;
    }
}
