import Notification from '../models/Notification.js';
import { sendNotification } from '../services/socket.js';

export const getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0, read } = req.query;
    
    // Build filter
    const filter = { user: req.user.id };
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      read: false 
    });
    
    res.json({ notifications, unreadCount, offset: parseInt(offset), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsUnread = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: false },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      user: req.user.id,
      read: true
    });
    
    res.json({ message: `Deleted ${result.deletedCount} notifications` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Enhanced notification creation with smart delivery
export const createNotification = async (userId, title, message, type = 'info', relatedId = null, relatedType = null, priority = 'normal') => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedId,
      relatedType,
      priority,
      // Auto-expire low priority notifications after 30 days
      expiresAt: priority === 'low' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    });

    await notification.save();

    // Send real-time notification via socket with enhanced data
    const notificationData = {
      ...notification.toObject(),
      timestamp: notification.createdAt,
      priority
    };
    sendNotification(notificationData);

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};

// Bulk notification creation for multiple users
export const createBulkNotifications = async (userIds, title, message, type = 'info', relatedId = null, relatedType = null) => {
  try {
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      relatedId,
      relatedType,
      createdAt: new Date()
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Send real-time notifications to all users
    createdNotifications.forEach(notification => {
      sendNotification({
        ...notification.toObject(),
        timestamp: notification.createdAt
      });
    });

    return createdNotifications;
  } catch (err) {
    console.error('Failed to create bulk notifications:', err);
    return [];
  }
};

// Smart notification system for event-related actions
export const notifyEventParticipants = async (eventId, title, message, type = 'info', excludeUserId = null) => {
  try {
    // Get all approved participants for the event
    const registrations = await Registration.find({
      event: eventId,
      status: 'approved',
      ...(excludeUserId && { user: { $ne: excludeUserId } })
    }).populate('user', 'name email');

    if (registrations.length === 0) return [];

    const userIds = registrations.map(reg => reg.user._id);
    return await createBulkNotifications(userIds, title, message, type, eventId, 'event');
  } catch (err) {
    console.error('Failed to notify event participants:', err);
    return [];
  }
};

// Automated notification triggers
export const triggerAutomatedNotifications = async () => {
  try {
    const now = new Date();

    // Event reminders (24 hours before)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingEvents = await Event.find({
      date: { $gte: now, $lte: tomorrow },
      status: 'approved'
    });

    for (const event of upcomingEvents) {
      const registrations = await Registration.find({
        event: event._id,
        status: 'approved'
      }).populate('user', 'name email');

      for (const registration of registrations) {
        // Check if reminder already sent
        const existingReminder = await Notification.findOne({
          user: registration.user._id,
          relatedId: event._id,
          relatedType: 'event_reminder',
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        });

        if (!existingReminder) {
          await createNotification(
            registration.user._id,
            `Event Reminder: ${event.title}`,
            `Your event "${event.title}" is tomorrow at ${event.time}. Don't forget to attend!`,
            'reminder',
            event._id,
            'event_reminder',
            'high'
          );
        }
      }
    }

    // Clean up expired notifications
    await Notification.deleteMany({
      expiresAt: { $lt: now }
    });

    console.log('Automated notifications processed successfully');
  } catch (err) {
    console.error('Failed to trigger automated notifications:', err);
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = await Notification.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$read', 0, 1] } },
          thisWeek: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', lastWeek] }, 1, 0]
            }
          },
          byType: {
            $push: '$type'
          }
        }
      }
    ]);

    const typeBreakdown = await Notification.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: stats[0] || { total: 0, unread: 0, thisWeek: 0 },
      typeBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark notifications as read by type or related item
export const markByType = async (req, res) => {
  try {
    const { type, relatedId, relatedType } = req.body;

    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (relatedId) filter.relatedId = relatedId;
    if (relatedType) filter.relatedType = relatedType;

    const result = await Notification.updateMany(
      { ...filter, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};