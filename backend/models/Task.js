import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  etaDays: { type: Number, required: true },
  pitch: { type: String, required: true },
  placedAt: { type: Date, default: Date.now },
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Design', 'Coding', 'Notes', 'Writing', 'Tutoring', 'Video', 'Translation'],
    required: true,
  },
  skills: [{ type: String }],
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  deadline: { type: Date, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  bids: [bidSchema],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

taskSchema.index({ skills: 1 });
taskSchema.index({ 'budget.min': 1, 'budget.max': 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ status: 1 });

export default mongoose.model('Task', taskSchema);
