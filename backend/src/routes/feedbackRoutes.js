import { Router } from 'express';
import { 
  submitFeedback,
  getEventFeedback,
  getEventRatings,
  getUserFeedback,
  updateFeedback,
  deleteFeedback,
  approveFeedback,
  rejectFeedback,
  getTopRatedEvents
} from '../controllers/feedbackController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/top-rated', getTopRatedEvents);
router.get('/event/:eventId', getEventFeedback);
router.get('/event/:eventId/ratings', getEventRatings);

// All other routes require authentication
router.use(authenticate);

// Submit feedback (participants only)
router.post('/', restrictTo('student'), submitFeedback);

// Get user's feedback
router.get('/me', getUserFeedback);

// Update feedback (user can only update their own)
router.put('/:id', updateFeedback);

// Delete feedback (user can only delete their own)
router.delete('/:id', deleteFeedback);

// Admin approval/rejection routes
router.post('/:id/approve', restrictTo('admin'), approveFeedback);
router.post('/:id/reject', restrictTo('admin'), rejectFeedback);

export default router;