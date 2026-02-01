import { DataFetcher, FetchedDataPoint } from "./fetcher";

export class MockFredFetcher implements DataFetcher {
    async fetchData(seriesId: string): Promise<FetchedDataPoint[]> {
        console.log(`[MockFredFetcher] Fetching data for ${seriesId}...`);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate some random latest data points
        const data: FetchedDataPoint[] = [];
        const today = new Date();

        let baseValue = 50 + Math.random() * 50; // Random start

        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);

            data.push({
                date: date.toISOString(),
                value: parseFloat(baseValue.toFixed(2)),
            });

            // Random change for next point (going backwards)
            baseValue = baseValue * (1 + (Math.random() * 0.05 - 0.025));
        }

        return data;
    }

    getProviderName(): string {
        return "MockFRED";
    }
}
