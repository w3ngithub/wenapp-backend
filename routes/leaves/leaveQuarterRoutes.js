const express = require('express');

const leaveQuarterController = require('../../controllers/leaves/leaveQuarterController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(leaveQuarterController.getAllLeaveQuarters)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    leaveQuarterController.createLeaveQuarters
  );

router
  .route('/:id')
  .get(leaveQuarterController.getLeaveType)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    leaveQuarterController.updateLeaveQuarters
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    leaveQuarterController.deleteLeaveQuarters
  );

module.exports = router;
