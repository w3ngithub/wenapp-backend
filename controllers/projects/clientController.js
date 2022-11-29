const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const Client = require('../../models/projects/clientModel');
const factory = require('../factoryController');

exports.getClient = factory.getOne(Client);
exports.getAllClients = factory.getAll(Client);
exports.createClient = factory.createOne(Client, ActivityLogs, 'Client');
exports.updateClient = factory.updateOne(Client, ActivityLogs, 'Client');
exports.deleteClient = factory.deleteOne(Client, ActivityLogs, 'Client');
