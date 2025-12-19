import { connectDB } from '../lib/db.js';
import { authenticate, checkRole } from '../lib/auth.js';
import { 
  approveEvent, 
  rejectEvent, 
  listPendingEvents,
  blockUser,
  unblockUser
} from '../backend/src/controllers/adminController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  // Authenticate and check role
  try {
    const user = authenticate(req);
    req.user = user;
    checkRole(req, 'admin');
  } catch (err) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  switch (method) {
    case 'POST':
      switch (req.query.action) {
        case 'approve-event':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return approveEvent(req, res);
          }
          return res.status(400).json({ message: 'Event ID required' });
        case 'reject-event':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return rejectEvent(req, res);
          }
          return res.status(400).json({ message: 'Event ID required' });
        case 'block-user':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return blockUser(req, res);
          }
          return res.status(400).json({ message: 'User ID required' });
        case 'unblock-user':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return unblockUser(req, res);
          }
          return res.status(400).json({ message: 'User ID required' });
        default:
          return res.status(404).json({ message: 'Action not found' });
      }
    case 'GET':
      switch (req.query.action) {
        case 'pending-events':
          return listPendingEvents(req, res);
        default:
          return res.status(404).json({ message: 'Action not found' });
      }
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}