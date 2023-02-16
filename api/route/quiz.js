import express from 'express';
import { createQuiz, getQuizList, getQuiz, deleteQuiz, checkQuiz, getAttemptedQuizList, numberOfUersAttemptingQuiz, numberOfQuizesAttemptedPerDay, pagination } from '../controller/quiz.js';
import { isUserAuthorized } from '../middlewares/authentication.js';

const router = express.Router();

//create new quiz in the database 
router.post('/create', isUserAuthorized, createQuiz);

router.get("/list", isUserAuthorized, getQuizList)

router.get("/attemptedlist", isUserAuthorized, getAttemptedQuizList)

//get quiz
router.get('/get', isUserAuthorized, getQuiz)

//update data
router.put('/delete', isUserAuthorized, deleteQuiz)

//check quiz
router.post('/check', isUserAuthorized, checkQuiz);

router.get('/quizreport', isUserAuthorized, numberOfUersAttemptingQuiz)

router.get('/quizattempted', isUserAuthorized, numberOfQuizesAttemptedPerDay)

router.get('/pagination', isUserAuthorized, pagination)

export default router;