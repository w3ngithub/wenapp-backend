const Holiday = require('../../models/holidays/holidayModel');
const factory = require('../factoryController');

exports.getAllHolidays = factory.getAll(Holiday);
exports.getOneFiascalYearHolidays = factory.getOne(Holiday);
exports.addNewFiscalYearHolidays = factory.createOne(Holiday);
exports.updateFiscalYearHolidays = factory.updateOne(Holiday);
exports.removeSingleHolidayYear = factory.deleteOne(Holiday);
