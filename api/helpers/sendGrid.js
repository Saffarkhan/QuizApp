import sgMail from "@sendgrid/mail";

export async function sendEmail(email, subject, message) {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: {
                email: process.env.SENDGRID_SENDER_EMAIL // Use the email address or domain you verified above
            },
            subject: subject,
            text: message
        };
        let mail_response = await sgMail.send(msg);

        return { error: false, data: mail_response }
    } catch (error) {
        console.error(error);

        return { error: true, data: error }

    }
}