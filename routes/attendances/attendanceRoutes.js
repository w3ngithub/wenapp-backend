const express = require('express');

const attendanceController = require('../../controllers/attendances/attendanceController');
const authMiddleware = require('../../middlewares/authMiddleware');
const checkAttendaceTimeMiddleware = require('../../middlewares/checkAttendanceTimeMiddleware');

const router = express.Router({ mergeParams: true });

router.patch(
  '/:id/punchout',
  authMiddleware.protect,
  checkAttendaceTimeMiddleware.checkAttendaceTime,
  attendanceController.updatePunchOutTime
);

router.get(
  '/search',
  authMiddleware.protect,
  attendanceController.searchAttendances
);

router.get(
  '/today/count',
  authMiddleware.protect,
  attendanceController.getPunchInCountToday
);

router.get(
  '/lateArrival',
  authMiddleware.protect,
  attendanceController.getLateArrivalAttendances
);

router.post(
  '/updateLateAttendace',
  authMiddleware.protect,
  attendanceController.leaveCutForLateAttendace
);

router
  .route('/')
  .get(attendanceController.getAllAttendances)
  .post(
    authMiddleware.protect,
    checkAttendaceTimeMiddleware.checkAttendaceTime,
    authMiddleware.setUserIdForNestedRoutes,
    (req, res, next) => {
      req.body.punchInIp =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      next();
    },
    attendanceController.createAttendance
  );

router
  .route('/:id')
  .get(attendanceController.getAttendance)
  .patch(authMiddleware.protect, attendanceController.updateAttendance)
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    attendanceController.deleteAttendance
  );

module.exports = router;
