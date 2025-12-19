import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { generateQRCodeDataUrl } from '../utils/qrcode.js';
import { sendEmail } from '../utils/email.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { createNotification } from './notificationController.js';

export const registerForEvent = async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for events' });
    }
    
    const event = await Event.findById(req.params.id).populate('organizerId', 'name email');
    if (!event || event.status !== 'approved') return res.status(400).json({ message: 'Event not available' });
    
    // Check if user is already registered (any status)
    const existingRegistration = await Registration.findOne({ user: req.user.id, event: event._id });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }
    
    // Check event capacity if it's set (capacity > 0)
    if (event.capacity > 0) {
      const approvedRegistrationsCount = await Registration.countDocuments({ 
        event: event._id, 
        status: 'approved' 
      });
      
      if (approvedRegistrationsCount >= event.capacity) {
        return res.status(400).json({ message: 'Event capacity reached. No more registrations allowed.' });
      }
    }
    
    // Create pending registration
    const reg = await Registration.create({ user: req.user.id, event: event._id, status: 'pending' });
    
    // Send notification to user that registration is pending
    try {
      await sendEmail({ 
        to: req.user.email, 
        subject: `Registration Request: ${event.title}`, 
        html: `<p>Your registration for ${event.title} is pending admin approval.</p>` 
      });
      
      // Create in-app notification for user
      await createNotification(
        req.user.id,
        'Registration Requested',
        `Your registration for ${event.title} is pending admin approval.`,
        'info',
        reg._id,
        'registration'
      );
      
      // Create notification for event organizer
      if (event.organizerId) {
        await createNotification(
          event.organizerId._id,
          'New Registration Request',
          `A new user has requested to register for your event: ${event.title}. Please review the registration in your dashboard.`,
          'info',
          reg._id,
          'registration'
        );
      }
    } catch (_) {}
    
    res.status(201).json({ registration: reg, message: 'Registration request submitted. Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const myRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user.id }).populate('event');
    res.json({ registrations: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('event', 'title date location');
    res.json({ registrations: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate QR code when registration is approved
async function generateQrCodeForRegistration(registration) {
  const payload = JSON.stringify({ 
    userId: registration.user.toString(), 
    eventId: registration.event.toString(), 
    at: Date.now() 
  });
  const qrCodeDataUrl = await generateQRCodeDataUrl(payload);
  return qrCodeDataUrl;
}

export const approveRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('user')
      .populate('event');
      
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    if (registration.status !== 'pending') {
      return res.status(400).json({ message: `Registration is already ${registration.status}` });
    }
    
    // Check event capacity if it's set (capacity > 0)
    if (registration.event.capacity > 0) {
      const approvedRegistrationsCount = await Registration.countDocuments({ 
        event: registration.event._id, 
        status: 'approved' 
      });
      
      if (approvedRegistrationsCount >= registration.event.capacity) {
        return res.status(400).json({ message: 'Event capacity reached. Cannot approve more registrations.' });
      }
    }
    
    // Generate QR code for approved registration
    const qrCodeDataUrl = await generateQrCodeForRegistration(registration);
    
    // Update registration to approved status
    registration.status = 'approved';
    registration.approvedBy = req.user.id;
    registration.approvedAt = new Date();
    registration.qrCodeDataUrl = qrCodeDataUrl;
    
    await registration.save();
    
    // Send notification to user
    try {
      await sendEmail({ 
        to: registration.user.email, 
        subject: `Registration Approved: ${registration.event.title}`, 
        html: `<p>Your registration for ${registration.event.title} has been approved!</p><p>You can now download your ticket.</p>` 
      });
      
      // Create in-app notification
      await createNotification(
        registration.user._id,
        'Registration Approved',
        `You were registered! Enjoy the event: ${registration.event.title}`,
        'success',
        registration._id,
        'registration'
      );
      
      // Notify organizer about approved registration
      if (registration.event.organizerId) {
        await createNotification(
          registration.event.organizerId._id,
          'Registration Approved',
          `Registration for ${registration.event.title} has been approved for ${registration.user.name}.`,
          'success',
          registration._id,
          'registration'
        );
      }
    } catch (_) {}
    
    res.json({ registration, message: 'Registration approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const denyRegistration = async (req, res) => {
  try {
    const { reason } = req.body;
    const registration = await Registration.findById(req.params.id)
      .populate('user')
      .populate('event');
      
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    if (registration.status !== 'pending') {
      return res.status(400).json({ message: `Registration is already ${registration.status}` });
    }
    
    // Update registration to denied status
    registration.status = 'denied';
    registration.approvedBy = req.user.id;
    registration.approvedAt = new Date();
    registration.denialReason = reason;
    
    await registration.save();
    
    // Send notification to user
    try {
      await sendEmail({ 
        to: registration.user.email, 
        subject: `Registration Denied: ${registration.event.title}`, 
        html: `<p>Your registration for ${registration.event.title} has been denied.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}` 
      });
      
      // Create in-app notification
      await createNotification(
        registration.user._id,
        'Registration Denied',
        `Your registration for ${registration.event.title} was denied. ${reason ? `Reason: ${reason}` : ''}`,
        'error',
        registration._id,
        'registration'
      );
      
      // Notify organizer about denied registration
      if (registration.event.organizerId) {
        await createNotification(
          registration.event.organizerId._id,
          'Registration Denied',
          `Registration for ${registration.event.title} has been denied for ${registration.user.name}.${reason ? ` Reason: ${reason}` : ''}`,
          'warning',
          registration._id,
          'registration'
        );
      }
    } catch (_) {}
    
    res.json({ registration, message: 'Registration denied successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get participants for an event (organizer only)
export const getParticipants = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    // Verify that the event belongs to the organizer or user is admin
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer of this event or an admin
    if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not the organizer of this event.' });
    }
    
    // Get all registrations for this event with user details
    const participants = await Registration.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ participants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export participants as CSV (organizer only)
export const exportParticipantsCsv = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    
    // Verify that the event belongs to the organizer or user is admin
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer of this event or an admin
    if (req.user.role !== 'admin' && event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You are not the organizer of this event.' });
    }
    
    // Get all registrations for this event with user details
    const participants = await Registration.find({ event: eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    // Create CSV content
    let csvContent = 'Name,Email,Registration Status,Registration Date\n';
    participants.forEach(reg => {
      csvContent += `"${reg.user.name}","${reg.user.email}","${reg.status}","${reg.createdAt.toISOString()}"\n`;
    });
    
    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment(`participants-${eventId}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
