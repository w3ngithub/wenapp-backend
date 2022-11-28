const express = require('express');

const activityLogsController = require('../../controllers/activityLogs/activityLogsController');

const router = express.Router();

router
  .route('/')
  .get(activityLogsController.getAllActivityLogs)
  .post(activityLogsController.createActivityLog)
  .delete(activityLogsController.deleteActivityLog);

router
  .route('/:id')
  .get(activityLogsController.getActivityLog)
  .patch(activityLogsController.updateActivityLog);

module.exports = router;
