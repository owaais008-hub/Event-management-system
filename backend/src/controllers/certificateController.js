import Certificate from '../models/Certificate.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import { generateQRCodeDataUrl } from '../utils/qrcode.js';
import path from 'path';
import fs from 'fs/promises';

// Generate a unique certificate ID
function generateCertificateId() {
  return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Upload certificate for an event participant
export const uploadCertificate = async (req, res) => {
  try {
    // Check if user is an organizer
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can upload certificates' });
    }
    
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before uploading certificates.' 
        });
      }
    }
    
    const { eventId, userId } = req.body;
    
    // Verify that the event belongs to the authenticated organizer
    const event = await Event.findOne({ 
      _id: eventId, 
      organizer: req.user.id 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or not owned by you' });
    }
    
    // Verify that the user participated in the event
    const registration = await Registration.findOne({ 
      event: eventId, 
      user: userId,
      status: 'approved'
    });
    
    if (!registration) {
      return res.status(400).json({ message: 'User did not participate in this event or registration not approved' });
    }
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ event: eventId, user: userId });
    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already exists for this participant' });
    }
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: 'Certificate file is required' });
    }
    
    // Generate certificate ID and QR code
    const certificateId = generateCertificateId();
    const payload = JSON.stringify({ 
      certificateId,
      eventId: eventId.toString(), 
      userId: userId.toString(), 
      issuedAt: Date.now() 
    });
    const qrCodeDataUrl = await generateQRCodeDataUrl(payload);
    
    // Create certificate record
    const certificate = await Certificate.create({
      event: eventId,
      user: userId,
      certificateUrl: `/uploads/${req.file.filename}`,
      certificateId,
      issuedBy: req.user.id,
      qrCodeDataUrl
    });
    
    res.status(201).json({ certificate, message: 'Certificate uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get certificates for a user
export const getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('event', 'title date venue')
      .sort({ issuedAt: -1 });
    
    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get certificates for an event (organizer only)
export const getEventCertificates = async (req, res) => {
  try {
    // Verify that the event belongs to the authenticated organizer
    const event = await Event.findOne({ 
      _id: req.params.id, 
      organizerId: req.user.id 
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found or not owned by you' });
    }
    
    const certificates = await Certificate.find({ event: req.params.id })
      .populate('user', 'name email')
      .sort({ issuedAt: -1 });
    
    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download certificate
export const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Check if user is authorized to download (owner or organizer of the event)
    const event = await Event.findById(certificate.event);
    
    if (req.user.id !== certificate.user.toString() && 
        req.user.id !== event.organizerId.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this certificate' });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', path.basename(certificate.certificateUrl));
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }
    
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete certificate (organizer or admin only)
export const deleteCertificate = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before deleting certificates.' 
        });
      }
    }
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Verify that the event belongs to the authenticated organizer or user is admin
    const event = await Event.findById(certificate.event);
    
    if (req.user.id !== event.organizerId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this certificate' });
    }
    
    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(certificate.certificateUrl));
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting certificate file:', err);
    }
    
    // Delete certificate record
    await Certificate.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify certificate using QR code data
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.body;
    
    const certificate = await Certificate.findOne({ certificateId })
      .populate('event', 'title date')
      .populate('user', 'name');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json({ 
      valid: true,
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        event: certificate.event,
        user: certificate.user
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};