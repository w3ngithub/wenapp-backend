const express = require('express');

const activityLogsController = require('../../controllers/activityLogs/activityLogsController');

const router = express.Router();

router
  .route('/')
  .get(activityLogsController.getAllActivityLogs)
  .post(activityLogsController.createActivityLog);

router
  .route('/:id')
  .get(activityLogsController.getActivityLog)
  .patch(activityLogsController.updateActivityLog)
  .delete(activityLogsController.deleteActivityLog);

module.exports = router;
