const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const factory = require('../factoryController');

exports.getActivityLog = factory.getOne(ActivityLogs);
exports.getAllActivityLogs = factory.getAll(ActivityLogs);
exports.createActivityLog = factory.createOne(ActivityLogs);
exports.updateActivityLog = factory.updateOne(ActivityLogs);
exports.deleteActivityLog = factory.deleteOne(ActivityLogs);
