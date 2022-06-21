const UserRole = require('../models/userRoleModel');
const factory = require('./factoryController');

exports.getUserRole = factory.getOne(UserRole);
exports.getAllUserRoles = factory.getAll(UserRole);
exports.createUserRole = factory.createOne(UserRole);
exports.updateUserRole = factory.updateOne(UserRole);
exports.deleteUserRole = factory.deleteOne(UserRole);
