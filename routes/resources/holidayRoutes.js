const express = require('express');

const fiscalYearMiddleware = require('../../middlewares/fiscalYearMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const holidayController = require('../../controllers/resources/holidaysController');

const router = express.Router();

router.delete(
  '/remove/:id/:holidayId',
  authMiddleware.protect,
  holidayController.removeSingleHolidayOfYear
);

router
  .route('/:id')
  .get(fiscalYearMiddleware.getFiscalYear, holidayController.getHoliday)
  .patch(authMiddleware.protect, holidayController.updateHoliday)
  .delete(authMiddleware.protect, holidayController.deleteHoliday);

router
  .route('/')
  .get(fiscalYearMiddleware.getFiscalYear, holidayController.getAllHolidays)
  .post(authMiddleware.protect, holidayController.createHoliday);

module.exports = router;
