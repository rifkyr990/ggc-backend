const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDailyVisitors = async (req, res) => {
    try {
        const result = await prisma.$queryRaw`
            SELECT DATE("visitedAt") AS date, COUNT(*) AS total
            FROM "Visitor"
            GROUP BY DATE("visitedAt")
            ORDER BY date ASC;
        `;

        const data = result.map(item => ({
        date: item.date.toISOString().split('T')[0],
        total: Number(item.total),
        }));

        res.json(data);
    } catch (error) {
        console.error("🔥 Error in getDailyVisitors:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get monthly visitors (group by month)
const getMonthlyVisitors = async (req, res) => {
    try {
        const result = await prisma.$queryRaw`
            SELECT TO_CHAR(DATE_TRUNC('month', "visitedAt"), 'YYYY-MM') AS month, COUNT(*) AS total
            FROM "Visitor"
            GROUP BY month
            ORDER BY month ASC;
        `;

        const data = result.map(item => ({
        month: item.month,
        total: Number(item.total),
        }));

        res.json(data);
    } catch (error) {
        console.error("Error fetching monthly visitors:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getDailyVisitors,
    getMonthlyVisitors,
};
