import Booth from '../models/Booth.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

// Get all booths for an event
export const getBooths = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get all booths for this event
    const booths = await Booth.find({ eventId })
      .populate('reservedBy', 'name email')
      .populate('exhibitorId', 'companyName')
      .sort({ row: 1, number: 1 });
    
    // Add reservation status information
    const boothsWithStatus = booths.map(booth => ({
      ...booth.toObject(),
      isReserved: !!booth.reservedBy,
      reservedByMe: req.user && booth.reservedBy && booth.reservedBy._id.toString() === req.user.id
    }));
    
    res.json({ booths: boothsWithStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new booth
export const createBooth = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { number, row, size, description } = req.body;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Create new booth
    const booth = new Booth({
      eventId,
      number,
      row,
      size: size || 'medium',
      description
    });
    
    await booth.save();
    
    res.status(201).json({ message: 'Booth created successfully', booth });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A booth with this number already exists for this event' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Update a booth
export const updateBooth = async (req, res) => {
  try {
    const { boothId } = req.params;
    const { number, row, size, description } = req.body;
    
    // Find the booth
    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    
    // Update booth fields
    booth.number = number || booth.number;
    booth.row = row || booth.row;
    booth.size = size || booth.size;
    booth.description = description || booth.description;
    
    await booth.save();
    
    res.json({ message: 'Booth updated successfully', booth });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A booth with this number already exists for this event' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Delete a booth
export const deleteBooth = async (req, res) => {
  try {
    const { boothId } = req.params;
    
    // Find the booth
    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    
    // Check if booth is reserved
    if (booth.reservedBy) {
      return res.status(400).json({ message: 'Cannot delete a reserved booth' });
    }
    
    // Delete the booth
    await Booth.findByIdAndDelete(boothId);
    
    res.json({ message: 'Booth deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Select a booth (reserve it)
export const selectBooth = async (req, res) => {
  try {
    const { boothId } = req.params;
    const userId = req.user.id;
    
    // Find the booth
    const booth = await Booth.findById(boothId).populate('eventId');
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    
    // Check if booth is already reserved
    if (booth.reservedBy) {
      return res.status(400).json({ message: 'This booth is already reserved' });
    }
    
    // Verify user is an exhibitor
    const user = await User.findById(userId);
    if (user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only exhibitors can reserve booths' });
    }
    
    // Reserve the booth
    booth.reservedBy = userId;
    booth.reservedAt = new Date();
    await booth.save();
    
    res.json({ message: 'Booth reserved successfully', booth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Release a booth (unreserve it)
export const releaseBooth = async (req, res) => {
  try {
    const { boothId } = req.params;
    const userId = req.user.id;
    
    // Find the booth
    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }
    
    // Check if booth is reserved by this user
    if (!booth.reservedBy || booth.reservedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You cannot release this booth' });
    }
    
    // Release the booth
    booth.reservedBy = null;
    booth.reservedAt = null;
    await booth.save();
    
    res.json({ message: 'Booth released successfully', booth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get booth traffic statistics
export const getBoothTraffic = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get booth visit statistics (this would typically come from analytics)
    // For now, we'll return booth reservation data
    const booths = await Booth.find({ eventId, reservedBy: { $ne: null } })
      .populate('reservedBy', 'name')
      .populate('exhibitorId', 'companyName')
      .sort({ reservedAt: -1 });
    
    const boothTraffic = booths.map(booth => ({
      _id: booth._id,
      number: booth.number,
      companyName: booth.exhibitorId?.companyName || booth.reservedBy?.name || 'Unknown',
      visitCount: Math.floor(Math.random() * 100) + 1, // Placeholder data
      reservedAt: booth.reservedAt
    }));
    
    res.json({ boothTraffic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};