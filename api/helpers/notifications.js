import admin from "firebase-admin"
import CRUD from "../services/crud.js"
import User from "../model/user.js";

import serviceAccount from "../config/firebaseConfig.json" //JSON.parse(process.env.FIREBASECONFIG)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

export function sendNotification(user_id, title, message, type) {
    return new Promise(async (resolve, reject) => {
        try {
            let user = CRUD.find(User, { _id: user_id })
            let registration_token = user.notification

            if (registration_token) {
                const payload = {
                    notification: {
                        title: title, 
                        body: message,
                    },
                    data: {
                        type: type
                    }
                }
                admin.messaging().sendToDevice(registration_token, payload, {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                })
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.error(err);
                });
            }

        } catch (error) {
            console.error(error)
            reject(error)
        }
    })
}