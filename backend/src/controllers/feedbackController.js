import Feedback from '../models/Feedback.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// Submit feedback for an event
export const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment, organization, relevance, coordination, overall } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Verify that the event exists and is approved
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'approved') {
      return res.status(404).json({ message: 'Event not found or not approved' });
    }
    
    // Verify that the user participated in the event
    const registration = await Registration.findOne({ 
      event: eventId, 
      user: req.user.id,
      status: 'approved'
    });
    
    if (!registration) {
      return res.status(403).json({ message: 'You must have participated in this event to submit feedback' });
    }
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ event: eventId, user: req.user.id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      event: eventId,
      user: req.user.id,
      rating,
      comment,
      organization,
      relevance,
      coordination,
      overall: overall || rating // Use overall rating or default to main rating
    });
    
    // Notify admins about new feedback
    try {
      // Find all admin users
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      // Create notifications for all admins
      for (const adminId of adminIds) {
        await createNotification(
          adminId,
          'New Event Feedback Submitted',
          `User ${req.user.name} has submitted feedback for event: ${event.title}. Rating: ${rating}/5`,
          'info',
          feedback._id,
          'feedback'
        );
      }
    } catch (notificationError) {
      console.error('Failed to notify admins about new feedback:', notificationError);
    }
    
    res.status(201).json({ feedback, message: 'Feedback submitted successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Get feedback for an event
export const getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { approved = true } = req.query;
    
    // Verify that the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const filter = { event: eventId };
    if (approved !== undefined) filter.isApproved = approved === 'true';
    
    const feedback = await Feedback.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get average ratings for an event
export const getEventRatings = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify that the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const ratings = await Feedback.aggregate([
      { $match: { event: event._id, isApproved: true } },
      { $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 },
          ratingsCount: { $push: '$rating' },
          avgOrganization: { $avg: '$organization' },
          avgRelevance: { $avg: '$relevance' },
          avgCoordination: { $avg: '$coordination' },
          avgOverall: { $avg: '$overall' }
        }
      }
    ]);
    
    if (ratings.length === 0) {
      return res.json({ 
        averageRating: 0,
        totalFeedback: 0,
        ratingsDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
    
    // Calculate ratings distribution
    const ratingsCount = ratings[0].ratingsCount;
    const ratingsDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratingsCount.forEach(rating => {
      if (rating >= 1 && rating <= 5) {
        ratingsDistribution[rating]++;
      }
    });
    
    res.json({
      averageRating: Math.round(ratings[0].averageRating * 10) / 10,
      totalFeedback: ratings[0].totalFeedback,
      ratingsDistribution,
      detailedRatings: {
        organization: Math.round(ratings[0].avgOrganization * 10) / 10,
        relevance: Math.round(ratings[0].avgRelevance * 10) / 10,
        coordination: Math.round(ratings[0].avgCoordination * 10) / 10,
        overall: Math.round(ratings[0].avgOverall * 10) / 10
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's feedback
export const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user.id })
      .populate('event', 'title date');
    
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update feedback (user can only update their own feedback)
export const updateFeedback = async (req, res) => {
  try {
    const { rating, comment, organization, relevance, coordination, overall } = req.body;
    
    const feedback = await Feedback.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      feedback.rating = rating;
    }
    
    if (comment !== undefined) feedback.comment = comment;
    if (organization !== undefined) feedback.organization = organization;
    if (relevance !== undefined) feedback.relevance = relevance;
    if (coordination !== undefined) feedback.coordination = coordination;
    if (overall !== undefined) feedback.overall = overall;
    
    // Reset approval status when updated
    feedback.isApproved = false;
    feedback.approvedBy = null;
    feedback.approvedAt = null;
    
    await feedback.save();
    
    res.json({ feedback, message: 'Feedback updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete feedback (user can only delete their own feedback)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approval for feedback
export const approveFeedback = async (req, res) => {
  try {
    // Only admins can approve
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve feedback' });
    }
    
    const feedback = await Feedback.findById(req.params.id).populate('user', 'name email').populate('event', 'title');
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    feedback.isApproved = true;
    feedback.approvedBy = req.user.id;
    feedback.approvedAt = new Date();
    
    await feedback.save();
    
    // Notify user about feedback approval
    try {
      await createNotification(
        feedback.user._id,
        'Feedback Approved',
        `Your feedback for event "${feedback.event.title}" has been approved.`,
        'success',
        feedback._id,
        'feedback'
      );
    } catch (notificationError) {
      console.error('Failed to notify user about feedback approval:', notificationError);
    }
    
    res.json({ feedback, message: 'Feedback approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin rejection for feedback
export const rejectFeedback = async (req, res) => {
  try {
    // Only admins can reject
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject feedback' });
    }
    
    const feedback = await Feedback.findByIdAndDelete(req.params.id).populate('user', 'name email').populate('event', 'title');
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Notify user about feedback rejection
    try {
      await createNotification(
        feedback.user._id,
        'Feedback Rejected',
        `Your feedback for event "${feedback.event.title}" has been rejected by an admin.`,
        'warning',
        feedback._id,
        'feedback'
      );
    } catch (notificationError) {
      console.error('Failed to notify user about feedback rejection:', notificationError);
    }
    
    res.json({ message: 'Feedback rejected and deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get top rated events
export const getTopRatedEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topEvents = await Feedback.aggregate([
      { $match: { isApproved: true } },
      { $group: {
          _id: '$event',
          averageRating: { $avg: '$rating' },
          feedbackCount: { $sum: 1 }
        }
      },
      { $match: { feedbackCount: { $gte: 3 } } }, // Only events with at least 3 feedbacks
      { $sort: { averageRating: -1 } },
      { $limit: parseInt(limit) },
      { $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      { $project: {
          _id: '$_id',
          averageRating: { $round: ['$averageRating', 1] },
          feedbackCount: 1,
          event: {
            _id: '$event._id',
            title: '$event.title',
            date: '$event.date',
            location: '$event.location'
          }
        }
      }
    ]);
    
    res.json({ events: topEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};