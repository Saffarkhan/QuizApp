import express from 'express';
import { createQuiz, getQuizList, getQuiz, deleteQuiz } from '../controller/quiz.js';
import { isUserAuthorized } from '../middlewares/authentication.js';

const router = express.Router();

//create new quiz in the database 
router.post('/create', isUserAuthorized, createQuiz);

router.get("/list", isUserAuthorized, getQuizList)

//get quiz
router.get('/get', isUserAuthorized, getQuiz)

//update data
router.put('/delete', isUserAuthorized, deleteQuiz)

export default router;