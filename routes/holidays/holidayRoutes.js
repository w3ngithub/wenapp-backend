const express = require('express');

const fiscalYearMiddleware = require('../../middlewares/fiscalYearMiddleware');

const holidayController = require('../../controllers/holidays/holidaysController');

const router = express.Router();

router
  .route('/')
  .get(fiscalYearMiddleware.getFiscalYear, holidayController.getAllHolidays)
  .post(holidayController.addHoliday);

module.exports = router;
