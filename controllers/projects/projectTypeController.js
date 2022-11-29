const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const ProjectType = require('../../models/projects/projectTypeModel');
const factory = require('../factoryController');

exports.getProjectType = factory.getOne(ProjectType);
exports.getAllProjectTypes = factory.getAll(ProjectType);
exports.createProjectType = factory.createOne(
  ProjectType,
  ActivityLogs,
  'Project Type'
);
exports.updateProjectType = factory.updateOne(
  ProjectType,
  ActivityLogs,
  'Project Type'
);
exports.deleteProjectType = factory.deleteOne(
  ProjectType,
  ActivityLogs,
  'Project Type'
);
