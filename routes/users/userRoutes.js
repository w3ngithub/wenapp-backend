const express = require('express');

const authController = require('../../controllers/users/authController');
const userController = require('../../controllers/users/userController');
const authMiddleware = require('../../middlewares/authMiddleware');
const leaveRouter = require('../leaves/leaveRoutes');
const attendanceRouter = require('../attendances/attendanceRoutes');

const router = express.Router();

router
  .route('/invite')
  .get(authController.getAllInvitedUsers)
  .post(authController.inviteUser);
router.post('/signup/:token', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/', userController.getAllUsers);

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.get('/count', userController.getActiveUser);

// Assigning nested routes to create user leaves and attendance by admin using a single POST request
router.use('/:userId/leaves', leaveRouter);
router.use('/:userId/attendances', attendanceRouter);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/birthday', userController.getBirthMonthUser);
router.get('/salaryReview', userController.getSalarayReviewUsers);

// Restrict routes to admin only after this middleware
router.use(authMiddleware.restrictTo('admin'));

router.post('/import', userController.importUsers);
router.patch('/resetAllocatedLeaves', userController.resetAllocatedLeaves);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.post('/:id/disable', userController.disableUser);

module.exports = router;
