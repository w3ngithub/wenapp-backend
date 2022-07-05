const LeaveType = require('../../models/leaves/leaveTypeModel');
const factory = require('../factoryController');

exports.getLeaveType = factory.getOne(LeaveType);
exports.getAllLeaveTypes = factory.getAll(LeaveType);
exports.createLeaveType = factory.createOne(LeaveType);
exports.updateLeaveType = factory.updateOne(LeaveType);
exports.deleteLeaveType = factory.deleteOne(LeaveType);
