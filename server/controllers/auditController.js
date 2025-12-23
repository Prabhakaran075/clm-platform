const { prisma } = require('../config/db');

// @desc    Get all audit logs for the current user
// @route   GET /api/audit
// @access  Private
const getAuditLogs = async (req, res) => {
    try {
        const userId = req.user.id;

        // If user is a Vendor, they might see logs related to their contracts
        // But typically audit logs are for the organization.
        // For now, let's fetch logs where this user was the actor or for contracts they own.
        const logs = await prisma.auditLog.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { contract: { ownerId: userId } }
                ]
            },
            include: {
                contract: {
                    select: { title: true }
                },
                user: {
                    select: { name: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Error fetching audit logs', details: error.message });
    }
};

module.exports = {
    getAuditLogs
};
