const mongoose = require('mongoose');

const Project = require('../../models/projects/projectModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');

exports.getProject = factory.getOne(Project, { path: 'timeLogs' });
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

// Set project and user id for the nested routes
exports.setProjectUserIds = (req, res, next) => {
  if (!req.body.project) req.body.project = req.params.projectId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Check if project belongs to the user
exports.checkProjectOfUser = asyncError(async (req, res, next) => {
  if (!req.body.project) req.body.project = req.params.projectId;
  if (!req.body.user) req.body.user = req.user.id;

  const projectId = mongoose.Types.ObjectId(req.body.project);
  const userId = mongoose.Types.ObjectId(req.body.user);

  const project = await Project.aggregate([
    {
      $match: { _id: projectId }
    },
    {
      $project: {
        isUser: {
          $or: [
            { $in: [userId, '$developers'] },
            { $in: [userId, '$designers'] },
            { $in: [userId, '$qa'] },
            { $in: [userId, '$devOps'] }
          ]
        }
      }
    }
  ]);

  const { isUser } = project[0];

  if (!isUser) {
    return next(new AppError('User is not associated with the project.', 400));
  }

  next();
});
