const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const Email = require('../../models/email/emailSettingModel');
const factory = require('../factoryController');

exports.getEmail = factory.getOne(Email);
exports.getAllEmails = factory.getAll(Email);
exports.createEmail = factory.createOne(Email, ActivityLogs, 'Email Setting');
exports.updateEmail = factory.updateOne(Email, ActivityLogs, 'Email Setting');
exports.deleteEmail = factory.deleteOne(Email, ActivityLogs, 'Email Setting');
