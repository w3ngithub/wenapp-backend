const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const ProjectTag = require('../../models/projects/projectTagModel');
const factory = require('../factoryController');

exports.getProjectTag = factory.getOne(ProjectTag);
exports.getAllProjectTags = factory.getAll(ProjectTag);
exports.createProjectTag = factory.createOne(
  ProjectTag,
  ActivityLogs,
  'Project Tag'
);
exports.updateProjectTag = factory.updateOne(
  ProjectTag,
  ActivityLogs,
  'Project Tag'
);
exports.deleteProjectTag = factory.deleteOne(
  ProjectTag,
  ActivityLogs,
  'Project Tag'
);
