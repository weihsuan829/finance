export interface MarketIndex {
    symbol: string;
    name: string;
    price: number;
    change: number; // percentage
    history: number[]; // simple price history for charts
}

export const getMarketIndices = (): MarketIndex[] => [
    {
        symbol: "^TWII",
        name: "台灣加權指數 (TAIEX)",
        price: 20560,
        change: 1.25,
        history: generateMockHistory(20000, 21000, 60),
    },
    {
        symbol: "^GSPC",
        name: "S&P 500",
        price: 5240,
        change: 0.8,
        history: generateMockHistory(5000, 5300, 60),
    },
    {
        symbol: "^IXIC",
        name: "NASDAQ",
        price: 16400,
        change: 1.1,
        history: generateMockHistory(15500, 16800, 60),
    },
];

export const getWatchlistAssets = () => [
    { symbol: "2330.TW", name: "台積電", type: "Stock", history: generateMockHistory(700, 850, 60) },
    { symbol: "NVDA", name: "NVIDIA", type: "Stock", history: generateMockHistory(800, 1000, 60) },
    { symbol: "0050.TW", name: "元大台灣50", type: "ETF", history: generateMockHistory(140, 160, 60) },
];

function generateMockHistory(min: number, max: number, days: number): number[] {
    const history: number[] = [];
    let current = (min + max) / 2;
    for (let i = 0; i < days; i++) {
        const change = (Math.random() - 0.45) * ((max - min) * 0.05); // slightly bullish bias
        current += change;
        history.push(current);
    }
    return history;
}
