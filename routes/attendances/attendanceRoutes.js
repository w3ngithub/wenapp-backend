const express = require('express');

const attendanceController = require('../../controllers/attendances/attendanceController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(attendanceController.getAllAttendances)
  .post(
    authMiddleware.protect,
    authMiddleware.setUserIds,
    attendanceController.createAttendance
  );

router
  .route('/:id')
  .get(attendanceController.getAttendance)
  .patch(
    authMiddleware.protect,
    authMiddleware.setUserIds,
    attendanceController.updateAttendance
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    attendanceController.deleteAttendance
  );

module.exports = router;
