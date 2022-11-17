const express = require('express');

const leaveController = require('../../controllers/leaves/leaveController');
const authMiddleware = require('../../middlewares/authMiddleware');
const fiscalYearMiddleware = require('../../middlewares/fiscalYearMiddleware');
const getWeekDateMiddleware = require('../../middlewares/getweekDateMiddleware');
const sickCasualLeaveTypeMiddleware = require('../../middlewares/sickCausalMiddleware');

const router = express.Router({ mergeParams: true });

router.get('/', leaveController.getAllLeaves);
router.get('/today', leaveController.getTodayLeaves);
router.get('/:id', leaveController.getLeave);
router.get(
  '/users/weekLeaves',
  getWeekDateMiddleware.getWeekDate,
  leaveController.getWeekLeaves
);
router.get('/users/today/count', leaveController.getUsersCountOnLeaveToday);

router.get('/pending/count', leaveController.getPendingLeavesCount);

router.post(
  '/users/sendEmail',
  leaveController.sendLeaveApplyEmailNotifications
);

router.post(
  '/',
  authMiddleware.setUserIdForNestedRoutes,
  leaveController.createLeave
);
router.patch('/:id', leaveController.updateLeave);

router.get(
  '/users/fiscalYearLeaves',
  fiscalYearMiddleware.getFiscalYear,
  leaveController.getFiscalYearLeaves
);

router.get(
  '/users/leavedays',
  authMiddleware.restrictTo('admin', 'hr', 'manager', 'finance', 'lead'),
  sickCasualLeaveTypeMiddleware.getSickCasualLeave,
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

router.get(
  '/:userId/quarterleavedays',
  authMiddleware.setUserIdForNestedRoutes,
  sickCasualLeaveTypeMiddleware.getSickCasualLeave,
  leaveController.calculateLeaveDaysofQuarter
);

router.post(
  '/filter',
  authMiddleware.restrictTo('admin'),
  leaveController.filterExportLeaves
);
router.delete(
  '/:id',
  authMiddleware.restrictTo('admin'),
  leaveController.deleteLeave
);

module.exports = router;
