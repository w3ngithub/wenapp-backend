const express = require('express');

const leaveTypeController = require('../../controllers/leaves/leaveTypeController');
const authMiddleware = require('../../middlewares/authMiddleware');
const Leave = require('../../models/leaves/leaveModel');

const router = express.Router();

router
  .route('/')
  .get(leaveTypeController.getAllLeaveTypes)
  .post(
    authMiddleware.restrictTo('admin', 'hr'),
    leaveTypeController.createLeaveType
  );

router
  .route('/:id')
  .get(leaveTypeController.getLeaveType)
  .patch(
    authMiddleware.restrictTo('admin', 'hr'),
    leaveTypeController.updateLeaveType
  )
  .delete(
    authMiddleware.restrictTo('admin', 'hr'),
    authMiddleware.checkIfValueToDeleteIsUsed(Leave, 'leaveType'),

    leaveTypeController.deleteLeaveType
  );

module.exports = router;
