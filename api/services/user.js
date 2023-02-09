import User from "../model/user.js";

//find user and return data
export function findUser(user_data, projection) {
 return new Promise (async (resolve, reject) => {
    try{
        let user = await User.findOne(user_data, projection)
        resolve(user)
    }catch(err){
        reject("User not found")
    }
 })
}

//register new user and save data in the database
export function createUser(user_data) {
    return new Promise(async (resolve, reject ) => {
        try {
            let registerUser = await User(user_data);
            registerUser.save()
            resolve(registerUser)
        } catch (error) {
            reject(error.message)
        }
    })
}

