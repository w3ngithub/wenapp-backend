const FAQ = require('../../models/resources/faqModel');
const factory = require('../factoryController');
const ActivityLogs = require('../../models/activityLogs/activityLogsModel');

exports.getFAQ = factory.getOne(FAQ);
exports.getAllFAQs = factory.getAll(FAQ);
exports.createFAQ = factory.createOne(FAQ, ActivityLogs, 'FAQ');
exports.updateFAQ = factory.updateOne(FAQ, ActivityLogs, 'FAQ');
exports.deleteFAQ = factory.deleteOne(FAQ, ActivityLogs, 'FAQ');
