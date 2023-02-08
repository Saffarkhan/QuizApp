import express from 'express';
import { getProfile, loginUser, registerUser } from '../controller/user.js';
import { isUserAuthorized } from '../middlewares/authentication.js';

const router = express.Router();

//create new user data in database
router.post('/register', registerUser);

//user login
router.post("/login", loginUser)

//get/read all users data from database
router.get('/profile', isUserAuthorized, getProfile)


export default router;