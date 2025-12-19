import Message from '../models/Message.js';
import User from '../models/User.js';

// Get contacts (users that the current user has communicated with)
export const getContacts = async (req, res) => {
  try {
    // Find all users that the current user has sent or received messages from
    const sentMessages = await Message.find({ sender: req.user.id }).distinct('recipient');
    const receivedMessages = await Message.find({ recipient: req.user.id }).distinct('sender');
    
    // Combine and deduplicate contact IDs
    const contactIds = [...new Set([...sentMessages, ...receivedMessages])];
    
    // Get user details for these contacts (excluding the current user)
    const contacts = await User.find({ 
      _id: { $in: contactIds, $ne: req.user.id } 
    }).select('name email role');
    
    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all messages for the current user
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 });
    
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get messages between current user and a specific contact
export const getMessagesWithContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // Validate contact exists
    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Get messages between current user and contact
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: contactId },
        { sender: contactId, recipient: req.user.id }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 });
    
    // Mark messages as read if they were sent to the current user
    const unreadMessageIds = messages
      .filter(msg => msg.recipient._id.toString() === req.user.id && !msg.read)
      .map(msg => msg._id);
      
    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { read: true, readAt: new Date() }
      );
    }
    
    // Add isOwn property to each message
    const messagesWithOwnership = messages.map(msg => ({
      ...msg.toObject(),
      isOwn: msg.sender._id.toString() === req.user.id
    }));
    
    res.json({ messages: messagesWithOwnership });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Create message
    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content: content.trim()
    });
    
    // Populate sender and recipient details
    await message.populate('sender', 'name email');
    await message.populate('recipient', 'name email');
    
    // Add isOwn property
    const messageWithOwnership = {
      ...message.toObject(),
      isOwn: true
    };
    
    res.status(201).json({ message: messageWithOwnership });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    // Validate message IDs
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'Message IDs are required' });
    }
    
    // Update messages
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        recipient: req.user.id 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};