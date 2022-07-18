const Holiday = require('../../models/holidays/holidayModel');

const asyncError = require('../../utils/asyncError');

exports.addHoliday = asyncError(async (req, res, next) => {
  console.log(req.body);

  const holiday = new Holiday({
    year: req.body.year,
    holidays: req.body.holidays
  });

  const newHoliday = await holiday.save();

  res.json(newHoliday);
});
