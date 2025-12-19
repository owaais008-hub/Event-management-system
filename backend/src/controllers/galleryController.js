import Gallery from '../models/Gallery.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs/promises';

// Upload media to gallery
export const uploadMedia = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before uploading media.' 
        });
      }
    }
    
    const { eventId, title, description, category, tags } = req.body;
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required' });
    }
    
    // Verify that the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is organizer of the event or admin
    if (req.user.role !== 'admin' && 
        !(req.user.role === 'organizer' && event.organizer.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Only event organizers can upload media' });
    }
    
    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }
    
    // Create gallery entry - automatically approved for organizers and admins
    const galleryItem = await Gallery.create({
      event: eventId,
      uploader: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      title,
      description,
      category: category || 'event',
      tags: parsedTags,
      // Auto-approve for organizers and admins - no approval needed
      approved: true,
      approvedBy: req.user.id,
      approvedAt: new Date()
    });
    
    res.status(201).json({ 
      galleryItem, 
      message: 'Media uploaded successfully and is now visible to all users' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get gallery items with filtering and pagination
export const getGalleryItems = async (req, res) => {
  try {
    const { 
      event, 
      category, 
      featured,
      tag,
      approved = true,
      page = 1,
      limit = 12
    } = req.query;
    
    const filter = {};
    
    // Apply filters
    if (event) filter.event = event;
    if (category) filter.category = category;
    if (featured !== undefined) filter.isFeatured = featured === 'true';
    if (tag) filter.tags = { $in: [tag] };
    
    // Handle approval filter
    if (approved !== undefined) {
      const approvedBool = approved === 'true';
      if (approvedBool) {
        // Show only approved items
        filter.approved = true;
      } else if (req.user) {
        // For unapproved items, show only if user is admin or uploader
        if (req.user.role === 'admin') {
          filter.approved = false;
        } else if (req.user.role === 'organizer') {
          filter.$and = [
            { approved: false },
            { uploader: req.user.id }
          ];
        } else {
          filter.approved = true; // Regular users only see approved items
        }
      } else {
        filter.approved = true; // Non-authenticated users only see approved items
      }
    } else {
      // Default behavior: show approved items
      filter.approved = true;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const galleryItems = await Gallery.find(filter)
      .populate('event', 'title date location')
      .populate('uploader', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Gallery.countDocuments(filter);
    
    res.json({ 
      galleryItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single gallery item
export const getGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
      .populate('event', 'title date venue')
      .populate('uploader', 'name');
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Only return unapproved items to admins or the uploader
    if (!galleryItem.approved) {
      if (req.user && (req.user.role === 'admin' || req.user.id === galleryItem.uploader._id.toString())) {
        // Allow access
      } else {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
    }
    
    res.json({ galleryItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update gallery item (organizer or admin only)
export const updateGalleryItem = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before updating gallery items.' 
        });
      }
    }
    
    const { title, description, category, tags, isFeatured } = req.body;
    
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Check permissions
    const event = await Event.findById(galleryItem.event);
    if (req.user.role !== 'admin' && 
        !(req.user.role === 'organizer' && event.organizerId.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    // Update fields
    if (title !== undefined) galleryItem.title = title;
    if (description !== undefined) galleryItem.description = description;
    if (category !== undefined) galleryItem.category = category;
    if (tags !== undefined) {
      try {
        galleryItem.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        galleryItem.tags = tags.split(',').map(tag => tag.trim());
      }
    }
    if (isFeatured !== undefined) galleryItem.isFeatured = isFeatured;
    
    await galleryItem.save();
    
    res.json({ galleryItem, message: 'Gallery item updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete gallery item (organizer or admin only)
export const deleteGalleryItem = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before deleting gallery items.' 
        });
      }
    }
    
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Check permissions
    const event = await Event.findById(galleryItem.event);
    if (req.user.role !== 'admin' && 
        !(req.user.role === 'organizer' && event.organizerId.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(galleryItem.imageUrl));
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting gallery file:', err);
    }
    
    // Delete gallery record
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approval for gallery items
export const approveGalleryItem = async (req, res) => {
  try {
    // Only admins can approve
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve gallery items' });
    }
    
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    galleryItem.approved = true;
    galleryItem.approvedBy = req.user.id;
    galleryItem.approvedAt = new Date();
    
    await galleryItem.save();
    
    res.json({ galleryItem, message: 'Gallery item approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin rejection for gallery items
export const rejectGalleryItem = async (req, res) => {
  try {
    // Only admins can reject
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject gallery items' });
    }
    
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    
    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(galleryItem.imageUrl));
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting gallery file:', err);
    }
    
    // Delete gallery record
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Gallery item rejected and deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get featured gallery items
export const getFeaturedItems = async (req, res) => {
  try {
    const galleryItems = await Gallery.find({ 
      isFeatured: true, 
      approved: true 
    })
      .populate('event', 'title date')
      .limit(10)
      .sort({ createdAt: -1 });
    
    res.json({ galleryItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};