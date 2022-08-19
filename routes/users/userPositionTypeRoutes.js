const express = require('express');

const userPositionTypeController = require('../../controllers/users/userPositionTypeController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(userPositionTypeController.getAllUserPositionTypes)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userPositionTypeController.createUserPositionType
  );

router
  .route('/:id')
  .get(userPositionTypeController.getUserPositionType)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userPositionTypeController.updateUserPositionType
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userPositionTypeController.deleteUserPositionType
  );

module.exports = router;
