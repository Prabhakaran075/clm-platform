const sgMail = require('@sendgrid/mail');
const { Resend } = require('resend');

const sendEmail = async (options) => {
    // 1. Try SendGrid (Primary for Company Email IDs)
    if (process.env.SENDGRID_API_KEY) {
        console.log(`DEBUG: Attempting to send email to ${options.email} via SendGrid API...`);
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: options.email,
            from: process.env.COMPANY_EMAIL || 'no-reply@nexgennextopia.com', // Must be verified in SendGrid
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        try {
            const response = await sgMail.send(msg);
            console.log('DEBUG: SendGrid API success');
            return { success: true };
        } catch (error) {
            console.error('DEBUG: SendGrid API error:', error.response ? error.response.body : error.message);
            // If SendGrid fails, try Resend fallback if available
        }
    }

    // 2. Try Resend (Fallback)
    if (process.env.RESEND_API_KEY) {
        console.log(`DEBUG: Sending email to ${options.email} via Resend API...`);
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: 'NexCLM <onboarding@resend.dev>', // Free trial mode
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html,
            });

            if (error) {
                console.error('DEBUG: Resend API returned an error:', JSON.stringify(error, null, 2));
                throw new Error(error.message);
            }

            console.log('DEBUG: Resend API success:', data.id);
            return { success: true };
        } catch (error) {
            console.error('DEBUG: Resend Exception caught:', error.message);
        }
    }

    // 3. Development Logging (If no keys are found)
    if (!process.env.SENDGRID_API_KEY && !process.env.RESEND_API_KEY) {
        if (process.env.NODE_ENV !== 'production') {
            console.log('----------------------------------------------------');
            console.log('DEVELOPMENT MODE: EMAIL LOG (MISSING API KEYS)');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: ${options.message}`);
            console.log('----------------------------------------------------');
            return { success: true };
        }
    }

    return {
        success: false,
        error: 'Email service configuration missing',
        details: 'MISSING_API_CREDENTIALS'
    };
};

module.exports = sendEmail;
