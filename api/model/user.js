import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    email: {
        type: String,           
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    is_deleted: { type: Boolean, default: false }
})

export default mongoose.model('User', userSchema);