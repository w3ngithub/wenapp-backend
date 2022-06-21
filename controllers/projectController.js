const Project = require('../models/projectModel');
const factory = require('./factoryController');
const constant = require('../utils/constant');

exports.getProject = factory.getOne(Project);
exports.getAllProjects = factory.getAll(Project);
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);

// Get all project types object
exports.getProjectTypes = (req, res, next) => {
  const { projectTypes } = constant;
  res.status(200).json({
    status: 'success',
    data: projectTypes
  });
};

// Get all project status object
exports.getProjectStatus = (req, res, next) => {
  const { projectStatus } = constant;
  res.status(200).json({
    status: 'success',
    data: projectStatus
  });
};
