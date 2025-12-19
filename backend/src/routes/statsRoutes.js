import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { leaderboard, recommendations, summary, trending, dashboardStats, analytics, realTimeMetrics, predictiveAnalytics } from '../controllers/statsController.js';

const router = Router();
router.get('/leaderboard', leaderboard);
router.get('/recommendations', authenticate, recommendations);
router.get('/summary', summary);
router.get('/trending', trending);
router.get('/dashboard', dashboardStats);
router.get('/analytics', authenticate, analytics);
router.get('/realtime', realTimeMetrics);
router.get('/predictive', predictiveAnalytics);

export default router;