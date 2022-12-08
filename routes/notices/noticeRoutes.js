const express = require('express');

const noticeController = require('../../controllers/notices/noticeController');
const authMiddleware = require('../../middlewares/authMiddleware');
const getWeekDateMiddleware = require('../../middlewares/getweekDateMiddleware');

const router = express.Router();

router
  .route('/')
  .get(noticeController.getAllNotices)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr', 'manager', 'officeAdmin'),
    noticeController.createNotice
  );

router.get(
  '/weekNotices',
  getWeekDateMiddleware.getWeekDate,
  noticeController.getWeekNotices
);

router
  .route('/:id')
  .get(noticeController.getNotice)
  .patch(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr', 'manager', 'officeAdmin'),
    noticeController.updateNotice
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'hr', 'manager', 'officeAdmin'),
    noticeController.deleteNotice
  );

module.exports = router;
