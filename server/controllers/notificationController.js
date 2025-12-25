const { prisma } = require('../config/db');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { recipientId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', details: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await prisma.notification.update({
            where: {
                id: req.params.id,
                recipientId: req.user.id
            },
            data: { isRead: true }
        });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', details: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                recipientId: req.user.id,
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', details: error.message });
    }
};

// @desc    Get AI-generated summary of notifications
// @route   GET /api/notifications/ai-summary
// @access  Private
const getAiSummary = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: req.user.id,
                isRead: false
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        if (notifications.length === 0) {
            return res.json({ summary: "No new notifications to summarize." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.json({ summary: "AI Summary is unavailable (Missing API Key)." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are a helpful AI assistant for a Contract Lifecycle Management (CLM) platform.
            Based on the following list of unread notifications for a user, provide a very concise, 1-2 sentence actionable summary.
            Focus on what's most urgent (expiries, approvals).

            Notifications:
            ${notifications.map(n => `- [${n.type}] ${n.message}`).join('\n')}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text().trim();

        res.json({ summary });
    } catch (error) {
        console.error('AI Summary Error:', error);
        res.status(500).json({ message: 'Error generating AI summary', details: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getAiSummary
};
