const express = require('express');

const fiscalYearMiddleware = require('../../middlewares/fiscalYearMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');

const holidayController = require('../../controllers/holidays/holidaysController');

const router = express.Router();

router
  .route('/:id')
  .get(
    fiscalYearMiddleware.getFiscalYear,
    holidayController.getOneFiascalYearHolidays
  )
  .patch(authMiddleware.protect, holidayController.updateFiscalYearHolidays)
  .delete(authMiddleware.protect, holidayController.removeSingleHolidayYear);

router
  .route('/')
  .get(fiscalYearMiddleware.getFiscalYear, holidayController.getAllHolidays)
  .post(authMiddleware.protect, holidayController.addNewFiscalYearHolidays);

module.exports = router;
