const Project = require('../../models/projects/projectModel');
const factory = require('../factoryController');

exports.getProject = factory.getOne(Project);
exports.getAllProjects = factory.getAll(Project);
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);
