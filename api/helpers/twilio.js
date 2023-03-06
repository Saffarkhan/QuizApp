import twilio from "twilio"

export const sendMesssag = async (reveiver, message) => {
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

        return client.messages.create({
            body: message,
            from: '+15075196540',
            to: reveiver, 
        })
        .then(twilio_succes => {
            return { error: false, data: twilio_succes }
        })
        .catch(err => {
            console.error(err)
            return { error: true, data: null }
        })

    } catch (error) {
        console.log(error)
        return true
    }
}
