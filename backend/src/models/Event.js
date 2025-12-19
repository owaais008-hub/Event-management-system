import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    capacity: { type: Number, default: 0 },
    posterUrl: { type: String, required: true }, // Make posterUrl required
    tags: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 } // For sorting by popularity
  },
  { timestamps: true }
);

// Index for faster searches
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ category: 1 });
eventSchema.index({ department: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ popularity: -1 });

export const Event = mongoose.model('Event', eventSchema);
export default Event;