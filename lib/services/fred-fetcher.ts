import { DataFetcher, FetchedDataPoint } from "./fetcher";

const API_KEY = process.env.FRED_API_KEY;
const BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

export class FredFetcher implements DataFetcher {
    async fetchData(seriesId: string): Promise<FetchedDataPoint[]> {
        if (!API_KEY) {
            throw new Error("FRED_API_KEY is not set in environment variables");
        }

        console.log(`[FredFetcher] Fetching ${seriesId}...`);

        // FRED API parameters:
        // limit=24: Last 24 observations (2 years if monthly)
        // sort_order=desc: Newest first
        // file_type=json
        const url = `${BASE_URL}?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=24`;

        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`FRED API Error: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();

            if (!json.observations) {
                console.warn("[FredFetcher] No observations found for", seriesId);
                return [];
            }

            // FRED returns newest first due to sort_order=desc, but our charts usually like asc.
            // However, we return raw points, DB upsert handles order.
            // We map them to our format.
            const points: FetchedDataPoint[] = json.observations.map((obs: any) => ({
                date: new Date(obs.date).toISOString(),
                value: parseFloat(obs.value),
            })).filter((p: FetchedDataPoint) => !isNaN(p.value)); // Filter out "." values which FRED uses for missing data

            return points;
        } catch (error) {
            console.error(`[FredFetcher] Failed to fetch ${seriesId}:`, error);
            throw error;
        }
    }

    getProviderName(): string {
        return "FRED (Federal Reserve Economic Data)";
    }
}
