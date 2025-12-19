import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
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
  certificateUrl: {
    type: String,
    required: true
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  qrCodeDataUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster lookups
certificateSchema.index({ event: 1, user: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 });

export default mongoose.model('Certificate', certificateSchema);