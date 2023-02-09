import Quiz from '../model/quiz.js';
import joi from 'joi';
import { findQuiz, create, deleteSingleQuiz, findQuizList } from '../services/quiz.js';

// create quiz 
export const createQuiz = async (req, res) => {

    //api request validation schema
    let validation_schema = joi.object({
        title: joi.string().uppercase()
            .messages({
                'string.empty': "Title cannot be empty",
                'any.required': "Title is required",
                'string.uppercase': "Title must be in uppercase",
            }).required(),
        difficulty_level: joi.string().valid("Beginner", "Intermediate", "Expert").required().messages({
            'any.only': "Difficulty level must be one of the following levels: Beginner, Intermediate, Expert",
            'any.required': "Difficulty level field is required"
        }),
        questions: joi.array().items(joi.object().keys({
            title: joi.string().required().messages({
                'string.empty': "Title cannot be empty",
                'any.required': "Title is required"
            }),
            options: joi.array().items(
                joi.string()
            ).min(4).max(4).messages({
                'array.min': 'There must be 4 options',
                'array.max': 'There must be only 4 options'
            }),
            answer: joi.string()
                .valid(joi.ref('options', {
                    in: true,
                    adjust: (options) => options.map(option => option)
                }))
                .required().messages({
                    'any.only': "Answer must be one of the following: {options}"
                }).error(err => { console.log(err); return err }),
        })).min(1).messages({
            'array.min': "There must be atleast 1 Questions",
            'any.required': "Quesitions field is required"
        })
    })

    //error handeling of api validation
    let { error, value } = validation_schema.validate(req.body)
    if (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }

    try {

        const { title, difficulty_level, questions } = req.body;

        //const quiz = await Quiz.create({ user: req.authentication_payload.user_id, title, difficulty_level, questions })
        const quiz = await create({user: req.authentication_payload.user_id, title, difficulty_level, questions})
        return res.json({ error: true, info: 'Your quiz has been created', data: { quiz } })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} });
    }
}

//get user_id, use id to get all quizes of current user
export const getQuizList = async (req, res) => {

    try {
        //get user id
        let user_id = req.authentication_payload.user_id;

        //find list of quiz created by one user nad return data
        //const quizList = await Quiz.find({ user: user_id, is_deleted: false }, { title: 1, difficulty_level: 1 });
        
        const quizList = await findQuizList({ user: user_id, is_deleted: false }, { title: 1, difficulty_level: 1 })
        return res.json({ error: false, info: "Quiz List", data: { quizList } })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}

//get single quiz Details
export const getQuiz = async (req, res) => {

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

        let { _id } = req.query

        //search database and get user_id
        //const quiz_data = await Quiz.findOne({ _id }, { is_deleted: 0, user: 0, __v: 0 });
        const quiz_data = await findQuiz({ _id }, { is_deleted: 0, user: 0, __v: 0 })

        if (!quiz_data) {
            return res.status(404).json({ error: true, info: "No Quiz data found", data: {} })
        }

        return res.json({ error: false, info: "Quiz Data", data: { quiz_data } })


    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
};

//soft delete data
export const deleteQuiz = async (req, res) => {

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

        //const quiz = await Quiz.findOne({ _id });
        const quiz = await findQuiz({ _id });
        if (!quiz) {
            return res.status(404).json({ error: true, info: "No Quiz data found", data: {} })
        }

        if (quiz.is_deleted) {
            return res.json({ error: true, info: "Quiz has already been deleted", data: {} })
        }

        //search and delete data
        //await Quiz.updateOne({ _id }, { $set: { is_deleted: true } })
        await deleteSingleQuiz({ _id }, { $set: { is_deleted: true } })

        return res.json({ error: false, info: "Quiz deleted successfully", data: {} })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}

//Check quiz
export const checkQuiz = async (req, res) => {

    //api request validation 
    let validation_schema = joi.object({
        _id: joi.string().messages({
            'string.empty': "_id cannot be empty",
            'any.required': "_id is required"
        }).required(),
        answers: joi.array().items(joi.object().keys({
            question_id: joi.string().required(),
            attempted_answer: joi.string().required()
        })).min(1)

    })

    //error handeling of api validation
    let { error, value } = validation_schema.validate(req.body)
    if (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }

    try {

        //get quiz_id
        var { _id, answers } = req.body;
        //const quiz = await Quiz.findOne({ _id }).lean()
        const quiz = await findQuiz({ _id })
        
        //check if quiz is avaible, if not show message
        if (!quiz) {
            return res.json({ error: true, info: "No Quiz found", data: {} })
        }

        //check number of answers equal to number of questions
        if (quiz.questions.length !== answers.length) {
            return res.json({ error: true, info: "Answers must be of equal length to the questions", data: {} })
        }

        //get ids of answer and question and check ids match or not
        for (let i = 0; i < quiz.questions.length; i += 1) {
            if (quiz.questions[i]._id.toString() !== answers[i].question_id) {
                return res.json({ error: true, info: "Answers must be in the same order as the questions or question id does not exist", data: {} })
            }
        }

        //converting array to object. get values of array (quiz_id and answer value)
        let answers_object = answers.reduce((prev_object, answer) => {
            return { ...prev_object, [answer.question_id]: answer.attempted_answer }
        }, {})

        //check if user's entered answer match with the provided answer, // if yes return correct number of answer
        let correct_answers = quiz.questions.reduce((correct_count, question) => {
            return question.answer === answers_object[question._id] ? correct_count + 1 : correct_count
        }, 0)

        //send res on success 
        res.json({ error: false, info: "", data: { correct_answers, wrong_answer: quiz.questions.length - correct_answers } })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}