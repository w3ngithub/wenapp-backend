const UserLeave = require('../../models/leaves/UserLeavesModel');
const factory = require('../factoryController');

exports.createUserLeave = factory.createOne(UserLeave);
exports.getUserLeave = factory.getAll(UserLeave);
exports.updateUserLeave = factory.updateOne(UserLeave);
