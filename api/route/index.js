import express from 'express';
import userRoutes from "./user.js"
import quizRoute from "./quiz.js"

const router = express.Router();

router.use("/user", userRoutes)

router.use("/quiz", quizRoute)

export default router;