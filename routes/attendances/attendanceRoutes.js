const express = require('express');

const attendanceController = require('../../controllers/attendances/attendanceController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.patch(
  '/:id/punchout',
  authMiddleware.protect,
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

router
  .route('/')
  .get(attendanceController.getAllAttendances)
  .post(
    authMiddleware.protect,
    authMiddleware.setUserIdForNestedRoutes,
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
