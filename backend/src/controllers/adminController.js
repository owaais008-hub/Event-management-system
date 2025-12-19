import User from '../models/User.js';
import Event from '../models/Event.js';
import { createNotification } from './notificationController.js';
import { sendNotification, sendAnnouncement } from '../services/socket.js';

// Get all pending staff approvals
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingStaff = await User.find({ 
      role: { $in: ['organizer', 'admin'] },
      isApproved: false
    }).select('-password');
    
    res.json({ staff: pendingStaff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve a staff member
export const approveStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Notify the user about account approval
    await createNotification(
      staff._id,
      'Account Approved',
      'Your organizer account has been approved. You can now create and manage events.',
      'success',
      staff._id,
      'organizer_approval'
    );

    res.json({ message: 'Staff member approved successfully', staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject a staff member
export const rejectStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findByIdAndDelete(id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    res.json({ message: 'Staff member rejected and removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all pending events
export const listPendingEvents = async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: 'pending' })
      .populate('organizerId', 'name email');
    
    res.json({ events: pendingEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve an event
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).populate('organizerId', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Notify organizer about approval
    await createNotification(
      event.organizerId._id,
      `Event Approved: ${event.title}`,
      'Your event has been approved and is now visible on the home page.',
      'success',
      event._id,
      'event'
    );

    // Realtime broadcast (non-persistent) to connected clients
    sendNotification({
      _id: `rt-${Date.now()}`,
      title: 'New Event Approved',
      message: `${event.title} is now live!`,
      type: 'info',
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Event approved successfully', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject an event
export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    ).populate('organizerId', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Notify organizer about rejection
    await createNotification(
      event.organizerId._id,
      `Event Rejected: ${event.title}`,
      'Your event was rejected. Please check details and resubmit.',
      'warning',
      event._id,
      'event'
    );

    res.json({ message: 'Event rejected successfully', event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User blocked successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User unblocked successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Post an announcement (admin only)
export const postAnnouncement = async (req, res) => {
  try {
    console.log('Post announcement - User:', req.user);
    
    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const payload = { 
      message: message.trim(), 
      at: new Date().toISOString(), 
      author: { id: req.user?.id, role: req.user?.role } 
    };
    
    console.log('Post announcement - Sending payload:', payload);
    sendAnnouncement(payload);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Post announcement - Error:', err);
    return res.status(500).json({ message: err.message });
  }
};