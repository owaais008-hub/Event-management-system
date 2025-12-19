import mongoose from 'mongoose';

const exhibitorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    products: { type: String, required: true },
    category: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    website: { type: String },
    logoUrl: { type: String },
    booth: {
      number: { type: String },
      row: { type: String },
      size: { type: String }
    },
    approved: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false } // Make optional for public registrations
  },
  { timestamps: true }
);

export const Exhibitor = mongoose.model('Exhibitor', exhibitorSchema);
export default Exhibitor;