const express = require('express');

const userRoleController = require('../controllers/userRoleController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(userRoleController.getAllUserRoles)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userRoleController.createUserRole
  );

router
  .route('/:id')
  .get(userRoleController.getUserRole)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userRoleController.updateUserRole
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userRoleController.deleteUserRole
  );

module.exports = router;
