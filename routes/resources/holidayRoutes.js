const express = require('express');

const authMiddleware = require('../../middlewares/authMiddleware');
const holidayController = require('../../controllers/resources/holidaysController');

const router = express.Router();

router.delete(
  '/remove/:id/:holidayId',
  holidayController.removeSingleHolidayOfYear
);

router
  .route('/:id')
  .get(holidayController.getHoliday)
  .patch(holidayController.updateHoliday)
  .delete(holidayController.deleteHoliday);

router
  .route('/')
  .get(holidayController.getAllHolidays)
  .post(holidayController.createHoliday);

module.exports = router;
