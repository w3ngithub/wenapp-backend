const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const ProjectStatus = require('../../models/projects/projectStatusModel');
const factory = require('../factoryController');

exports.getProjectStatus = factory.getOne(ProjectStatus);
exports.getAllProjectStatus = factory.getAll(ProjectStatus);
exports.createProjectStatus = factory.createOne(
  ProjectStatus,
  ActivityLogs,
  'Project Status'
);
exports.updateProjectStatus = factory.updateOne(
  ProjectStatus,
  ActivityLogs,
  'Project Status'
);
exports.deleteProjectStatus = factory.deleteOne(
  ProjectStatus,
  ActivityLogs,
  'Project Status'
);
