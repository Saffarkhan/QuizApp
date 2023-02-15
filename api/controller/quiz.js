import Quiz from '../model/quiz.js';
import joi from 'joi';
import CRUD from '../services/crud.js';
import AttemptedQuiz from '../model/quiz_attempted.js';
import mongoose from 'mongoose';

var { ObjectId } = mongoose.Types

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
        const quiz = await CRUD.create(Quiz, { user: req.authentication_payload.user_id, title, difficulty_level, questions })
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

        //find list of quiz created by one user and return data
        //const quizList = await Quiz.find({ user: user_id, is_deleted: false }, { title: 1, difficulty_level: 1 });

        const quizList = await CRUD.getList(Quiz,
            { user: user_id, is_deleted: false },
            { title: 1, difficulty_level: 1, user: 1 },
            [
                { path: "user", select: "name email" }
            ]
        )

        return res.json({ error: false, info: "Quiz List", data: { quizList } })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}

//get attempted quiz list 
export const getAttemptedQuizList = async (req, res) => {
    try {

        //find list of Attempted quizes
        const attemptedQuizList = await CRUD.getList(AttemptedQuiz,
            {},
            { __v: 0 },
            [
                { path: "attempted_by", select: "name email" },
                { path: "quiz", select: "title difficulty_level " },
            ]
        )

        return res.json({ error: false, info: "Attempted Quiz List", data: { attemptedQuizList } })

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
        const quiz_data = await CRUD.find(Quiz, { _id }, { is_deleted: 0, user: 0, __v: 0 })

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
        const quiz = await CRUD.find(Quiz, { _id });
        if (!quiz) {
            return res.status(404).json({ error: true, info: "No Quiz data found", data: {} })
        }

        if (quiz.is_deleted) {
            return res.json({ error: true, info: "Quiz has already been deleted", data: {} })
        }

        //search and delete data
        await CRUD.deleteObject(Quiz, _id)

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
        const quiz = await CRUD.find(Quiz, { _id })

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

        //get wrong_number of answer
        let wrong_answers = quiz.questions.length - correct_answers;

        let total_questions = quiz.questions.length;

        //let time = Date.now();

        //save attempted quiz data in database
        await CRUD.create(AttemptedQuiz, { attempted_by: req.authentication_payload.user_id, quiz: _id, correct_answers, wrong_answers, total_questions })

        res.json({ error: false, info: "", data: { correct_answers, wrong_answers } })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}

//get number of userd attempted quiz
export const numberOfUersAttemptingQuiz = async (req, res) => {
    try {
        let { quiz_id } = req.query;

        //using aggregation to perfomr queries
        let response = await CRUD.aggregate(AttemptedQuiz, [

            //stage-1: matches the data based on quiz_id
            { $match: { quiz: ObjectId(quiz_id) } },

            //stage-2: groups the documents and returns sum users attempted quiz
            { $group: { _id: "$quiz", noOfUsers: { $sum: 1 } } },

            //stage-3: applying projection to hide the _id 
            { $project: { _id: 0 } }
        ])

        return res.json({ error: false, info: "Returned Data", data: { response } })

    } catch (error) {
        console.error(error)
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}

export const checkConflit = async(req, res ) => {

    try {
        return res.json({ error: false, info: "Check code conflict ", data: { } })
        
    } catch (error) {
        return res.json({ error: true, info: error.message, data: { quiz_data } })

    }
}

//Number of quizes attempted per day
export const numberOfQuizesAttemptedPerDay = async (req, res) => {
    try {
        let { _date } = req.query;

        const quiz_per_day = await CRUD.aggregate(AttemptedQuiz, [

            { $group: { 
                    _id: { 
                      $dateToString: { 
                        format: "%Y-%m-%d", 
                        date: "$created_at"
                      } 
                    },
                    count: { $sum: 1}
                  }},

            { $sort: {
                    _id: 1
                  }}
        ])

        return res.json({ error: false, info: "Quizes Attempted per day", data: { quiz_per_day } })

    } catch (error) {
        return res.status(404).json({ error: true, info: error.message, data: {} })
    }
}
