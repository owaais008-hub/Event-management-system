import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['visitor', 'student', 'organizer', 'admin'],
      default: 'visitor'
    },
    isBlocked: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    interests: [{ type: String }],
    avatarUrl: { type: String },
    // Student specific fields
    enrollmentNumber: { type: String },
    department: { type: String },
    collegeIdUrl: { type: String }, // URL to uploaded college ID
    // Organizer specific fields
    isApproved: { type: Boolean, default: false }, // For organizers to be approved by admin
    refreshToken: { type: String, select: false },

    // Enhanced user engagement tracking
    profile: {
      bio: { type: String, maxlength: 500 },
      location: { type: String },
      website: { type: String },
      socialLinks: {
        linkedin: { type: String },
        github: { type: String },
        twitter: { type: String }
      }
    },

    // Activity tracking
    activityStats: {
      eventsCreated: { type: Number, default: 0 },
      eventsAttended: { type: Number, default: 0 },
      reviewsWritten: { type: Number, default: 0 },
      certificatesEarned: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 }, // For future monetization
      lastActive: { type: Date, default: Date.now }
    },

    // Preferences and personalization
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
      language: { type: String, default: 'en' }
    },

    // Gamification and achievements
    achievements: [{
      type: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      earnedAt: { type: Date, default: Date.now },
      icon: { type: String }
    }],

    // Social features
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],

    // Privacy and security
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
      showActivity: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    },

    // Device and session tracking
    devices: [{
      deviceId: { type: String },
      deviceName: { type: String },
      lastLogin: { type: Date },
      ipAddress: { type: String },
      userAgent: { type: String }
    }],

    // Verification status
    verification: {
      emailVerified: { type: Boolean, default: false },
      emailVerificationToken: { type: String },
      emailVerificationExpires: { type: Date },
      phoneVerified: { type: Boolean, default: false },
      idVerified: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Instance methods for user engagement
userSchema.methods.updateActivity = function (action) {
  this.activityStats.lastActive = new Date();

  switch (action) {
    case 'event_created':
      this.activityStats.eventsCreated += 1;
      this.points += 10; // Reward points for creating events
      break;
    case 'event_attended':
      this.activityStats.eventsAttended += 1;
      this.points += 5; // Reward points for attending events
      break;
    case 'review_written':
      this.activityStats.reviewsWritten += 1;
      this.points += 3; // Reward points for writing reviews
      break;
    case 'certificate_earned':
      this.activityStats.certificatesEarned += 1;
      this.points += 15; // Reward points for earning certificates
      break;
  }

  // Check for achievements
  this.checkAchievements();
  return this.save();
};

userSchema.methods.checkAchievements = function () {
  const achievements = [];

  // Event creation achievements
  if (this.activityStats.eventsCreated >= 1 && !this.hasAchievement('first_event')) {
    achievements.push({
      type: 'first_event',
      title: 'Event Creator',
      description: 'Created your first event',
      icon: '🎪'
    });
  }

  if (this.activityStats.eventsCreated >= 10 && !this.hasAchievement('event_master')) {
    achievements.push({
      type: 'event_master',
      title: 'Event Master',
      description: 'Created 10 events',
      icon: '🏆'
    });
  }

  // Attendance achievements
  if (this.activityStats.eventsAttended >= 1 && !this.hasAchievement('first_attendance')) {
    achievements.push({
      type: 'first_attendance',
      title: 'First Timer',
      description: 'Attended your first event',
      icon: '🎟️'
    });
  }

  if (this.activityStats.eventsAttended >= 25 && !this.hasAchievement('regular_attendee')) {
    achievements.push({
      type: 'regular_attendee',
      title: 'Regular Attendee',
      description: 'Attended 25 events',
      icon: '⭐'
    });
  }

  // Review achievements
  if (this.activityStats.reviewsWritten >= 5 && !this.hasAchievement('reviewer')) {
    achievements.push({
      type: 'reviewer',
      title: 'Event Reviewer',
      description: 'Written 5 event reviews',
      icon: '📝'
    });
  }

  // Certificate achievements
  if (this.activityStats.certificatesEarned >= 1 && !this.hasAchievement('first_certificate')) {
    achievements.push({
      type: 'first_certificate',
      title: 'Certified',
      description: 'Earned your first certificate',
      icon: '📜'
    });
  }

  // Points-based achievements
  if (this.points >= 100 && !this.hasAchievement('centurion')) {
    achievements.push({
      type: 'centurion',
      title: 'Centurion',
      description: 'Earned 100 points',
      icon: '💯'
    });
  }

  // Add new achievements
  achievements.forEach(achievement => {
    if (!this.hasAchievement(achievement.type)) {
      this.achievements.push(achievement);
    }
  });
};

userSchema.methods.hasAchievement = function (type) {
  return this.achievements.some(achievement => achievement.type === type);
};

userSchema.methods.addBookmark = function (eventId) {
  if (!this.bookmarks.includes(eventId)) {
    this.bookmarks.push(eventId);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.removeBookmark = function (eventId) {
  this.bookmarks = this.bookmarks.filter(id => !id.equals(eventId));
  return this.save();
};

userSchema.methods.follow = function (userId) {
  if (!this.following.includes(userId) && !this._id.equals(userId)) {
    this.following.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.unfollow = function (userId) {
  this.following = this.following.filter(id => !id.equals(userId));
  return this.save();
};

// Static methods for analytics
userSchema.statics.getTopUsers = function (limit = 10) {
  return this.find({ 'activityStats.eventsAttended': { $gt: 0 } })
    .sort({ 'activityStats.eventsAttended': -1, points: -1 })
    .limit(limit)
    .select('name avatarUrl activityStats points achievements');
};

userSchema.statics.getEngagementStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $gte: ['$activityStats.lastActive', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] }
        },
        totalEventsCreated: { $sum: '$activityStats.eventsCreated' },
        totalEventsAttended: { $sum: '$activityStats.eventsAttended' },
        totalReviews: { $sum: '$activityStats.reviewsWritten' },
        totalCertificates: { $sum: '$activityStats.certificatesEarned' },
        averagePoints: { $avg: '$points' }
      }
    }
  ]);
};

export const User = mongoose.model('User', userSchema);
export default User;