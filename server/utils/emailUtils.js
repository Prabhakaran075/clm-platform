const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendEmail = async (options) => {
    // 1. Try Resend (API-based, most reliable on Render/Vercel)
    if (process.env.RESEND_API_KEY) {
        console.log('DEBUG: Attempting to send email via Resend API...');
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: 'NexCLM <onboarding@resend.dev>',
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html,
            });

            if (error) {
                console.error('DEBUG: Resend API returned an error:', JSON.stringify(error, null, 2));
                throw new Error(error.message);
            }

            console.log('DEBUG: Resend API success:', data);
            return { success: true };
        } catch (error) {
            console.error('DEBUG: Resend Exception caught:', error.message);
            console.error('DEBUG: Falling back to SMTP...');
        }
    } else {
        console.log('DEBUG: RESEND_API_KEY not found. Skipping Resend.');
    }

    // 2. SMTP Configuration (Fallback)
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const secure = port === 465;

    console.log(`DEBUG: Attempting SMTP with Host: ${host}, Port: ${port}, Secure: ${secure}`);

    const transportConfig = {
        host,
        port,
        secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS ? '********' : 'NOT SET',
        },
        family: 4,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
    };

    // We need the actual password for the transporter
    transportConfig.auth.pass = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
        from: '"NexCLM Support" <support@nexclm.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('DEBUG: SMTP success:', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('DEBUG: SMTP Full Error Detail:');
        console.error('Code:', error.code);
        console.error('Command:', error.command);
        console.error('Response:', error.response);
        console.error('Stack:', error.stack);

        return {
            success: false,
            error: error.message || 'Connection timeout',
            details: error.code || 'TIMEOUT'
        };
    }
};

module.exports = sendEmail;
