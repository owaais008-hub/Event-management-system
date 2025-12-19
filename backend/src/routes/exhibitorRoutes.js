import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import {
  getApprovedExhibitors,
  getAllExhibitors,
  getExhibitorById,
  createExhibitor,
  updateExhibitor,
  deleteExhibitor,
  updateExhibitorStatus,
  createPublicExhibitor
} from '../controllers/exhibitorController.js';

const router = Router();

// Public routes
router.get('/', getApprovedExhibitors); // Default route returns approved exhibitors
router.get('/approved', getApprovedExhibitors);
router.post('/register', createPublicExhibitor); // Public exhibitor registration

// Protected routes for organizers and admins
router.use(authenticate);
router.get('/all', authorizeRoles('organizer', 'admin'), getAllExhibitors);
router.get('/:id', getExhibitorById);
router.post('/', authorizeRoles('organizer', 'admin'), createExhibitor);
router.put('/:id', authorizeRoles('organizer', 'admin'), updateExhibitor);
router.post('/:id/status', authorizeRoles('organizer', 'admin'), updateExhibitorStatus);
router.delete('/:id', authorizeRoles('organizer', 'admin'), deleteExhibitor);

export default router;