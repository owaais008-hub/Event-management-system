import { Router } from 'express';
import { 
  getPendingApprovals, 
  approveStaff, 
  rejectStaff, 
  listPendingEvents, 
  approveEvent, 
  rejectEvent, 
  blockUser,
  unblockUser,
  postAnnouncement
} from '../controllers/adminController.js';
import { authenticate, restrictTo } from '../middleware/auth.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, restrictTo('admin'));

// Get pending staff approvals
router.get('/approvals', getPendingApprovals);

// Approve a staff member
router.post('/approve/:id', approveStaff);

// Reject a staff member
router.delete('/reject/:id', rejectStaff);

// Handle query parameter based actions
router.post('/', (req, res, next) => {
  const { action, id } = req.query;
  
  // Create a mock request object with params to match controller expectations
  const mockReq = {
    params: { id },
    user: req.user
  };
  
  // Handle event approval/rejection via query parameters
  if (action === 'approve-event' && id) {
    return approveEvent(mockReq, res, next);
  } else if (action === 'reject-event' && id) {
    return rejectEvent(mockReq, res, next);
  }
  
  // If no matching action, return error
  return res.status(400).json({ message: 'Invalid action or missing parameters' });
});

// Get all pending events
router.get('/events/pending', listPendingEvents);

// Registration approvals are handled in registrationRoutes

// Block/unblock users
router.post('/block/:id', blockUser);
router.post('/unblock/:id', unblockUser);

// Announcements
router.post('/announce', postAnnouncement);

export default router;