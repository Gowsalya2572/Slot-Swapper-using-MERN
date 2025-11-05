import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  socketId: { type: String }, // for realtime notifications
}, { timestamps: true });

const User= mongoose.model('User', userSchema);


export default User;