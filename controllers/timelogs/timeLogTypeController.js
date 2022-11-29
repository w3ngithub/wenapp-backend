const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const TimeLogType = require('../../models/timelogs/timeLogTypeModel');
const factory = require('../factoryController');

exports.getTimeLogType = factory.getOne(TimeLogType);
exports.getAllTimeLogTypes = factory.getAll(TimeLogType);
exports.createTimeLogType = factory.createOne(
  TimeLogType,
  ActivityLogs,
  'Log Type'
);
exports.updateTimeLogType = factory.updateOne(
  TimeLogType,
  ActivityLogs,
  'Log Type'
);
exports.deleteTimeLogType = factory.deleteOne(
  TimeLogType,
  ActivityLogs,
  'Log Type'
);
