const LeaveQuarter = require('../../models/leaves/leaveQuarter');
const factory = require('../factoryController');

exports.getLeaveQuarter = factory.getOne(LeaveQuarter);
exports.getAllLeaveQuarters = factory.getAll(LeaveQuarter);
exports.createLeaveQuarters = factory.createOne(LeaveQuarter);
exports.updateLeaveQuarters = factory.updateOne(LeaveQuarter);
exports.deleteLeaveQuarters = factory.deleteOne(LeaveQuarter);
