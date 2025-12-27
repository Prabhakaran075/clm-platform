const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
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
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000,
    };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
        from: '"NexCLM Support" <support@nexclm.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // If no email credentials are provided, log to console for development
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('----------------------------------------------------');
        console.log('DEVELOPMENT MODE: EMAIL LOG');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('----------------------------------------------------');
        return true;
    }

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return {
            success: false,
            error: error.message,
            code: error.code,
            command: error.command
        };
    }
};

module.exports = sendEmail;
