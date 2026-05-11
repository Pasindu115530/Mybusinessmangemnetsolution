import express from 'express';
import { getAdminDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/admin-stats', requireAuth, getAdminDashboardStats);

export default dashboardRouter;
