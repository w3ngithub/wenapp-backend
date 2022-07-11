const express = require('express');

const noticeTypeController = require('../../controllers/notices/noticeTypeController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(noticeTypeController.getAllNoticeTypes)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    noticeTypeController.createNoticeType
  );

router
  .route('/:id')
  .get(noticeTypeController.getNoticeType)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    noticeTypeController.updateNoticeType
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr'),
    noticeTypeController.deleteNoticeType
  );

module.exports = router;
