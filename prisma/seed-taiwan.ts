const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log("DB URL:", process.env.DATABASE_URL);
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const taiwanIndicators = [
    // Taiwan Leading Indicators
    { code: "tw_leading_index", name: "台灣領先指標 (Taiwan Leading Index)", type: "leading", value: 103.36, region: "taiwan" },
    { code: "tw_export_orders", name: "外銷訂單指數 (Export Orders Index)", type: "leading", value: 120.5, region: "taiwan" },
    { code: "tw_stock_index", name: "台股加權指數 (Taiwan Stock Index)", type: "leading", value: 22500, region: "taiwan" },
    { code: "tw_m1b", name: "實質貨幣總計數 M1B (Real M1B)", type: "leading", value: 23500, region: "taiwan" },
    
    // Taiwan Coincident Indicators
    { code: "tw_coincident_index", name: "台灣同時指標 (Taiwan Coincident Index)", type: "coincident", value: 105.86, region: "taiwan" },
    { code: "tw_industrial_production", name: "工業生產指數 (Industrial Production Index)", type: "coincident", value: 115.2, region: "taiwan" },
    { code: "tw_manufacturing_sales", name: "製造業銷售量指數 (Manufacturing Sales Index)", type: "coincident", value: 112.8, region: "taiwan" },
    { code: "tw_exports", name: "海關出口值 (Customs Export Value)", type: "coincident", value: 450, region: "taiwan" },
    { code: "tw_retail_sales", name: "批發零售餐飲業營業額 (Retail Sales)", type: "coincident", value: 1200, region: "taiwan" },
    
    // Taiwan Lagging Indicators
    { code: "tw_lagging_index", name: "台灣落後指標 (Taiwan Lagging Index)", type: "lagging", value: 98.5, region: "taiwan" },
    { code: "tw_unemployment", name: "失業率 (Unemployment Rate)", type: "lagging", value: 3.4, region: "taiwan" },
    
    // Taiwan Signal
    { code: "tw_signal_score", name: "景氣對策信號分數 (Economic Signal Score)", type: "signal", value: 38, region: "taiwan" },
];

async function main() {
    console.log("Start seeding Taiwan indicators ...");

    for (const ind of taiwanIndicators) {
        const indicator = await prisma.indicator.upsert({
            where: { code: ind.code },
            update: {},
            create: {
                code: ind.code,
                name: ind.name,
                type: ind.type,
                frequency: "monthly",
                lastValue: ind.value,
                lastUpdated: new Date(),
                description: `Region: ${ind.region}`
            },
        });

        console.log(`Created Taiwan indicator: ${indicator.name}`);

        // Delete existing values to be safe
        await prisma.indicatorValue.deleteMany({
            where: { indicatorId: indicator.id }
        });

        // Create some mock historical data
        let val = ind.value;
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1);

            await prisma.indicatorValue.create({
                data: {
                    indicatorId: indicator.id,
                    date: date,
                    value: parseFloat(val.toFixed(2))
                }
            });

            // Random fluctuation for history
            val = val * (1 + (Math.random() * 0.04 - 0.02));
        }
    }

    console.log("Taiwan indicators seeding finished.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
