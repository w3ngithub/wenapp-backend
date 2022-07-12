const express = require('express');

const leaveController = require('../../controllers/leaves/leaveController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.get('/', leaveController.getAllLeaves);
router.get('/:id', leaveController.getLeave);

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.post(
  '/',
  authMiddleware.setUserIdForNestedRoutes,
  leaveController.createLeave
);
router.patch('/:id', leaveController.updateLeave);

// Restrict all routes after this middleware
router.use(authMiddleware.restrictTo('admin'));

router.get('/users/leavedays', leaveController.calculateLeaveDaysOfUsers);
router.get('/users/today', leaveController.getUsersOnLeaveToday);
router.patch('/:leaveId/:leaveDate', leaveController.deleteSelectedLeaveDate);
router.patch('/:leaveId/:status', leaveController.updateLeaveStatus);

router.get(
  '/:userId/leavedays',
  authMiddleware.setUserIdForNestedRoutes,
  leaveController.calculateLeaveDays
);

router.post('/filter', leaveController.filterExportLeaves);
router.delete('/:id', leaveController.deleteLeave);

module.exports = router;
