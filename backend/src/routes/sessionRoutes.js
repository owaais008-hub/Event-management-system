import express from 'express';
import { 
  getSessions, 
  createSession, 
  updateSession, 
  deleteSession, 
  bookmarkSession, 
  removeBookmark, 
  getBookmarkedSessions,
  listPendingSessions,
  approveSession,
  rejectSession
} from '../controllers/sessionController.js';
import { protect, restrictTo, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (optionally attaches user so admins get all)
router.get('/', optionalAuthenticate, getSessions);

// Protected routes (user must be logged in)
router.use(protect);

// Admin-only session approvals
router.get('/pending', restrictTo('admin'), listPendingSessions);
router.post('/:id/approve', restrictTo('admin'), approveSession);
router.post('/:id/reject', restrictTo('admin'), rejectSession);

// Bookmark routes
router.post('/:id/bookmark', bookmarkSession);
router.delete('/:id/bookmark', removeBookmark);
router.get('/bookmarks', getBookmarkedSessions);

// Organizer only routes
router.use(restrictTo('organizer'));

router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;