const nodemailer = require('nodemailer');

/**
 * @desc    Simple SMTP Email Sender using Nodemailer
 * @param   {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
    // 1. Check for Credentials
    const emailUser = process.env.EMAIL_USER || 'prabhakarans154@gmail.com';
    const emailPass = process.env.EMAIL_PASS; // App Password

    if (!emailPass) {
        console.error('SYSTEM ERROR: EMAIL_PASS (App Password) is missing.');

        // In development, log to console instead of failing
        if (process.env.NODE_ENV !== 'production') {
            console.log('----------------------------------------------------');
            console.log('DEVELOPMENT MODE: EMAIL LOG (NO APP PASSWORD)');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Code: ${options.message}`);
            console.log('----------------------------------------------------');
            return { success: true };
        }

        return {
            success: false,
            error: 'Email password missing',
            details: 'CONFIG_ERR'
        };
    }

    try {
        console.log(`DEBUG: Sending SMTP email to ${options.email} via Gmail...`);

        // 2. Create Transporter (Explicit Gmail SMTP)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        // 3. Define Mail Options
        const mailOptions = {
            from: `"NexGen Support" <${emailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        // 4. Send the Email
        const info = await transporter.sendMail(mailOptions);
        console.log('DEBUG: SMTP Email sent successfully:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('DEBUG: SMTP Exception caught:', error.message);

        return {
            success: false,
            error: error.message || 'SMTP delivery failed',
            details: 'SMTP_ERR'
        };
    }
};

module.exports = sendEmail;
