const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For production, you should add your SMTP settings in .env
    const transportConfig = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    };

    // If custom host is provided, override service
    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST !== 'smtp.gmail.com') {
        transportConfig.host = process.env.EMAIL_HOST;
        transportConfig.port = parseInt(process.env.EMAIL_PORT) || 587;
        transportConfig.secure = transportConfig.port === 465;
        delete transportConfig.service;
    }

    const transporter = nodemailer.createTransport({
        ...transportConfig,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

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
