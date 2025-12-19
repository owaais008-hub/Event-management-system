import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getBooths, 
  createBooth,
  updateBooth,
  deleteBooth,
  selectBooth, 
  releaseBooth,
  getBoothTraffic
} from '../controllers/boothController.js';

const router = Router();

// Public routes
router.get('/event/:eventId', getBooths);
router.get('/event/:eventId/traffic', getBoothTraffic);

// Protected routes (require authentication)
router.use(authenticate);

// Booth management
router.post('/event/:eventId', createBooth);
router.put('/:boothId', updateBooth);
router.delete('/:boothId', deleteBooth);

// Booth selection and release
router.post('/:boothId/select', selectBooth);
router.post('/:boothId/release', releaseBooth);

export default router;