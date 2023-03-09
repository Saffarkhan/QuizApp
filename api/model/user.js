import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    otp: { type: String, required: true },
    image: { type: String, default: null },
    verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },

    notification: { type: String, default: null },
})


export default mongoose.model('User', userSchema);