const express = require('express');

const authController = require('../../controllers/users/authController');
const userController = require('../../controllers/users/userController');
const authMiddleware = require('../../middlewares/authMiddleware');
const leaveRouter = require('../leaves/leaveRoutes');

const router = express.Router();

router.post('/invite', authController.inviteUser);
router.post('/signup/:token', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.use('/:userId/leaves', leaveRouter);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Restrict routes to admin only after this middleware
router.use(authMiddleware.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/:id/disable').post(userController.disableUser);

module.exports = router;
