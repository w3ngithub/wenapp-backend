const express = require('express');

const attendanceController = require('../../controllers/attendances/attendanceController');
const authMiddleware = require('../../middlewares/authMiddleware');
const checkAttendaceTimeMiddleware = require('../../middlewares/checkAttendanceTimeMiddleware');

const router = express.Router({ mergeParams: true });

router.patch(
  '/:id/punchout',
  checkAttendaceTimeMiddleware.checkAttendaceTime,
  attendanceController.updatePunchOutTime
);

router.get('/search', attendanceController.searchAttendances);

router.get('/today/count', attendanceController.getPunchInCountToday);

router.get('/lateArrival', attendanceController.getLateArrivalAttendances);

router.post(
  '/updateLateAttendace',
  attendanceController.leaveCutForLateAttendace
);

router
  .route('/')
  .get(attendanceController.getAllAttendances)
  .post(
    checkAttendaceTimeMiddleware.checkAttendaceTime,
    authMiddleware.setUserIdForNestedRoutes,
    attendanceController.createAttendance
  );

router
  .route('/:id')
  .get(attendanceController.getAttendance)
  .patch(authMiddleware.protect, attendanceController.updateAttendance)
  .delete(
    authMiddleware.restrictTo('admin', 'hr'),
    attendanceController.deleteAttendance
  );

module.exports = router;
