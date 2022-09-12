const express = require('express');

const leaveController = require('../../controllers/leaves/leaveController');
const authMiddleware = require('../../middlewares/authMiddleware');
const fiscalYearMiddleware = require('../../middlewares/fiscalYearMiddleware');
const getWeekDateMiddleware = require('../../middlewares/getweekDateMiddleware');

const router = express.Router({ mergeParams: true });

router.get('/', leaveController.getAllLeaves);
router.get('/:id', leaveController.getLeave);
router.get(
  '/users/weekLeaves',
  getWeekDateMiddleware.getWeekDate,
  leaveController.getWeekLeaves
);
router.get('/users/today/count', leaveController.getUsersCountOnLeaveToday);

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.get('/pending/count', leaveController.getPendingLeavesCount);

router.post(
  '/',
  authMiddleware.setUserIdForNestedRoutes,
  leaveController.createLeave
);
router.patch('/:id', leaveController.updateLeave);

// Restrict all routes after this middleware
router.use(authMiddleware.restrictTo('admin'));

router.get(
  '/users/fiscalYearLeaves',
  fiscalYearMiddleware.getFiscalYear,
  leaveController.getFiscalYearLeaves
);

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
