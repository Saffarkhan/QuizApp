import mongoose, { Schema } from 'mongoose';
import User from './user.js';

const quizSchema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: User },

    title: {
        type: String,
        required: true,
    },
    difficulty_level: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Expert"]
    },

    questions: {
        type: [{
            title: { type: String, required: true },
            options: {
                type: [{
                    type: String
                }],
                validate: [areThereFourOptions, '{PATH} should have exactly 4 values']
            },
            answer: { type: String, required: true }
        }],
        validate: [minimumQuestions, '{PATH} should have minimum of 1']
    },

    is_deleted: { type: Boolean, default: false }

});


function minimumQuestions(value) {
    return value.length > 0
}

function areThereFourOptions(value) {
    return value.length === 4
}

export default mongoose.model("Quiz", quizSchema)