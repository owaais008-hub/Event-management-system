import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'denied', 'attended', 'cancelled'], default: 'pending' },
    qrCodeDataUrl: { type: String },
    checkedInAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    denialReason: { type: String },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

registrationSchema.index({ user: 1, event: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;