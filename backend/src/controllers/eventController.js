import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import { createNotification, createBulkNotifications } from './notificationController.js';

export const createEvent = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before creating events.' 
        });
      }
    }
    
    // Check if poster is provided
    if (!req.file) {
      return res.status(400).json({ message: 'Event poster is required' });
    }
    
    // Combine date and time fields if both are provided
    let eventDate = req.body.date;
    if (req.body.date && req.body.time) {
      eventDate = new Date(`${req.body.date}T${req.body.time}`);
    }
    
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Create event object with all required fields
    const eventData = {
      ...req.body,
      date: eventDate,
      organizerId: req.user.id,
      posterUrl
    };
    
    const event = await Event.create(eventData);
    // Notify organizer that event is submitted for approval
    await createNotification(
      req.user.id,
      `Event Submitted: ${event.title}`,
      'Your event was submitted and is pending admin approval.',
      'info',
      event._id,
      'event'
    );

    // Notify all admins about pending event
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins?.length) {
      await createBulkNotifications(
        admins.map(a => a._id),
        `Pending Event: ${event.title}`,
        'A new event is awaiting your approval.',
        'warning',
        event._id,
        'event'
      );
    }

    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before updating events.' 
        });
      }
    }
    
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    // Combine date and time fields if both are provided
    let eventDate = req.body.date;
    if (req.body.date && req.body.time) {
      eventDate = new Date(`${req.body.date}T${req.body.time}`);
    }
    
    const update = { ...req.body };
    if (posterUrl) update.posterUrl = posterUrl;
    if (eventDate) update.date = eventDate;
    
    const event = await Event.findOneAndUpdate({ _id: req.params.id, organizerId: req.user.id }, update, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before deleting events.' 
        });
      }
    }
    
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizerId: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const {
      q,
      category,
      status,
      department,
      organizer,
      dateFrom,
      dateTo,
      sortBy = 'popularity',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      popular = false,
      location,
      price,
      tags,
      userLat,
      userLng,
      radius = 50 // km
    } = req.query;

    const filter = {};

    // Advanced text search with weighted scoring
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { category: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter with multiple selection support
    if (category) {
      if (Array.isArray(category)) {
        filter.category = { $in: category };
      } else if (category.includes(',')) {
        filter.category = { $in: category.split(',').map(c => c.trim()) };
      } else {
        filter.category = category;
      }
    }

    // Department filter
    if (department) filter.department = department;

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagArray };
    }

    // Location-based filtering (if coordinates provided)
    if (userLat && userLng && radius) {
      // Note: This would require adding geospatial indexing to the Event model
      // For now, we'll use simple location matching
      if (location) {
        filter.venue = { $regex: location, $options: 'i' };
      }
    } else if (location) {
      filter.venue = { $regex: location, $options: 'i' };
    }

    // Price filter (if we add pricing later)
    if (price) {
      const [min, max] = price.split('-').map(p => parseFloat(p));
      if (min && max) {
        filter.price = { $gte: min, $lte: max };
      } else if (min) {
        filter.price = { $gte: min };
      }
    }

    // Date range filter with smart defaults
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    } else {
      // Default to upcoming events (no upper bound)
      const now = new Date();
      filter.date = { $gte: now };
    }

    // Status filtering: Only show approved events to all users
    // Exception: Organizers can see their own events, admins can see all
    if (req.user && req.user.role === 'admin') {
      // Admin can see all events - apply status filter if provided
      if (status) {
        filter.status = status;
      }
    } else if (req.user && req.user.role === 'organizer') {
      // Organizers can see approved events + their own events (even if pending/rejected)
      // If filtering by organizer in query params, handle it specially
      if (organizer && organizer === req.user.id) {
        // Organizer filtering by their own ID - show all their events
        filter.organizerId = req.user.id;
        // If status filter is explicitly provided, apply it
        if (status) {
          filter.status = status;
    }
      } else if (organizer) {
        // Organizer filtering by another organizer's ID - only show approved events from that organizer
        filter.organizerId = organizer;
        filter.status = 'approved';
      } else {
        // Show approved events + organizer's own events
        filter.$or = [
          { status: 'approved' },
          { organizerId: req.user.id }
        ];
        // If status filter is explicitly provided, apply it
        if (status) {
          filter.status = status;
          delete filter.$or; // Override the $or logic if status is explicitly set
        }
      }
    } else {
      // Regular users and unauthenticated users: Only show approved events
      filter.status = 'approved';
      // Organizer filter (if provided) - only applies to approved events
      if (organizer) filter.organizerId = organizer;
    }

    // Advanced sorting with multiple criteria
    const sort = {};

    switch (sortBy) {
      case 'popularity':
        sort.popularity = -1;
        sort.averageRating = -1;
        sort.reviewCount = -1;
        break;
      case 'trending':
        // Events with most recent activity
        sort.updatedAt = -1;
        sort.popularity = -1;
        break;
      case 'recommended':
        if (req.user) {
          // Personalized sorting based on user interests
          sort.averageRating = -1;
          sort.popularity = -1;
        }
        sort.date = 1;
        break;
      case 'nearest':
        // Would require geospatial sorting
        sort.date = 1;
        break;
      case 'price_low':
        sort.price = 1;
        break;
      case 'price_high':
        sort.price = -1;
        break;
      case 'rating':
        sort.averageRating = -1;
        sort.reviewCount = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      default:
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Pagination with smart defaults
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get events with optimized queries
    const events = await Event.find(filter)
      .populate('organizerId', 'name department avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    const total = await Event.countDocuments(filter);

    // Enhanced event data with computed fields
    const eventIds = events.map(event => event._id);

    // Get registration counts
    const registrationCounts = await Registration.aggregate([
      { $match: { event: { $in: eventIds }, status: 'approved' } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);

    // Get review statistics
    const reviewStats = await Registration.aggregate([
      { $match: { event: { $in: eventIds }, status: 'attended' } },
      { $lookup: { from: 'reviews', localField: '_id', foreignField: 'registration', as: 'review' } },
      { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: '$event',
        avgRating: { $avg: '$review.rating' },
        reviewCount: { $sum: { $cond: ['$review', 1, 0] } }
      }}
    ]);

    // Create lookup maps
    const registrationCountMap = {};
    registrationCounts.forEach(item => {
      registrationCountMap[item._id] = item.count;
    });

    const reviewStatsMap = {};
    reviewStats.forEach(item => {
      reviewStatsMap[item._id] = {
        averageRating: item.avgRating || 0,
        reviewCount: item.reviewCount || 0
      };
    });

    // Calculate popularity scores and enhance events
    const eventsWithEnhancedData = events.map(event => {
      const registeredCount = registrationCountMap[event._id] || 0;
      const reviewData = reviewStatsMap[event._id] || { averageRating: 0, reviewCount: 0 };

      // Calculate dynamic popularity score
      const popularityScore = calculatePopularityScore(event, registeredCount, reviewData);

      return {
        ...event,
        registeredCount,
        averageRating: reviewData.averageRating,
        reviewCount: reviewData.reviewCount,
        popularity: popularityScore,
        capacityLeft: event.capacity ? Math.max(0, event.capacity - registeredCount) : null,
        isAlmostFull: event.capacity ? registeredCount / event.capacity > 0.8 : false,
        isNew: Date.now() - new Date(event.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000, // 7 days
        isUpcoming: new Date(event.date) > new Date() && new Date(event.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        tags: event.tags || [],
        // Add user-specific data
        isRegistered: req.user ? false : null, // Would need to check user's registrations
        isBookmarked: req.user ? false : null, // Would need to check user's bookmarks
      };
    });

    // Apply user-based personalization if logged in
    let personalizedEvents = eventsWithEnhancedData;
    if (req.user) {
      personalizedEvents = await personalizeResultsForUser(eventsWithEnhancedData, req.user);
    }

    res.json({
      events: personalizedEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEvents: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        applied: {
          q, category, department, location, tags, dateFrom, dateTo, price
        },
        available: await getAvailableFilters()
      },
      user: req.user ? {
        personalized: true,
        interests: req.user.interests || []
      } : null
    });
  } catch (err) {
    console.error('Error in listEvents:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to calculate popularity score
function calculatePopularityScore(event, registeredCount, reviewData) {
  const now = new Date();
  const eventDate = new Date(event.date);
  const daysUntilEvent = Math.max(0, (eventDate - now) / (1000 * 60 * 60 * 24));

  // Base score from registrations and ratings
  let score = (registeredCount * 2) + (reviewData.averageRating * reviewData.reviewCount);

  // Boost for upcoming events
  if (daysUntilEvent <= 7) score *= 1.5;
  else if (daysUntilEvent <= 30) score *= 1.2;

  // Boost for highly rated events
  if (reviewData.averageRating >= 4.5) score *= 1.3;

  // Boost for new events
  const daysSinceCreated = (now - new Date(event.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 7) score *= 1.1;

  return Math.round(score * 100) / 100;
}

// Helper function to personalize results for logged-in users
async function personalizeResultsForUser(events, user) {
  // This would implement collaborative filtering, content-based recommendations, etc.
  // For now, we'll boost events matching user interests and department

  return events.map(event => {
    let relevanceScore = 0;

    // Boost events from user's department
    if (user.department && event.department === user.department) {
      relevanceScore += 20;
    }

    // Boost events matching user interests
    if (user.interests && event.tags) {
      const matchingInterests = user.interests.filter(interest =>
        event.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
      );
      relevanceScore += matchingInterests.length * 15;
    }

    // Boost events from organizers user has interacted with before
    // This would require tracking user behavior

    return {
      ...event,
      relevanceScore,
      personalized: relevanceScore > 0
    };
  }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

// Helper function to get available filter options
async function getAvailableFilters() {
  try {
    const categories = await Event.distinct('category');
    const departments = await Event.distinct('department');
    const tags = await Event.distinct('tags');
    const locations = await Event.distinct('location');

    return {
      categories: categories.filter(Boolean),
      departments: departments.filter(Boolean),
      tags: tags.filter(Boolean).flat(),
      locations: locations.filter(Boolean)
    };
  } catch (error) {
    return {};
  }
}

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'name department');
    if (!event) return res.status(404).json({ message: 'Not found' });
    
    // Check if user can access this event based on approval status
    // Admins can see all events
    // Organizers can see approved events + their own events
    // Regular users and unauthenticated users can only see approved events
    if (req.user && req.user.role === 'admin') {
      // Admin can see all events - no restriction
    } else if (req.user && req.user.role === 'organizer') {
      // Organizers can see approved events + their own events
      if (event.status !== 'approved' && event.organizerId._id.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: 'This event is pending approval and is only visible to the organizer.' 
        });
      }
    } else {
      // Regular users and unauthenticated users can only see approved events
      if (event.status !== 'approved') {
        return res.status(403).json({ 
          message: 'This event is pending approval and is not yet available for viewing.' 
        });
      }
    }
    
    const count = await Registration.countDocuments({ event: event._id, status: { $ne: 'cancelled' } });
    res.json({ event, registrations: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};