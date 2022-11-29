const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const UserRole = require('../../models/users/userRoleModel');
const factory = require('../factoryController');

exports.getUserRole = factory.getOne(UserRole);
exports.getAllUserRoles = factory.getAll(UserRole);
exports.createUserRole = factory.createOne(UserRole, ActivityLogs, 'User Role');
exports.updateUserRole = factory.updateOne(UserRole, ActivityLogs, 'User Role');
exports.deleteUserRole = factory.deleteOne(UserRole, ActivityLogs, 'User Role');
