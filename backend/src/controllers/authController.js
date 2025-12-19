import User from '../models/User.js';
import { generateJwtToken, generateRefreshToken } from '../utils/generateToken.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, department, collegeIdUrl } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    
    // Validate role-specific fields
    if (role === 'student' && (!enrollmentNumber || !department)) {
      return res.status(400).json({ message: 'Enrollment number and department are required for students' });
    }
    
    // For organizers, set isApproved to false by default
    const isApproved = (role === 'organizer') ? false : undefined;
    
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role,
      enrollmentNumber,
      department,
      collegeIdUrl,
      isApproved
    });
    
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    
    res.status(201).json({ 
      token, 
      refreshToken, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        enrollmentNumber: user.enrollmentNumber,
        department: user.department,
        isApproved: user.isApproved,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });
    
    // For organizers, check if approved
    if (user.role === 'organizer' && !user.isApproved) {
      return res.status(403).json({ message: 'Organizer account pending approval' });
    }
    
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ 
      token, 
      refreshToken, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        enrollmentNumber: user.enrollmentNumber,
        department: user.department,
        isApproved: user.isApproved,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        points: user.points,
        enrollmentNumber: user.enrollmentNumber,
        department: user.department,
        isApproved: user.isApproved,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, interests, avatarUrl, profile, preferences, privacy } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (interests) updates.interests = interests;
    if (avatarUrl) updates.avatarUrl = avatarUrl;
    if (profile) updates.profile = profile;
    if (preferences) updates.preferences = preferences;
    if (privacy) updates.privacy = privacy;
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        points: user.points,
        enrollmentNumber: user.enrollmentNumber,
        department: user.department,
        isApproved: user.isApproved,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    const user = await User.findOne({ refreshToken }).select('+refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const newRefreshToken = generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    
    res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Remove refresh token from user if user is authenticated
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }
    
    // Clear the token cookie if it exists
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload avatar function
export const uploadAvatar = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Construct the avatar URL
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { avatarUrl }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Avatar uploaded successfully', 
      avatarUrl,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        points: user.points,
        enrollmentNumber: user.enrollmentNumber,
        department: user.department,
        isApproved: user.isApproved,
        avatarUrl: user.avatarUrl
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
