import { verifyAuthenticationToken } from "../helpers/JWT.js";

export function isUserAuthorized(req, res, next){

    try {

        let authentication_token = req.headers.authorization;
        authentication_token = authentication_token?.split(" ")[1]

        let authentication_payload = verifyAuthenticationToken(authentication_token);
        req.authentication_payload = authentication_payload;

        next()
        
    } catch (error) {

        switch (error.name) {
            case "JsonWebTokenError":
                return res.status(400).json({error: true, info: "Invalid Authentication Token", data: {}});
            case "TokenExpiredError":
                return res.status(400).json({error: true, info: "Authentication Token expired", data: {}});                
        }

        return res.status(400).json({error: true, info: error.message, data: {}})    
    }
}
