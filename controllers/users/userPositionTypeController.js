const UserPositionType = require('../../models/users/userPositionTypeModel');
const factory = require('../factoryController');

exports.getUserPositionType = factory.getOne(UserPositionType);
exports.getAllUserPositionTypes = factory.getAll(UserPositionType);
exports.createUserPositionType = factory.createOne(UserPositionType);
exports.updateUserPositionType = factory.updateOne(UserPositionType);
exports.deleteUserPositionType = factory.deleteOne(UserPositionType);
