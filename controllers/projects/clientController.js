const Client = require('../../models/projects/clientModel');
const factory = require('../factoryController');

exports.getClient = factory.getOne(Client);
exports.getAllClients = factory.getAll(Client);
exports.createClient = factory.createOne(Client);
exports.updateClient = factory.updateOne(Client);
exports.deleteClient = factory.deleteOne(Client);
