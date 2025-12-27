const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendEmail = async (options) => {
    // 1. Try Resend (API-based, most reliable on Render/Vercel)
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { error } = await resend.emails.send({
                from: 'NexCLM <onboarding@resend.dev>', // Update after domain verification
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html,
            });

            if (error) {
                console.error('Resend API error:', error);
                throw new Error(error.message);
            }

            return { success: true };
        } catch (error) {
            console.error('Resend failed, trying SMTP fallback...', error);
            // Continue to SMTP fallback if Resend fails
        }
    }

    // 2. SMTP Configuration (Fallback)
    // For production, you should add your SMTP settings in .env
    // Default to Gmail SMTPS (Port 465) which is most reliable on Render
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const secure = port === 465;

    const transportConfig = {
        host,
        port,
        secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        family: 4, // Force IPv4 to prevent IPv6 timeout issues on Render
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
    };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
        from: '"NexCLM Support" <support@nexclm.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // Development Logging
    // If no email credentials are provided and Resend is not configured, log to console for development
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        if (!process.env.RESEND_API_KEY) {
            console.log('----------------------------------------------------');
            console.log('DEVELOPMENT MODE: EMAIL LOG');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: ${options.message}`);
            console.log('----------------------------------------------------');
            return { success: true };
        }
    }

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('SMTP Email error:', error);
        return {
            success: false,
            error: error.message || 'Connection timeout'
        };
    }
};

module.exports = sendEmail;
