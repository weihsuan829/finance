export interface FetchedDataPoint {
    date: string; // ISO Date string
    value: number;
}

export interface DataFetcher {
    /**
     * Fetches the latest data for a given indicator code.
     * @param sourceId The ID used by the specific source (e.g., FRED series ID, Yahoo Ticker)
     */
    fetchData(sourceId: string): Promise<FetchedDataPoint[]>;

    /**
     * Returns a friendly name for the provider.
     */
    getProviderName(): string;
}
