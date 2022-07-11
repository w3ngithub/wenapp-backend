const express = require('express');

const noticeController = require('../../controllers/notices/noticeController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(noticeController.getAllNotices)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    noticeController.createNotice
  );

router
  .route('/:id')
  .get(noticeController.getNotice)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    noticeController.updateNotice
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    noticeController.deleteNotice
  );

module.exports = router;
