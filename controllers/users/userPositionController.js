const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const UserPosition = require('../../models/users/userPositionModel');
const factory = require('../factoryController');

exports.getUserPosition = factory.getOne(UserPosition);
exports.getAllUserPositions = factory.getAll(UserPosition);
exports.createUserPosition = factory.createOne(
  UserPosition,
  ActivityLogs,
  'User Position'
);
exports.updateUserPosition = factory.updateOne(
  UserPosition,
  ActivityLogs,
  'User Position'
);
exports.deleteUserPosition = factory.deleteOne(
  UserPosition,
  ActivityLogs,
  'User Position'
);
