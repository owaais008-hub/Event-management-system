import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';
import { registerForEvent, myRegistrations, getParticipants, exportParticipantsCsv, approveRegistration, denyRegistration, getPendingRegistrations } from '../controllers/registrationController.js';

const router = Router();

router.post('/:id/register', authenticate, authorizeRoles('student', 'organizer', 'admin'), registerForEvent);
router.get('/me', authenticate, myRegistrations);
router.get('/pending', authenticate, authorizeRoles('admin'), getPendingRegistrations);
router.get('/:id/participants', authenticate, authorizeRoles('organizer', 'admin'), getParticipants);
router.get('/:id/participants.csv', authenticate, authorizeRoles('organizer', 'admin'), exportParticipantsCsv);

// Admin approval routes
router.post('/:id/approve', authenticate, authorizeRoles('admin'), approveRegistration);
router.post('/:id/deny', authenticate, authorizeRoles('admin'), denyRegistration);

export default router;


