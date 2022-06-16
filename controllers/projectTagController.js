const ProjectTag = require('../models/projectTagModel');
const factory = require('./factoryController');

exports.getProjectTag = factory.getOne(ProjectTag);
exports.getAllProjectTags = factory.getAll(ProjectTag);
exports.createProjectTag = factory.createOne(ProjectTag);
exports.updateProjectTag = factory.updateOne(ProjectTag);
exports.deleteProjectTag = factory.deleteOne(ProjectTag);
