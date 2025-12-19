import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  organization: {
    type: Number,
    min: 1,
    max: 5
  },
  relevance: {
    type: Number,
    min: 1,
    max: 5
  },
  coordination: {
    type: Number,
    min: 1,
    max: 5
  },
  overall: {
    type: Number,
    min: 1,
    max: 5
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure a user can only submit one feedback per event
feedbackSchema.index({ event: 1, user: 1 }, { unique: true });

// Index for faster lookups
feedbackSchema.index({ event: 1 });
feedbackSchema.index({ isApproved: 1 });
feedbackSchema.index({ rating: 1 });

export default mongoose.model('Feedback', feedbackSchema);