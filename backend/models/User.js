import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  skills: [{ type: String }],
  rating: { type: Number, default: 0 },
  tasksPosted: { type: Number, default: 0 },
  tasksDone: { type: Number, default: 0 },
  onTimeRate: { type: Number, default: 100 },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.index({ skills: 1 });

export default mongoose.model('User', userSchema);
