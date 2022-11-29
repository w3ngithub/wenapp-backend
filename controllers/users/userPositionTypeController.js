const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const UserPositionType = require('../../models/users/userPositionTypeModel');
const factory = require('../factoryController');

exports.getUserPositionType = factory.getOne(UserPositionType);
exports.getAllUserPositionTypes = factory.getAll(UserPositionType);
exports.createUserPositionType = factory.createOne(
  UserPositionType,
  ActivityLogs,
  'User Position Type'
);
exports.updateUserPositionType = factory.updateOne(
  UserPositionType,
  ActivityLogs,
  'User Position Type'
);
exports.deleteUserPositionType = factory.deleteOne(
  UserPositionType,
  ActivityLogs,
  'User Position Type'
);
