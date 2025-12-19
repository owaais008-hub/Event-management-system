import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'other'
  },
  tags: [{
    type: String
  }],
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookups
gallerySchema.index({ event: 1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ isFeatured: 1 });
gallerySchema.index({ tags: 1 });
gallerySchema.index({ approved: 1 });

export default mongoose.model('Gallery', gallerySchema);