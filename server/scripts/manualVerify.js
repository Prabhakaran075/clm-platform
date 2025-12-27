const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllUsers() {
    console.log('--- NexCLM User Manual Verification Utility ---');
    try {
        const result = await prisma.user.updateMany({
            where: {
                isVerified: false
            },
            data: {
                isVerified: true,
                verificationOTP: null,
                verificationExpires: null
            }
        });

        console.log(`SUCCESS: ${result.count} users have been manually verified.`);
    } catch (error) {
        console.error('ERROR: Failed to verify users:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAllUsers();
