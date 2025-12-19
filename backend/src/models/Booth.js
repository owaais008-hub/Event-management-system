import mongoose from 'mongoose';

const boothSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    number: { type: String, required: true },
    row: { type: String, required: true },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservedAt: { type: Date },
    exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor' },
    description: { type: String },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  },
  { timestamps: true }
);

// Ensure unique booth numbers per event
boothSchema.index({ eventId: 1, number: 1 }, { unique: true });

export const Booth = mongoose.model('Booth', boothSchema);
export default Booth;