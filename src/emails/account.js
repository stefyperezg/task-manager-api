const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from: 'stefyperezg1@gmail.com',
        subject:' Thanks for joining',
        text: `Welcome to the app, ${name}. let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to:email,
        from: 'stefyperezg1@gmail.com',
        subject: 'Sorry to see you go',
        text:`Goodbye ${name}. Is there anything we could have done to keep you on boad?`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}