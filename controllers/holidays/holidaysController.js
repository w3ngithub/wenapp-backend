const Holiday = require('../../models/holidays/holidayModel');
const factory = require('../factoryController');

const AppError = require('../../utils/appError');

const asyncError = require('../../utils/asyncError');

exports.getAllHolidays = factory.getAll(Holiday);
exports.getOneFiascalYearHolidays = factory.getOne(Holiday);
exports.addNewFiscalYearHolidays = factory.createOne(Holiday);
exports.updateFiscalYearHolidays = factory.updateOne(Holiday);
exports.removeSingleHolidayYear = factory.deleteOne(Holiday);

exports.removeSingleHolidayOfYear = asyncError(async (req, res, next) => {
  const { id, holidayId } = req.params;

  const doc = await Holiday.findOneAndUpdate(
    { _id: id },
    { $pull: { holidays: { _id: holidayId } } },
    { safe: true, multi: false }
  );

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    message: `Selected Holiday has been deleted.`
  });
});
