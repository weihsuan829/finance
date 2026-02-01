const { PrismaClient } = require('@prisma/client');

const API_KEY = "fa375891a1a6cc05010ffa41d4ff2eee";
const BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

const prisma = new PrismaClient();

const SOURCE_MAP = {
    "pmi": "BSCICP02USM460S", // OECD Confidence (Proxy for ISM PMI)
    "orders": "AMTMNO",
    "confidence": "UMCSENT",
    "employment": "PAYEMS",
    "production": "INDPRO",
    "cpi": "CPILFESL",
    "unemployment": "UNRATE",
    "market": "SP500",
};

async function fetchData(seriesId) {
    console.log(`Fetching ${seriesId}...`);
    const limit = (seriesId === "SP500") ? 100 : 24; // More points for market
    const url = `${BASE_URL}?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const json = await res.json();
    return json.observations.map(obs => ({
        date: new Date(obs.date),
        value: parseFloat(obs.value)
    })).filter(p => !isNaN(p.value));
}

async function main() {
    console.log("Starting Real Data Sync (with Proxies)...");
    for (const [code, seriesId] of Object.entries(SOURCE_MAP)) {
        try {
            const data = await fetchData(seriesId);
            let indicator = await prisma.indicator.findUnique({ where: { code } });
            if (!indicator) {
                console.log(`Creating missing indicator: ${code}`);
                indicator = await prisma.indicator.create({
                    data: {
                        code: code,
                        name: code === "market" ? "S&P 500 指數" : code,
                        type: code === "market" ? "coincident" : "leading", // default
                        frequency: "monthly"
                    }
                });
            }

            console.log(`Syncing ${data.length} points for ${code}...`);
            for (const point of data) {
                await prisma.indicatorValue.upsert({
                    where: {
                        indicatorId_date: {
                            indicatorId: indicator.id,
                            date: point.date
                        }
                    },
                    update: { value: point.value },
                    create: {
                        indicatorId: indicator.id,
                        date: point.date,
                        value: point.value
                    }
                });
            }
            await prisma.indicator.update({
                where: { id: indicator.id },
                data: {
                    lastUpdated: new Date(),
                    lastValue: data[0].value
                }
            });
            console.log(`Success: ${code}`);
        } catch (e) {
            console.error(`Failed: ${code}`, e.message);
        }
    }
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
});
