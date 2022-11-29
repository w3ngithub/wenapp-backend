const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const Policy = require('../../models/resources/policyModel');
const factory = require('../factoryController');

exports.getPolicy = factory.getOne(Policy);
exports.getAllPolicies = factory.getAll(Policy);
exports.createPolicy = factory.createOne(Policy, ActivityLogs, 'Policy');
exports.updatePolicy = factory.updateOne(Policy, ActivityLogs, 'Policy');
exports.deletePolicy = factory.deleteOne(Policy, ActivityLogs, 'Policy');
