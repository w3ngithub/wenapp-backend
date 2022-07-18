const Holiday = require('../../models/holidays/holidayModel');
const factory = require('../factoryController');

const asyncError = require('../../utils/asyncError');

exports.getAllHolidays = factory.getAll(Holiday);

exports.addHoliday = asyncError(async (req, res, next) => {
  const holiday = new Holiday({
    year: req.body.year,
    holidays: req.body.holidays
  });

  const newHoliday = await holiday.save();

  res.json(newHoliday);
});
