const cron = require('node-cron');
const { prisma } = require('../config/db');

/**
 * Checks for contracts expiring in 24 hours and sends notifications.
 * Runs every day at 00:00 (Midnight)
 */
const initJobs = () => {
    console.log('Initializing scheduled jobs...');

    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily contract expiration check...');
        await checkExpirations();
    });

    // Optional: Run on startup to catch things if server was down
    // Uncomment for production or keep for testing
    // checkExpirations();
};

const checkExpirations = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // Find contracts expiring tomorrow
        const expiringContracts = await prisma.contract.findMany({
            where: {
                endDate: {
                    gte: tomorrow,
                    lte: tomorrowEnd
                },
                status: 'Active'
            },
            include: {
                owner: true
            }
        });

        console.log(`Found ${expiringContracts.length} contracts expiring tomorrow.`);

        for (const contract of expiringContracts) {
            // Check if notification already exists to avoid duplicates
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    recipientId: contract.ownerId,
                    type: 'Expiry_Reminder',
                    message: {
                        contains: contract.title
                    },
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            });

            if (!existingNotification) {
                await prisma.notification.create({
                    data: {
                        recipientId: contract.ownerId,
                        type: 'Expiry_Reminder',
                        priority: 'Urgent',
                        message: `Contract "${contract.title}" is set to expire tomorrow. Please review for renewal or archiving.`,
                        link: `/contracts/${contract.id}`
                    }
                });
                console.log(`Sent expiry alert for contract: ${contract.title} to ${contract.owner.email}`);
            }
        }
    } catch (error) {
        console.error('Error in checkExpirations job:', error);
    }
};

module.exports = { initJobs };
