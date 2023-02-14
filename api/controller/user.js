import User from '../model/user.js';
import joi from "joi"
import { createAuthenticationToken } from '../helpers/JWT.js';
import CRUD from '../services/crud.js';
import bcrypt from 'bcryptjs';


const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

//register user data in database
export const registerUser = async (req, res) => {

    //api (request) validation schema
    let validation_schema = joi.object({
        name: joi.string().required().messages({
            'string.empty': "Name can not be empty",
            'any.required': "Name is required"
        }),
        email: joi.string().email().required().messages({
            'any.required': "Email is required",
            'string.email': "The given email is not a valid email address",
        }),
        password: joi.string().regex(new RegExp(passwordRegex)).required().messages({
            'any.required': "Passwword is required",
            'string.pattern.base': 'Password must be strong. At least one upper case alphabet. At least one lower case alphabet. At least one digit. At least one special character. Minimum eight in length'
        })
    })

    let { error, value } = validation_schema.validate(req.body)

    //api error handeling
    if (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }

    try {
        //search query to find data from database

        const { name, email, password } = req.body;
        const saltRounds = 10;
        const hashedPwd = await bcrypt.hash(password, saltRounds);

        let user = await CRUD.find(User, { email, is_deleted: false })
        //check if user exit, if yes return message
        if (user) {
            return res.status(404).json({ error: true, info: "A user with this email address already exists!", data: {} })
        }
        //if user not exist create new uesr
        // const registerUserdetails = await User.create({ name, email, password })

        const registerUserdetails = await CRUD.create(User, { name, email, password: hashedPwd, otp: Math.floor(Math.random() * 1000000) })
        res.json({ error: false, info: "User data added to DB", data: { registerUserdetails } });
    }
    catch (error) {
        res.status(404).json({ error: true, info: error.message, data: {} })

    }
}

//Login user to get account acccess
export const loginUser = async (req, res, next) => {

    //api (request) validation
    let user_login_validation = joi.object({
        email: joi.string().email().required().messages({
            'any.required': "Email is required!",
            'string.email': "The given email is not a valid email address"
        }),
        password: joi.string().regex(passwordRegex).min(8).required().messages({
            'any.required': "Password is required",
            'string.min': "Password length must be at least 8 characters long",
        })
    });

    let { error, value } = user_login_validation.validate(req.body);
    if (error) {
        return res.status(400).json({ error: true, info: error.message, data: {} })
    }

    try {

        //get user email and password from database
        const { email, password } = req.body;

        //search query for email and password
        //let user = await User.findOne({ email: email, password: password, is_deleted: false })
        let user = await CRUD.find(User, { email, is_deleted: false })


        //if incorrect email and password return a message
        if (!user) {
            return res.status(404).json({ error: true, info: "Incorrect email", data: {} })
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(404).json({ error: true, info: "Incorrect password", data: {} })
        }

        if (!user.verified) {
            return res.status(404).json({ error: true, info: "Please verify your email first", data: {} })
        }

        //creating payload for authentication
        let payload = {
            user_id: user._id
        }

        //get authentication token
        let authentication_token = createAuthenticationToken(payload);

        return res.json({ error: false, info: "User Logged In Successfully ", data: { authentication_token } })


    } catch (error) {
        res.status(404).json({ error: true, info: error.message, data: {} })
    }
}

//get the data from database
export const getProfile = async (req, res) => {
    try {

        let user_id = req.authentication_payload.user_id

        //get the data from datase
        //const user_profile = await User.findOne({ _id: user_id }, { name: 1, email: 1 })

        const user_profile = await CRUD.find(User, { _id: user_id }, { name: 1, email: 1 })
        if (!user_profile) {
            return res.status(404).json({ error: true, info: "No data avaialble in Database", data: {} });
        }

        return res.json({ error: false, info: "Complete data", data: { user_profile } });

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} });
    }

}

//delete single user (provide user id)
export const deleteUser = async (req, res) => {

    let validation_schema = joi.object({
        _id: joi.string().messages({
            'string.empty': "_id cannot be empty",
            'any.required': "_id is required"
        }).required(),
    })

    //error handeling of api validation
    let { error, value } = validation_schema.validate(req.query)
    if (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }


    try {
        let { _id } = req.query;

        // user is available in database or not
        const user = await CRUD.find(User, { _id });
        if (!user) {
            return res.status(404).json({ error: true, info: "No user data found", data: {} });
        }

        //check user data available to delete
        if (user.is_deleted) {
            return res.status(404).json({ error: true, info: "User data has already been deleted", data: {} });
        }

        await CRUD.deleteObject(User, _id)
        return res.json({ error: false, info: "User data has been deleted successfully", data: {} })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} });
    }
}

//Verify OTP
export const verifyUser = async (req, res, next) => {

    //api (request) validation
    let user_otp_validation = joi.object({
        email: joi.string().email().required().messages({
            'any.required': "Email is required!",
            'string.email': "The given email is not a valid email address"
        }),
        otp: joi.number().min(100000).max(999999).required().messages({
            'any.required': "OTP is required",
            'number.min': "OTP length must be 6 digits",
            'number.max': "OTP length must be 6 digits",
        })
    });

    let { error, value } = user_otp_validation.validate(req.body);
    if (error) {
        return res.status(400).json({ error: true, info: error.message, data: {} })
    }

    try {

        //get user email and password from database
        const { email, otp } = req.body;

        //search query for email and password
        //let user = await User.findOne({ email: email, password: password, is_deleted: false })
        let user = await CRUD.find(User, { email, is_deleted: false })

        //if incorrect email and password return a message
        if (!user) {
            return res.status(404).json({ error: true, info: "Incorrect email", data: {} })
        }

        if (user.verified) {
            return res.status(404).json({ error: true, info: "Your Email is already verified", data: {} })
        }

        if (otp != user.otp) {
            return res.status(404).json({ error: true, info: "Invalid PIN", data: {} })
        }

        await CRUD.updateOne(User, { _id: user._id }, { verified: true })

        //creating payload for authentication
        return res.json({ error: false, info: "Email verified Successfully ", data: {} })

    } catch (error) {
        res.status(404).json({ error: true, info: error.message, data: {} })
    }
}