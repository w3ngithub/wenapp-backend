const express = require('express');

const notificationsController = require('../../controllers/notifications/notificationController');

const router = express.Router();

router
  .route('/')
  .get(notificationsController.getAllNotifications)
  .delete(notificationsController.deleteNotification)
  .patch(notificationsController.updateNotification);

module.exports = router;
