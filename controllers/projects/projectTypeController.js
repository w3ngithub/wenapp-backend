const ProjectType = require('../../models/projects/projectTypeModel');
const factory = require('../factoryController');

exports.getProjectType = factory.getOne(ProjectType);
exports.getAllProjectTypes = factory.getAll(ProjectType);
exports.createProjectType = factory.createOne(ProjectType);
exports.updateProjectType = factory.updateOne(ProjectType);
exports.deleteProjectType = factory.deleteOne(ProjectType);
