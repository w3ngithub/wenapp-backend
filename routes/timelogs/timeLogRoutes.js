const express = require('express');

const timeLogController = require('../../controllers/timelogs/timeLogController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware.protect);

router
  .route('/')
  .get(timeLogController.getAllTimeLogs)
  .post(timeLogController.setProjectUserIds, timeLogController.createTimeLog);

router
  .route('/:id')
  .get(timeLogController.getTimeLog)
  .patch(timeLogController.updateTimeLog)
  .delete(
    authMiddleware.restrictTo('admin', 'manager'),
    timeLogController.deleteTimeLog
  );

module.exports = router;
