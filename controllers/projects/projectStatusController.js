const ProjectStatus = require('../../models/projects/projectStatusModel');
const factory = require('../factoryController');

exports.getProjectStatus = factory.getOne(ProjectStatus);
exports.getAllProjectStatus = factory.getAll(ProjectStatus);
exports.createProjectStatus = factory.createOne(ProjectStatus);
exports.updateProjectStatus = factory.updateOne(ProjectStatus);
exports.deleteProjectStatus = factory.deleteOne(ProjectStatus);
