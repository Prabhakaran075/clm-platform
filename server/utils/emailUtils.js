const { Resend } = require('resend');

const sendEmail = async (options) => {
    // Check for Resend API Key
    if (!process.env.RESEND_API_KEY) {
        console.error('SYSTEM ERROR: RESEND_API_KEY is missing from environment variables.');

        // In development, we can still log to console
        if (process.env.NODE_ENV !== 'production') {
            console.log('----------------------------------------------------');
            console.log('DEVELOPMENT MODE: EMAIL LOG');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: ${options.message}`);
            console.log('----------------------------------------------------');
            return { success: true };
        }

        return {
            success: false,
            error: 'Email service configuration missing (RESEND_API_KEY)',
            details: 'CONFIG_ERR'
        };
    }

    try {
        console.log(`DEBUG: Sending email to ${options.email} via Resend API...`);
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'NexCLM <no-reply@prabhakarans154@gmail.com>', // Update after domain verification
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        });

        if (error) {
            console.error('DEBUG: Resend API returned an error:', JSON.stringify(error, null, 2));
            return {
                success: false,
                error: error.message,
                details: error.name || 'API_ERR'
            };
        }

        console.log('DEBUG: Resend API success:', data.id);
        return { success: true };
    } catch (error) {
        console.error('DEBUG: Resend Exception caught:', error.message);
        return {
            success: false,
            error: error.message || 'Email delivery failed',
            details: 'EXCEPTION'
        };
    }
};

module.exports = sendEmail;
