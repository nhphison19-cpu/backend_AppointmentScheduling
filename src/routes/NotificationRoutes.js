const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/NotificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', NotificationController.getAllMyNotifications);

router.patch('/read-all', NotificationController.markAllRead);

router.patch('/:id/read', NotificationController.markOneRead);

router.delete('/:id', NotificationController.delete);

module.exports = router;