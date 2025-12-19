import { Server } from 'socket.io';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

// Store user socket connections
const userSockets = new Map();

let ioInstance = null;

export function initSocket(server, clientOrigin) {
  const io = new Server(server, {
    cors: { origin: clientOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);
    
    // When a user authenticates, they should join their user room
    socket.on('join-user-room', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} joined their room`);
      }
    });
    
    // When a user disconnects, remove them from tracking
    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
    
    socket.on('announce', (message) => {
      io.emit('announcement', { message, at: Date.now() });
    });
    
    // Join admin room for real-time stats
    socket.on('join-admin-stats', () => {
      socket.join('admin-stats');
      console.log('Admin joined stats room:', socket.id);
    });
    
    // Leave admin room
    socket.on('leave-admin-stats', () => {
      socket.leave('admin-stats');
      console.log('Admin left stats room:', socket.id);
    });
  });

  ioInstance = io;
  
  // Set up periodic real-time stats broadcasting
  setInterval(async () => {
    try {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
        User.countDocuments({ 'activityStats.lastActive': { $gte: hourAgo } }),
        User.countDocuments({ 'activityStats.lastActive': { $gte: fiveMinutesAgo } }),
        Event.countDocuments({ status: 'pending' }) + User.countDocuments({ role: { $in: ['organizer', 'admin'] }, isApproved: false }),
        Event.countDocuments({ status: 'pending' }),
        User.countDocuments({ role: { $in: ['organizer', 'admin'] }, isApproved: false })
      ]);

      const realtimeStats = {
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
      };

      // Emit to admin stats room
      if (ioInstance) {
        ioInstance.to('admin-stats').emit('realtime-stats-update', realtimeStats);
      }
    } catch (error) {
      console.error('Error broadcasting real-time stats:', error);
    }
  }, 5000); // Every 5 seconds

  return io;
}

// Function to send notification to a specific user
export function sendNotification(notification) {
  if (ioInstance && notification.user) {
    // Emit to the specific user's room
    ioInstance.to(`user-${notification.user}`).emit('notification', notification);
  } else if (ioInstance) {
    // Fallback: broadcast to all clients (for backward compatibility)
    ioInstance.emit('notification', notification);
  }
}

// Broadcast an announcement to all clients
export function sendAnnouncement(payload) {
  if (ioInstance) {
    const data = typeof payload === 'string' ? { message: payload, at: Date.now() } : payload;
    ioInstance.emit('announcement', data);
  }
}

// Send real-time stats update to admin room
export function sendRealtimeStatsUpdate(stats) {
  if (ioInstance) {
    ioInstance.to('admin-stats').emit('realtime-stats-update', stats);
  }
}