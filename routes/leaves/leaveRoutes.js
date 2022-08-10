const express = require('express');

const leaveController = require('../../controllers/leaves/leaveController');
const authMiddleware = require('../../middlewares/authMiddleware');
const fiscalYearMiddleware = require('../../middlewares/fiscalYearMiddleware');

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

router.get(
  '/users/leavedays',
  fiscalYearMiddleware.getFiscalYear,
  leaveController.calculateLeaveDaysOfUsers
);
router.get('/users/today', leaveController.getUsersOnLeaveToday);
router.patch('/:leaveId/status/:status', leaveController.updateLeaveStatus);
router.patch('/:leaveId/:leaveDate', leaveController.deleteSelectedLeaveDate);

router.get(
  '/:userId/leavedays',
  authMiddleware.setUserIdForNestedRoutes,
  fiscalYearMiddleware.getFiscalYear,
  leaveController.calculateLeaveDays
);

router.post('/filter', leaveController.filterExportLeaves);
router.delete('/:id', leaveController.deleteLeave);

module.exports = router;
