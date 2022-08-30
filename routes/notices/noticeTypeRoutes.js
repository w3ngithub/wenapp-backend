const express = require('express');

const noticeTypeController = require('../../controllers/notices/noticeTypeController');
const authMiddleware = require('../../middlewares/authMiddleware');
const Notice = require('../../models/notices/noticeModel');

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
    authMiddleware.checkIfValueToDeleteIsUsed(Notice, 'noticeType'),

    noticeTypeController.deleteNoticeType
  );

module.exports = router;
