import Quiz from '../model/quiz.js';
import joi from 'joi';

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

        const quiz = await Quiz.create({ user: req.authentication_payload.user_id, title, difficulty_level, questions })
        res.json({ error: true, info: 'Your quiz has been created', data: { quiz } })

    } catch (error) {
        res.status(404).json({ error: true, info: error.message, data: {} });
    }
}

//get user_id, use id to get all quizes of current user
export const getQuizList = async (req, res) => {

    try {
        //get user id
        let user_id = req.authentication_payload.user_id;

        //find list of quiz created by one user nad return data
        const quizList = await Quiz.find({ user: user_id, is_deleted: false }, { title: 1, difficulty_level: 1 });
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
        const quiz_data = await Quiz.findOne({ _id }, { is_deleted: 0, user: 0, __v: 0 });
        if (!quiz_data) {
            return res.status(404).json({ error: true, info: "No Quiz data found", data: {} })
        }

        res.json({ error: false, info: "Quiz Data", data: { quiz_data } })


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

        const quiz = await Quiz.findOne({ _id });
        if (!quiz) {
            return res.status(404).json({ error: true, info: "No Quiz data found", data: {} })
        }

        if (quiz.is_deleted) {
            return res.json({ error: true, info: "Quiz has already been deleted", data: {} })
        }

        //search and delete data
        await Quiz.updateOne({ _id }, { $set: { is_deleted: true } })

        res.json({ error: false, info: "Quiz deleted successfully", data: {} })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}