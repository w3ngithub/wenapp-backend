const UserPosition = require('../../models/users/userPositionModel');
const factory = require('../factoryController');

exports.getUserPosition = factory.getOne(UserPosition);
exports.getAllUserPositions = factory.getAll(UserPosition);
exports.createUserPosition = factory.createOne(UserPosition);
exports.updateUserPosition = factory.updateOne(UserPosition);
exports.deleteUserPosition = factory.deleteOne(UserPosition);
