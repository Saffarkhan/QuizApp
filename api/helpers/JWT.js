import jwt from 'jsonwebtoken';

export function createAuthenticationToken(payload){
    return jwt.sign(payload,process.env.JWT_KEY, {
        expiresIn: "10h"
    })
}

export function verifyAuthenticationToken(authentication_token){
    return jwt.verify(authentication_token, process.env.JWT_KEY)
}