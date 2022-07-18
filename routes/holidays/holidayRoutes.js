const express = require('express');

const router = express.Router();

const holidayController = require('../../controllers/holidays/holidaysController');

router.route('/').get().post(holidayController.addHoliday);

module.exports = router;
