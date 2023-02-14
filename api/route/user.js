import express from 'express';
import { deleteUser, getProfile, loginUser, registerUser, verifyUser } from '../controller/user.js';
import { isUserAuthorized } from '../middlewares/authentication.js';

const router = express.Router();

//create new user data in database
router.post('/register', registerUser);

//Verifdy OTP
router.post("/verify", verifyUser)

//user login
router.post("/login", loginUser)

//get/read all users data from database
router.get('/profile', isUserAuthorized, getProfile)

//delete user ( inactivate )
router.put('/delete', isUserAuthorized, deleteUser)


export default router;