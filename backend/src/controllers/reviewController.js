import Review from '../models/Review.js';
import Event from '../models/Event.js';

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    
    // Check if user already reviewed this event
    const existingReview = await Review.findOne({ user: req.user.id, event: req.params.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this event. You can only post one review per event.' });
    }
    
    const review = await Review.create({ user: req.user.id, event: req.params.id, rating, comment });
    // Update event average rating and review count
    await updateEventStats(review.event);
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this event. You can only post one review per event.' });
    }
    console.error('Review creation error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { rating, comment },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found or you do not have permission to update it.' });
    }
    
    // Update event average rating and review count
    await updateEventStats(review.event);
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found or you do not have permission to delete it.' });
    }
    
    // Update event average rating and review count
    await updateEventStats(review.event);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.id }).populate('user', 'name');
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id }).populate('event', 'title');
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to update event average rating and review count
async function updateEventStats(eventId) {
  const agg = await Review.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: '$event', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;
  await Event.findByIdAndUpdate(eventId, { 
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count
  });
}