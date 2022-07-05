const express = require('express');

const projectController = require('../../controllers/projects/projectController');
const timeLogController = require('../../controllers/timelogs/timeLogController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware.protect);

router.route('/users/weeklytime').get(timeLogController.getUserWeeklyTimeSpent);
router.route('/users/todaytime').get(timeLogController.getUserTodayTimeSpent);
router.route('/weeklyreport').post(timeLogController.getWeeklyReport);

router
  .route('/')
  .get(timeLogController.getAllTimeLogs)
  .post(
    projectController.setProjectUserIds,
    projectController.checkProjectOfUser,
    timeLogController.checkTimeLogDays,
    timeLogController.createTimeLog
  );

router
  .route('/:id')
  .get(timeLogController.getTimeLog)
  .patch(
    projectController.checkProjectOfUser,
    timeLogController.checkTimeLogDays,
    timeLogController.updateTimeLog
  )
  .delete(
    authMiddleware.restrictTo('admin', 'manager'),
    timeLogController.deleteTimeLog
  );

module.exports = router;