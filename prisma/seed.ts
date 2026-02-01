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

const indicators = [
    // Leading
    { code: "pmi", name: "製造業 PMI (Manufacturing PMI)", type: "leading", value: 52.4 },
    { code: "orders", name: "新訂單指數 (New Orders)", type: "leading", value: 54.1 },
    { code: "confidence", name: "消費者信心 (Consumer Confidence)", type: "leading", value: 68.5 },
    // Coincident
    { code: "employment", name: "非農就業 (Non-Farm Payrolls)", type: "coincident", value: 175 },
    { code: "production", name: "工業生產 (Industrial Production)", type: "coincident", value: 102.3 },
    // Lagging
    { code: "cpi", name: "核心通膨率 (Core CPI)", type: "lagging", value: 3.4 },
    { code: "unemployment", name: "失業率 (Unemployment Rate)", type: "lagging", value: 3.9 },
];

async function main() {
    console.log("Start seeding ...");

    for (const ind of indicators) {
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
            },
        });

        console.log(`Created indicator: ${indicator.name}`);

        // Delete existing values to be safe
        await prisma.indicatorValue.deleteMany({
            where: { indicatorId: indicator.id }
        });

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

    console.log("Seeding finished.");
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
