const LeaveQuarter = require('../../models/leaves/leaveQuarter');
const factory = require('../factoryController');
const ActivityLogs = require('../../models/activityLogs/activityLogsModel');

exports.getLeaveQuarter = factory.getOne(LeaveQuarter);
exports.getAllLeaveQuarters = factory.getAll(LeaveQuarter);
exports.createLeaveQuarters = factory.createOne(
  LeaveQuarter,
  ActivityLogs,
  'Leave Quarter'
);
exports.updateLeaveQuarters = factory.updateOne(
  LeaveQuarter,
  ActivityLogs,
  'Leave Quarter'
);
exports.deleteLeaveQuarters = factory.deleteOne(
  LeaveQuarter,
  ActivityLogs,
  'Leave Quarter'
);
