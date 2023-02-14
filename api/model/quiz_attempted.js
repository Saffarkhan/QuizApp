import mongoose, { model, Schema } from "mongoose";
import User from './user.js';
import Quiz from './quiz.js'

const AttemptedQuizSchema = new Schema({

    attempted_by: { type: Schema.Types.ObjectId, ref: User, required: true },

    quiz: { type: Schema.Types.ObjectId, ref: Quiz, required: true },

    correct_answers: {
        type: Number, required: true
    },

    wrong_answers: {
        type: Number, required: true
    },

    total_questions: {
        type: Number,
        validation: function (value) {
            return this.correct_answers + this.wrong_answers === value
        }
    },
    created_at: {
        type: Date, 
        default: Date.now 
    }
})

export default mongoose.model("attempted_quiz", AttemptedQuizSchema)