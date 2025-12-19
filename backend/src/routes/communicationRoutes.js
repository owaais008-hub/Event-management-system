import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getContacts, 
  getMessages, 
  getMessagesWithContact, 
  sendMessage, 
  markAsRead, 
  getUnreadCount 
} from '../controllers/communicationController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get contacts
router.get('/contacts', getContacts);

// Get all messages
router.get('/messages', getMessages);

// Get messages with a specific contact
router.get('/messages/:contactId', getMessagesWithContact);

// Send a new message
router.post('/messages', sendMessage);

// Mark messages as read
router.post('/messages/read', markAsRead);

// Get unread message count
router.get('/messages/unread/count', getUnreadCount);

export default router;