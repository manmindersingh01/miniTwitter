import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { deleteNotifications, getNotification } from '../controllers/notification.controller.js';
const router = express.Router();

router.get('/', protectRoute, getNotification)
router.delete('/', protectRoute, deleteNotifications);

export default router;