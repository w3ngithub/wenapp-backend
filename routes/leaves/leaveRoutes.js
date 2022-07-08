const express = require('express');

const leaveController = require('../../controllers/leaves/leaveController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router
  .route('/users/leavedays')
  .get(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.calculateLeaveDaysOfUsers
  );

router
  .route('/users/today')
  .get(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.getUsersOnLeaveToday
  );

router
  .route('/:leaveId/:leaveDate')
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.deleteSelectedLeaveDate
  );

router
  .route('/:leaveId/:status')
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.updateLeaveStatus
  );

router
  .route('/:userId/leavedays')
  .get(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.setLeaveUserIds,
    leaveController.calculateLeaveDays
  );

router
  .route('/filter')
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.filterExportLeaves
  );

router
  .route('/')
  .get(leaveController.getAllLeaves)
  .post(
    authMiddleware.protect,
    leaveController.setLeaveUserIds,
    leaveController.createLeave
  );

router
  .route('/:id')
  .get(leaveController.getLeave)
  .patch(authMiddleware.protect, leaveController.updateLeave)
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    leaveController.deleteLeave
  );

module.exports = router;
