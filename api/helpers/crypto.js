import crypto from "crypto"

export function encrypt(data, key) {
    if (!key) { key = process.env.APPCRYPTOVERIFICATIONENCRYPTIONKEY }
    const cipher = crypto.createCipheriv("aes-256-cbc", key, process.env.APPCRYPTOVERIFICATIONENCRYPTIONVECTOR)
    let encryptedData = cipher.update(data, 'utf-8', 'hex')
    encryptedData += cipher.final('hex')
    return encryptedData
}

