import Exhibitor from '../models/Exhibitor.js';
import User from '../models/User.js';

export const getApprovedExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find({ status: 'approved' });
    res.json({ exhibitors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllExhibitors = async (req, res) => {
  try {
    const exhibitors = await Exhibitor.find();
    res.json({ exhibitors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExhibitorById = async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id);
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    res.json({ exhibitor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public exhibitor registration function
export const createPublicExhibitor = async (req, res) => {
  try {
    // Create exhibitor with default pending status
    // For public registrations, we don't associate with a specific organizer
    const exhibitorData = {
      ...req.body,
      status: 'pending',
      approved: false
    };
    
    const exhibitor = new Exhibitor(exhibitorData);
    const savedExhibitor = await exhibitor.save();
    res.status(201).json({ 
      message: 'Exhibitor registration submitted successfully. Awaiting approval.',
      exhibitor: savedExhibitor 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createExhibitor = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before creating exhibitors.' 
        });
      }
    }
    
    // For authenticated users, associate the exhibitor with the user
    const exhibitorData = {
      ...req.body,
      organizer: req.user.id
    };
    
    const exhibitor = new Exhibitor(exhibitorData);
    const savedExhibitor = await exhibitor.save();
    res.status(201).json({ exhibitor: savedExhibitor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateExhibitor = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before updating exhibitors.' 
        });
      }
    }
    
    const exhibitor = await Exhibitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    res.json({ exhibitor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExhibitor = async (req, res) => {
  try {
    // Check if organizer is approved
    if (req.user.role === 'organizer') {
      const organizer = await User.findById(req.user.id);
      if (!organizer || !organizer.isApproved) {
        return res.status(403).json({ 
          message: 'Your organizer account is pending approval. Please wait for admin approval before deleting exhibitors.' 
        });
      }
    }
    
    const exhibitor = await Exhibitor.findByIdAndDelete(req.params.id);
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    res.json({ message: 'Exhibitor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// New function to update exhibitor status
export const updateExhibitorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const exhibitor = await Exhibitor.findByIdAndUpdate(
      id,
      { 
        status: status,
        approved: status === 'approved'
      },
      { new: true, runValidators: true }
    );
    
    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }
    
    res.json({ 
      message: `Exhibitor ${status} successfully`,
      exhibitor 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};