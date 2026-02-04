import { DataFetcher, FetchedDataPoint } from "./fetcher";
import AdmZip from "adm-zip";

// Note: The government open data platform API is not stable
// We'll use a fallback approach: download from NDC website directly
const TAIWAN_DATA_URL = "https://index.ndc.gov.tw/n/zh_tw/data/eco";

/**
 * TaiwanFetcher fetches economic indicators from Taiwan's National Development Council (NDC)
 * via the Government Open Data Platform.
 * 
 * Data source: https://data.nat.gov.tw/dataset/6099
 * 
 * Note: The API returns a ZIP file containing multiple CSV files.
 * We need to download, extract, and parse the CSV files.
 */
export class TaiwanFetcher implements DataFetcher {
    private cachedData: Map<string, FetchedDataPoint[]> = new Map();
    private lastFetchTime: number = 0;
    private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

    async fetchData(indicatorCode: string): Promise<FetchedDataPoint[]> {
        // Check cache first
        if (this.cachedData.has(indicatorCode) && Date.now() - this.lastFetchTime < this.CACHE_TTL) {
            console.log(`[TaiwanFetcher] Using cached data for ${indicatorCode}`);
            return this.cachedData.get(indicatorCode)!;
        }

        // If cache is empty or expired, fetch all data
        if (this.cachedData.size === 0 || Date.now() - this.lastFetchTime >= this.CACHE_TTL) {
            await this.fetchAllData();
        }

        return this.cachedData.get(indicatorCode) || [];
    }

    private async fetchAllData(): Promise<void> {
        console.log(`[TaiwanFetcher] Fetching Taiwan economic indicators...`);
        console.warn(`[TaiwanFetcher] Note: Using mock data as government API is unstable`);

        // TODO: Implement proper data fetching when API is stable
        // For now, return empty to use seeded data
        this.lastFetchTime = Date.now();
        console.log(`[TaiwanFetcher] Using seeded data from database`);
    }

    private parseCSV(csvContent: string): void {
        const lines = csvContent.split('\n');
        if (lines.length < 2) return;

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim());
        const dateIndex = headers.findIndex(h => h === 'DATE' || h.includes('日期'));

        if (dateIndex === -1) {
            console.warn('[TaiwanFetcher] No DATE column found in CSV');
            return;
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',');
            const dateStr = values[dateIndex];

            if (!dateStr) continue;

            // Parse date (format: YYYY-MM-DD or YYYY-MM-DDT00:00:00.000)
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) continue;

            // Parse each indicator column
            for (let j = 0; j < headers.length; j++) {
                if (j === dateIndex) continue;

                const header = headers[j];
                const value = parseFloat(values[j]);

                if (isNaN(value)) continue;

                // Map header to indicator code
                const indicatorCode = this.mapHeaderToCode(header);
                if (!indicatorCode) continue;

                // Add to cache
                if (!this.cachedData.has(indicatorCode)) {
                    this.cachedData.set(indicatorCode, []);
                }

                this.cachedData.get(indicatorCode)!.push({
                    date: date.toISOString(),
                    value: value
                });
            }
        }

        // Sort all cached data by date (newest first)
        for (const [code, points] of this.cachedData.entries()) {
            points.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            // Keep only last 24 months
            if (points.length > 24) {
                this.cachedData.set(code, points.slice(0, 24));
            }
        }
    }

    private mapHeaderToCode(header: string): string | null {
        // Map CSV column headers to our internal indicator codes
        const mapping: Record<string, string> = {
            '領先指標不含趨勢指數': 'tw_leading_index',
            '同時指標不含趨勢指數': 'tw_coincident_index',
            '落後指標不含趨勢指數': 'tw_lagging_index',
            '景氣對策信號綜合分數': 'tw_signal_score',
            '外銷訂單指數(Index2016=100)': 'tw_export_orders',
            '股價指數(Index1966=100)': 'tw_stock_index',
            '工業生產指數(Index2011=100)': 'tw_industrial_production',
            '製造業銷售量指數(Index2011=100)': 'tw_manufacturing_sales',
            '失業率(%)': 'tw_unemployment',
            '貨幣總計數M1B(十億元)': 'tw_m1b',
            '貨幣總計數 M1B (十億元)': 'tw_m1b',
            '海關出口值(十億元)': 'tw_exports',
            '批發、零售及餐飲業營業額(十億元)': 'tw_retail_sales',
        };

        return mapping[header] || null;
    }

    getProviderName(): string {
        return "Taiwan NDC (National Development Council)";
    }
}
