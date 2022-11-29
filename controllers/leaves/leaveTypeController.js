const LeaveType = require('../../models/leaves/leaveTypeModel');
const factory = require('../factoryController');
const ActivityLogs = require('../../models/activityLogs/activityLogsModel');

exports.getLeaveType = factory.getOne(LeaveType);
exports.getAllLeaveTypes = factory.getAll(LeaveType);
exports.createLeaveType = factory.createOne(
  LeaveType,
  ActivityLogs,
  'Leave Type'
);
exports.updateLeaveType = factory.updateOne(
  LeaveType,
  ActivityLogs,
  'Leave Type'
);
exports.deleteLeaveType = factory.deleteOne(
  LeaveType,
  ActivityLogs,
  'Leave Type'
);
