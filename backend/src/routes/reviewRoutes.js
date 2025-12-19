import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { addReview, listReviews, updateReview, deleteReview, getUserReviews } from '../controllers/reviewController.js';

const router = Router();

router.get('/:id', listReviews);
router.post('/:id', authenticate, authorizeRoles('student', 'organizer'), addReview);
router.put('/:id', authenticate, authorizeRoles('student', 'organizer'), updateReview);
router.delete('/:id', authenticate, authorizeRoles('student', 'organizer'), deleteReview);
router.get('/user/me', authenticate, getUserReviews);

export default router;