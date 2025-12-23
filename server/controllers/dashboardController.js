const { prisma } = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        let where = {
            isLatest: true,
            ownerId: req.user.id
        };

        // If user is a Vendor, restrict to their contracts
        if (req.user.role === 'Vendor') {
            delete where.ownerId;
            if (!req.user.vendorId) {
                return res.status(403).json({ message: 'Vendor profile not linked to user account' });
            }
            where.vendorId = req.user.vendorId;
        }

        // Fetch all relevant contracts to perform manual aggregation and analysis
        const contracts = await prisma.contract.findMany({
            where: where,
            select: {
                id: true,
                status: true,
                value: true,
                createdAt: true,
                endDate: true,
                title: true
            }
        });

        // 1. Key Performance Indicators (KPIs)
        const totalContracts = contracts.length;

        let portfolioTotal = 0;
        contracts.forEach(c => {
            if (c.value && typeof c.value === 'object' && c.value.amount) {
                portfolioTotal += parseFloat(c.value.amount) || 0;
            }
        });

        const expiringSoon = contracts.filter(c =>
            c.status === 'Active' &&
            new Date(c.endDate) <= thirtyDaysFromNow &&
            new Date(c.endDate) >= new Date()
        ).length;

        const pendingApproval = contracts.filter(c =>
            c.status === 'Draft' || c.status === 'Under_Review'
        ).length;

        // 2. Lifecycle Distribution (Donut Chart)
        const statuses = {};
        contracts.forEach(c => {
            statuses[c.status] = (statuses[c.status] || 0) + 1;
        });

        const pieData = Object.keys(statuses).map(status => ({
            name: status.replace('_', ' '),
            value: statuses[status]
        }));

        // 3. Status Trends (Bar Chart - last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6MonthsMapped = [];
        for (let i = 5; i >= 0; i--) {
            const m = (currentMonth - i + 12) % 12;
            last6MonthsMapped.push(months[m]);
        }

        const barData = last6MonthsMapped.map(month => ({
            name: month,
            active: 0,
            expired: 0
        }));

        contracts.forEach(c => {
            const createdAt = new Date(c.createdAt);
            const monthName = months[createdAt.getMonth()];
            const index = last6MonthsMapped.indexOf(monthName);
            if (index !== -1) {
                if (c.status === 'Active') barData[index].active++;
                if (c.status === 'Expired') barData[index].expired++;
            }
        });

        // 4. Creation Velocity (Area Chart)
        const lineData = last6MonthsMapped.map(month => ({
            name: month,
            contracts: 0
        }));

        contracts.forEach(c => {
            const createdAt = new Date(c.createdAt);
            const monthName = months[createdAt.getMonth()];
            const index = last6MonthsMapped.indexOf(monthName);
            if (index !== -1) {
                lineData[index].contracts++;
            }
        });

        // 5. Recent Activity (from AuditLogs)
        const recentActivity = await prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                contract: {
                    select: { title: true }
                }
            }
        });

        res.json({
            stats: [
                { title: 'Total Contracts', value: totalContracts.toString(), trend: 'up', trendValue: '0%', color: 'bg-indigo-500' },
                { title: 'Portfolio Value', value: `₹${portfolioTotal.toLocaleString('en-IN')}`, trend: 'up', trendValue: '0%', color: 'bg-emerald-500' },
                { title: 'Expiring Soon', value: expiringSoon.toString(), trend: 'down', trendValue: '0%', color: 'bg-amber-500' },
                { title: 'Pending Approval', value: pendingApproval.toString(), trend: 'up', trendValue: '0%', color: 'bg-rose-500' },
            ],
            pieData,
            barData,
            lineData,
            recentActivity: recentActivity.map(log => ({
                id: log.id,
                message: `${log.action}: ${log.contract?.title || 'Contract'}`,
                time: log.createdAt
            })),
            totalContractsCount: totalContracts
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            message: 'Error fetching dashboard stats',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = {
    getDashboardStats
};
