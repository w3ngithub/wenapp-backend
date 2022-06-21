const express = require('express');

const userPositionController = require('../../controllers/users/userPositionController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(userPositionController.getAllUserPositions)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userPositionController.createUserPosition
  );

router
  .route('/:id')
  .get(userPositionController.getUserPosition)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userPositionController.updateUserPosition
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'manager'),
    userPositionController.deleteUserPosition
  );

module.exports = router;
