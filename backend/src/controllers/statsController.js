import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';

export const leaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || 'all'; // all, month, week
    const category = req.query.category || 'points'; // points, events, reviews, achievements

    let matchConditions = {
      role: { $in: ['student', 'organizer', 'admin'] },
      isBlocked: false
    };

    // Add timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      const startDate = timeframe === 'month'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      matchConditions.createdAt = { $gte: startDate };
    }

    let sortField = 'points';
    let projection = 'name points avatarUrl';

    // Determine sort field and projection based on category
    switch (category) {
      case 'events':
        sortField = 'activityStats.eventsAttended';
        projection = 'name activityStats avatarUrl';
        break;
      case 'reviews':
        sortField = 'activityStats.reviewsWritten';
        projection = 'name activityStats avatarUrl';
        break;
      case 'achievements':
        // For achievements, we need to unwind and count
        const achievementLeaders = await User.aggregate([
          { $match: matchConditions },
          { $unwind: '$achievements' },
          { $group: {
            _id: '$_id',
            name: { $first: '$name' },
            avatarUrl: { $first: '$avatarUrl' },
            achievementCount: { $sum: 1 },
            achievements: { $push: '$achievements' }
          }},
          { $sort: { achievementCount: -1 } },
          { $limit: limit }
        ]);
        return res.json({
          leaderboard: achievementLeaders,
          category,
          timeframe,
          total: achievementLeaders.length
        });

      case 'engagement':
        sortField = 'activityStats.lastActive';
        projection = 'name activityStats avatarUrl';
        break;

      default: // points
        sortField = 'points';
        projection = 'name points avatarUrl achievements';
    }

    const leaderboard = await User.find(matchConditions)
      .sort({ [sortField]: -1 })
      .limit(limit)
      .select(projection)
      .lean();

    // Add rankings and additional data
    const enhancedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      level: calculateUserLevel(user.points || 0),
      progressToNext: calculateProgressToNextLevel(user.points || 0),
      badges: user.achievements?.slice(0, 3) || [], // Show top 3 achievements
      stats: {
        eventsAttended: user.activityStats?.eventsAttended || 0,
        eventsCreated: user.activityStats?.eventsCreated || 0,
        reviewsWritten: user.activityStats?.reviewsWritten || 0,
        certificatesEarned: user.activityStats?.certificatesEarned || 0
      }
    }));

    // Get user's own ranking if authenticated
    let userRanking = null;
    if (req.user) {
      const userRankQuery = await User.find({
        role: { $in: ['student', 'organizer', 'admin'] },
        isBlocked: false,
        [sortField]: { $gt: req.user[sortField] || 0 }
      }).countDocuments();

      userRanking = userRankQuery + 1;
    }

    res.json({
      leaderboard: enhancedLeaderboard,
      category,
      timeframe,
      total: enhancedLeaderboard.length,
      userRanking,
      metadata: {
        sortField,
        totalParticipants: await User.countDocuments(matchConditions)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper functions for gamification
function calculateUserLevel(points) {
  // Simple level calculation: every 100 points = 1 level
  return Math.floor(points / 100) + 1;
}

function calculateProgressToNextLevel(points) {
  const currentLevel = calculateUserLevel(points);
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const progress = points - pointsForCurrentLevel;
  const totalNeeded = pointsForNextLevel - pointsForCurrentLevel;

  return Math.round((progress / totalNeeded) * 100);
}

export const recommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 6;
    const now = new Date();

    // Get user's activity data
    const user = await User.findById(userId).select('interests department activityStats bookmarks following preferences');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user's past registrations and reviews for preference analysis
    const [
      userRegistrations,
      userReviews,
      userBookmarks
    ] = await Promise.all([
      Registration.find({ user: userId, status: 'attended' }).populate('event', 'category department tags'),
      Review.find({ user: userId }).populate('event', 'category department tags'),
      user.bookmarks || []
    ]);

    // Analyze user preferences
    const preferences = {
      categories: new Set(),
      departments: new Set(),
      tags: new Set(),
      likedCategories: new Map(),
      dislikedCategories: new Map()
    };

    // From registrations
    userRegistrations.forEach(reg => {
      if (reg.event?.category) preferences.categories.add(reg.event.category);
      if (reg.event?.department) preferences.departments.add(reg.event.department);
      if (reg.event?.tags) reg.event.tags.forEach(tag => preferences.tags.add(tag));
    });

    // From reviews (weight higher for positive reviews)
    userReviews.forEach(review => {
      if (review.event?.category) {
        const weight = review.rating >= 4 ? 2 : review.rating <= 2 ? -1 : 1;
        preferences.likedCategories.set(
          review.event.category,
          (preferences.likedCategories.get(review.event.category) || 0) + weight
        );
      }
      if (review.event?.tags) {
        reg.event.tags.forEach(tag => preferences.tags.add(tag));
      }
    });

    // From user interests
    if (user.interests) {
      user.interests.forEach(interest => preferences.tags.add(interest));
    }

    // Build recommendation query
    const baseFilter = {
      date: { $gte: now },
      status: 'approved',
      organizerId: { $ne: userId } // Don't recommend own events
    };

    // Exclude already registered/bookmarked events
    const excludeEventIds = [
      ...userRegistrations.map(r => r.event._id),
      ...userBookmarks
    ].filter(Boolean);

    if (excludeEventIds.length > 0) {
      baseFilter._id = { $nin: excludeEventIds };
    }

    // Create scoring pipeline for recommendations
    const recommendationPipeline = [
      { $match: baseFilter },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Category match (high weight)
              {
                $cond: {
                  if: { $in: ['$category', Array.from(preferences.categories)] },
                  then: 30,
                  else: 0
                }
              },
              // Department match
              {
                $cond: {
                  if: { $in: ['$department', Array.from(preferences.departments)] },
                  then: 20,
                  else: 0
                }
              },
              // Tag matches
              {
                $multiply: [
                  {
                    $size: {
                      $setIntersection: ['$tags', Array.from(preferences.tags)]
                    }
                  },
                  10
                ]
              },
              // Popularity boost (but not too much)
              { $multiply: ['$popularity', 0.1] },
              // Recent events slight boost
              {
                $cond: {
                  if: { $gte: ['$createdAt', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)] },
                  then: 5,
                  else: 0
                }
              }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1, date: 1, averageRating: -1 } },
      { $limit: limit * 2 }, // Get more for diversity
      {
        $lookup: {
          from: 'users',
          localField: 'organizerId',
          foreignField: '_id',
          as: 'organizer'
        }
      },
      { $unwind: '$organizer' },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          department: 1,
          date: 1,
          location: 1,
          posterUrl: 1,
          tags: 1,
          capacity: 1,
          averageRating: 1,
          reviewCount: 1,
          relevanceScore: 1,
          organizer: { name: 1, department: 1 },
          isRecommended: { $gte: ['$relevanceScore', 20] }
        }
      }
    ];

    let recommendedEvents = await Event.aggregate(recommendationPipeline);

    // If we don't have enough personalized recommendations, add some popular events
    if (recommendedEvents.length < limit) {
      const popularEvents = await Event.find({
        ...baseFilter,
        _id: { $nin: recommendedEvents.map(e => e._id).concat(excludeEventIds) }
      })
      .populate('organizerId', 'name department')
      .sort({ popularity: -1, averageRating: -1 })
      .limit(limit - recommendedEvents.length)
      .lean();

      recommendedEvents = [
        ...recommendedEvents,
        ...popularEvents.map(event => ({
          ...event,
          relevanceScore: 0,
          isRecommended: false,
          organizer: {
            name: event.organizerId?.name,
            department: event.organizerId?.department
          }
        }))
      ];
    }

    // Add registration counts and format response
    const eventIds = recommendedEvents.map(e => e._id);
    const registrationCounts = await Registration.aggregate([
      { $match: { event: { $in: eventIds }, status: 'approved' } },
      { $group: { _id: '$event', count: { $sum: 1 } } }
    ]);

    const registrationMap = new Map(
      registrationCounts.map(item => [item._id.toString(), item.count])
    );

    const finalRecommendations = recommendedEvents.slice(0, limit).map(event => ({
      ...event,
      registeredCount: registrationMap.get(event._id.toString()) || 0,
      capacityLeft: event.capacity ? Math.max(0, event.capacity - (registrationMap.get(event._id.toString()) || 0)) : null,
      isAlmostFull: event.capacity ? (registrationMap.get(event._id.toString()) || 0) / event.capacity > 0.8 : false,
      recommendationReason: getRecommendationReason(event, preferences)
    }));

    res.json({
      events: finalRecommendations,
      preferences: {
        categories: Array.from(preferences.categories),
        departments: Array.from(preferences.departments),
        tags: Array.from(preferences.tags)
      },
      total: finalRecommendations.length
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to generate recommendation reason
function getRecommendationReason(event, preferences) {
  const reasons = [];

  if (preferences.categories.has(event.category)) {
    reasons.push(`Based on your interest in ${event.category} events`);
  }

  if (preferences.departments.has(event.department)) {
    reasons.push(`From your ${event.department} department`);
  }

  const matchingTags = event.tags?.filter(tag => preferences.tags.has(tag)) || [];
  if (matchingTags.length > 0) {
    reasons.push(`Matches your interests: ${matchingTags.slice(0, 2).join(', ')}`);
  }

  if (event.averageRating >= 4.5) {
    reasons.push('Highly rated by other attendees');
  }

  return reasons.length > 0 ? reasons[0] : 'Popular event you might enjoy';
}

// Enhanced summary with gamification and engagement metrics
export const summary = async (_req, res) => {
  try {
    const now = new Date();
    const [
      totalEvents,
      approvedEvents,
      upcomingEvents,
      totalRegistrations,
      totalCustomers,
      totalOrganizers,
      activeUsers,
      totalPoints,
      totalAchievements,
      todayActivity
    ] = await Promise.all([
      Event.countDocuments({}),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'approved', date: { $gte: now } }),
      Registration.countDocuments({}),
      User.countDocuments({ role: 'student', isBlocked: false }),
      User.countDocuments({ role: { $in: ['organizer', 'admin'] }, isBlocked: false }),
      User.countDocuments({
        'activityStats.lastActive': { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]).then(result => result[0]?.total || 0),
      User.aggregate([{ $unwind: '$achievements' }, { $count: 'total' }]).then(result => result[0]?.total || 0),
      Promise.all([
        Registration.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }),
        Event.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }),
        User.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } })
      ])
    ]);

    // Calculate engagement metrics
    const engagementRate = totalCustomers > 0 ? Math.round((activeUsers / totalCustomers) * 100) : 0;
    const averagePointsPerUser = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0;

    // Get top performers this week
    const topPerformers = await User.find({
      'activityStats.lastActive': { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    })
    .sort({ points: -1 })
    .limit(5)
    .select('name points achievements avatarUrl')
    .lean();

    // Get achievement distribution
    const achievementStats = await User.aggregate([
      { $unwind: '$achievements' },
      { $group: { _id: '$achievements.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totals: {
        events: totalEvents,
        approvedEvents,
        upcomingEvents,
        registrations: totalRegistrations,
        customers: totalCustomers,
        organizers: totalOrganizers,
        activeUsers,
        totalPoints,
        totalAchievements
      },
      engagement: {
        rate: engagementRate,
        averagePointsPerUser,
        todayActivity: {
          registrations: todayActivity[0],
          events: todayActivity[1],
          users: todayActivity[2]
        }
      },
      gamification: {
        topPerformers,
        achievementStats,
        leaderboardPreview: topPerformers.slice(0, 3)
      },
      trends: {
        userGrowth: totalCustomers > 0 ? Math.round((todayActivity[2] / totalCustomers) * 100) : 0,
        eventGrowth: totalEvents > 0 ? Math.round((todayActivity[1] / totalEvents) * 100) : 0,
        registrationGrowth: totalRegistrations > 0 ? Math.round((todayActivity[0] / totalRegistrations) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Popular/trending events
export const trending = async (_req, res) => {
  try {
    // Popular by registrations
    const popularAgg = await Registration.aggregate([
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const popularIds = popularAgg.map(p => p._id).filter(Boolean);
    const popular = await Event.find({ _id: { $in: popularIds } }).lean();
    // Preserve order of popularity
    const popularityMap = new Map(popularAgg.map(p => [String(p._id), p.count]));
    const popularOrdered = popular
      .map(e => ({ ...e, registrations: popularityMap.get(String(e._id)) || 0 }))
      .sort((a,b) => (b.registrations - a.registrations));

    // Top rated events
    const topRated = await Event.find({ status: 'approved' })
      .sort({ averageRating: -1 })
      .limit(6)
      .lean();

    // Recently added approved events
    const recent = await Event.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.json({ popular: popularOrdered, topRated, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Stats for dashboard widgets (categories and upcoming timeline)
export const dashboardStats = async (_req, res) => {
  try {
    const categories = await Event.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const upcomingByMonth = await Event.aggregate([
      { $match: { status: 'approved', date: { $gte: new Date() } } },
      { $project: { ym: { $dateToString: { format: '%Y-%m', date: '$date' } } } },
      { $group: { _id: '$ym', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    res.json({ categories, upcomingByMonth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Enhanced analytics data for admin dashboard with real-time insights
export const analytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const now = new Date();

    // Get comprehensive total counts
    const [
      totalEvents,
      totalUsers,
      totalRegistrations,
      totalExhibitors,
      activeUsers,
      newUsersThisMonth,
      totalReviews,
      totalCertificates
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments(),
      Registration.countDocuments(),
      User.countDocuments({ role: 'organizer' }),
      User.countDocuments({ 'activityStats.lastActive': { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } }),
      Review.countDocuments(),
      User.countDocuments({ 'activityStats.certificatesEarned': { $gt: 0 } })
    ]);

    // Get popular events with enhanced metrics
    const popularEventsAgg = await Registration.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$event', registrationCount: { $sum: 1 } } },
      { $sort: { registrationCount: -1 } },
      { $limit: 10 }
    ]);

    const popularEventIds = popularEventsAgg.map(p => p._id);

    // Get events with comprehensive data
    const popularEvents = await Event.find({ _id: { $in: popularEventIds } })
      .populate('organizerId', 'name department')
      .lean();

    // Enhanced event analytics
    const popularEventsWithAnalytics = await Promise.all(popularEvents.map(async event => {
      const agg = popularEventsAgg.find(p => p._id.toString() === event._id.toString());

      // Get detailed metrics for each event
      const [
        reviewCount,
        averageRating,
        uniqueAttendees,
        repeatAttendees,
        registrationTrend
      ] = await Promise.all([
        Review.countDocuments({ event: event._id }),
        Review.aggregate([
          { $match: { event: event._id } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]).then(result => result[0]?.avg || 0),
        Registration.distinct('user', { event: event._id, status: 'attended' }).then(users => users.length),
        Registration.aggregate([
          { $match: { event: event._id, status: 'attended' } },
          { $lookup: { from: 'registrations', localField: 'user', foreignField: 'user', as: 'userEvents' } },
          { $match: { 'userEvents.1': { $exists: true } } }, // Has attended other events
          { $count: 'repeatCount' }
        ]).then(result => result[0]?.repeatCount || 0),
        Registration.aggregate([
          { $match: { event: event._id, createdAt: { $gte: startDate } } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }},
          { $sort: { '_id': 1 } },
          { $limit: 7 }
        ])
      ]);

      return {
        ...event,
        registrationCount: agg ? agg.registrationCount : 0,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
        uniqueAttendees,
        repeatAttendees,
        registrationTrend,
        engagementRate: uniqueAttendees > 0 ? Math.round((reviewCount / uniqueAttendees) * 100) : 0,
        retentionRate: uniqueAttendees > 0 ? Math.round((repeatAttendees / uniqueAttendees) * 100) : 0
      };
    }));

    // Enhanced user engagement analytics
    const userEngagement = await User.aggregate([
      {
        $match: {
          role: { $in: ['student', 'organizer'] },
          isBlocked: false
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          points: 1,
          activityScore: {
            $add: [
              '$activityStats.eventsAttended',
              { $multiply: ['$activityStats.eventsCreated', 2] },
              { $multiply: ['$activityStats.reviewsWritten', 1.5] },
              { $multiply: ['$activityStats.certificatesEarned', 3] }
            ]
          },
          lastActive: '$activityStats.lastActive',
          achievementsCount: { $size: '$achievements' },
          engagementLevel: {
            $switch: {
              branches: [
                { case: { $gte: ['$points', 500] }, then: 'Expert' },
                { case: { $gte: ['$points', 200] }, then: 'Advanced' },
                { case: { $gte: ['$points', 50] }, then: 'Intermediate' }
              ],
              default: 'Beginner'
            }
          }
        }
      },
      { $sort: { activityScore: -1, points: -1 } },
      { $limit: 15 }
    ]);

    // Real-time activity metrics
    const [
      todayRegistrations,
      weekRegistrations,
      monthRegistrations,
      todayEvents,
      activeUsersToday
    ] = await Promise.all([
      Registration.countDocuments({
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      }),
      Registration.countDocuments({
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Registration.countDocuments({
        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Event.countDocuments({
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      }),
      User.countDocuments({
        'activityStats.lastActive': {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      })
    ]);

    // Notification analytics
    const notificationStats = await Notification.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          readCount: { $sum: { $cond: ['$read', 1, 0] } }
        }
      },
      {
        $project: {
          type: '$_id',
          total: '$count',
          read: '$readCount',
          unread: { $subtract: ['$count', '$readCount'] },
          readRate: { $multiply: [{ $divide: ['$readCount', '$count'] }, 100] }
        }
      }
    ]);

    // Revenue analytics (placeholder for future monetization)
    const revenueMetrics = {
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageTicketPrice: 0,
      revenueByCategory: []
    };

    // Geographic analytics (placeholder)
    const geographicData = {
      topRegions: [],
      internationalUsers: 0,
      localUsers: totalUsers
    };

    res.json({
      // Core metrics
      totalEvents,
      totalUsers,
      totalRegistrations,
      totalExhibitors,
      totalReviews,
      totalCertificates,

      // Activity metrics
      activeUsers,
      newUsersThisMonth,
      todayRegistrations,
      weekRegistrations,
      monthRegistrations,
      todayEvents,
      activeUsersToday,

      // Detailed analytics
      popularEvents: popularEventsWithAnalytics,
      userEngagement,
      notificationStats,
      revenueMetrics,
      geographicData,

      // Trends and insights
      trends: {
        userGrowth: calculateGrowthRate(totalUsers, newUsersThisMonth),
        registrationGrowth: calculateGrowthRate(totalRegistrations, monthRegistrations),
        eventCreationRate: todayEvents,
        averageEventsPerUser: totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to calculate growth rates
function calculateGrowthRate(total, period) {
  if (total === 0) return 0;
  // Assuming period is for the current month/week
  const periodDays = 30; // Assuming monthly data
  const dailyAverage = total / periodDays;
  const periodGrowth = (period / periodDays) * 100;
  return Math.round(periodGrowth * 10) / 10;
}

// Real-time dashboard metrics for quick overview
export const realTimeMetrics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [
      registrationsLastHour,
      registrationsLast5Minutes,
      eventsCreatedToday,
      activeUsersNow,
      activeUsersLast5Minutes,
      pendingApprovals,
      pendingEvents,
      pendingUsers
    ] = await Promise.all([
      Registration.countDocuments({ createdAt: { $gte: hourAgo } }),
      Registration.countDocuments({ createdAt: { $gte: fiveMinutesAgo } }),
      Event.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({
        'activityStats.lastActive': { $gte: hourAgo }
      }),
      User.countDocuments({
        'activityStats.lastActive': { $gte: fiveMinutesAgo }
      }),
      Event.countDocuments({ status: 'pending' }) +
      User.countDocuments({ role: { $in: ['organizer', 'admin'] }, isApproved: false }),
      Event.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: { $in: ['organizer', 'admin'] }, isApproved: false })
    ]);

    res.json({
      registrationsLastHour,
      registrationsLast5Minutes,
      eventsCreatedToday,
      activeUsersNow,
      activeUsersLast5Minutes,
      pendingApprovals,
      pendingEvents,
      pendingUsers,
      serverTime: now.toISOString(),
      lastUpdated: now.getTime()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Predictive analytics for future trends
export const predictiveAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const historicalData = [];

    // Get historical data for the past N days
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dayData = await Promise.all([
        Registration.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } }),
        Event.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } }),
        User.countDocuments({ createdAt: { $gte: startOfDay, $lt: endOfDay } })
      ]);

      historicalData.push({
        date: startOfDay.toISOString().split('T')[0],
        registrations: dayData[0],
        events: dayData[1],
        users: dayData[2]
      });
    }

    // Simple trend analysis (linear regression)
    const trends = calculateTrends(historicalData);

    res.json({
      historicalData,
      trends,
      predictions: {
        nextWeekRegistrations: Math.round(trends.registrations.slope * 7 + trends.registrations.intercept),
        nextWeekEvents: Math.round(trends.events.slope * 7 + trends.events.intercept),
        growthRate: {
          registrations: Math.round(trends.registrations.slope * 100) / 100,
          events: Math.round(trends.events.slope * 100) / 100,
          users: Math.round(trends.users.slope * 100) / 100
        }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function for trend calculation
function calculateTrends(data) {
  const n = data.length;
  const trends = { registrations: {}, events: {}, users: {} };

  ['registrations', 'events', 'users'].forEach(metric => {
    const points = data.map((d, i) => ({ x: i, y: d[metric] }));

    // Calculate linear regression
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    trends[metric] = { slope, intercept, r2: calculateR2(points, slope, intercept) };
  });

  return trends;
}

function calculateR2(points, slope, intercept) {
  const yMean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const ssRes = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);

  return 1 - (ssRes / ssTot);
}

// Social features and sharing
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findById(userId)
      .select('-password -refreshToken -verification -devices')
      .populate('following', 'name avatarUrl')
      .populate('followers', 'name avatarUrl')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user's public activity
    const [
      userEvents,
      userReviews,
      userAchievements,
      isFollowing
    ] = await Promise.all([
      Event.find({ organizerId: userId, status: 'approved' })
        .select('title category date posterUrl')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Review.find({ user: userId })
        .populate('event', 'title category')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      user.achievements?.slice(-10) || [], // Last 10 achievements
      currentUserId ? user.followers.some(f => f._id.toString() === currentUserId) : false
    ]);

    // Privacy check
    const isOwnProfile = currentUserId === userId;
    const canViewPrivate = isOwnProfile || user.privacy?.profileVisibility === 'public' ||
                          (user.privacy?.profileVisibility === 'friends' && isFollowing);

    if (!canViewPrivate && !isOwnProfile) {
      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          department: user.department,
          activityStats: user.activityStats,
          achievements: user.achievements,
          points: user.points
        },
        isPrivate: true
      });
    }

    res.json({
      user: {
        ...user,
        stats: {
          eventsCreated: userEvents.length,
          totalEvents: user.activityStats?.eventsCreated || 0,
          reviewsWritten: userReviews.length,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0
        }
      },
      activity: {
        recentEvents: userEvents,
        recentReviews: userReviews,
        recentAchievements: userAchievements
      },
      social: {
        isFollowing,
        canFollow: !isOwnProfile && !isFollowing,
        canMessage: user.privacy?.allowMessages !== false
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following/followers
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, { $push: { following: userId } }),
      User.findByIdAndUpdate(userId, { $push: { followers: currentUserId } })
    ]);

    // Create notification
    await createNotification(
      userId,
      'New Follower',
      `${currentUser.name} started following you`,
      'social',
      currentUserId,
      'follow'
    );

    // Update activity
    await currentUser.updateActivity('social_engagement');

    res.json({ message: 'Successfully followed user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await Promise.all([
      User.findByIdAndUpdate(currentUserId, { $pull: { following: userId } }),
      User.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } })
    ]);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const shareEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { platform, message } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Generate shareable link
    const shareUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/events/${eventId}`;

    // Create share tracking
    const shareData = {
      event: eventId,
      user: req.user.id,
      platform,
      sharedAt: new Date(),
      shareUrl
    };

    // In a real app, you'd save this to a shares collection
    // For now, we'll just return the share data

    // Update user's activity
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'activityStats.socialShares': 1 },
      $set: { 'activityStats.lastActive': new Date() }
    });

    res.json({
      shareUrl,
      message: message || `Check out this event: ${event.title}`,
      platforms: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message || `Check out: ${event.title}`)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message || `Check out: ${event.title}`} ${shareUrl}`)}`
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSocialFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const user = await User.findById(userId).select('following');
    const followingIds = user.following || [];

    // Get activities from followed users
    const [
      followedEvents,
      followedReviews,
      followedAchievements
    ] = await Promise.all([
      // New events from followed organizers
      Event.find({
        organizerId: { $in: followingIds },
        status: 'approved',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
      .populate('organizerId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),

      // Reviews from followed users
      Review.find({ user: { $in: followingIds } })
      .populate('user', 'name avatarUrl')
      .populate('event', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),

      // Recent achievements from followed users
      User.find({ _id: { $in: followingIds } })
      .select('name avatarUrl achievements')
      .lean()
      .then(users => {
        const recentAchievements = [];
        users.forEach(user => {
          if (user.achievements) {
            user.achievements.slice(-5).forEach(achievement => { // Last 5 achievements
              recentAchievements.push({
                user: { name: user.name, avatarUrl: user.avatarUrl },
                achievement,
                type: 'achievement'
              });
            });
          }
        });
        return recentAchievements.sort((a, b) => new Date(b.achievement.earnedAt) - new Date(a.achievement.earnedAt)).slice(0, limit);
      })
    ]);

    // Combine and sort all activities
    const feedItems = [
      ...followedEvents.map(event => ({
        type: 'event_created',
        data: event,
        timestamp: event.createdAt,
        user: event.organizerId
      })),
      ...followedReviews.map(review => ({
        type: 'review_written',
        data: review,
        timestamp: review.createdAt,
        user: review.user
      })),
      ...followedAchievements.map(item => ({
        type: 'achievement_earned',
        data: item.achievement,
        timestamp: item.achievement.earnedAt,
        user: item.user
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(offset, offset + limit);

    res.json({
      feed: feedItems,
      pagination: {
        offset: offset + limit,
        hasMore: feedItems.length === limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};