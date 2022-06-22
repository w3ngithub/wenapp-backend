const Project = require('../../models/projects/projectModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');

exports.getProject = factory.getOne(Project);
exports.getAllProjects = factory.getAll(Project);
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);

exports.searchProject = asyncError(async (req, res, next) => {
  const searchTerm = `${req.params.term}`;

  const project = await Project.find({
    name: { $regex: searchTerm, $options: 'i' }
  });

  if (!project) {
    return next(new AppError('No project found.', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: project
    }
  });
});
