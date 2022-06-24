const TimeLog = require('../../models/timelogs/timeLogModel');
const factory = require('../factoryController');

exports.getTimeLog = factory.getOne(TimeLog);
exports.getAllTimeLogs = factory.getAll(TimeLog);
exports.createTimeLog = factory.createOne(TimeLog);
exports.updateTimeLog = factory.updateOne(TimeLog);
exports.deleteTimeLog = factory.deleteOne(TimeLog);
