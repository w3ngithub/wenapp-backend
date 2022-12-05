const TimeLogType = require('../../models/timelogs/timeLogTypeModel');
const factory = require('../factoryController');

exports.getTimeLogType = factory.getOne(TimeLogType);
exports.getAllTimeLogTypes = factory.getAll(TimeLogType);
exports.createTimeLogType = factory.createOne(TimeLogType);
exports.updateTimeLogType = factory.updateOne(TimeLogType);
exports.deleteTimeLogType = factory.deleteOne(TimeLogType);
