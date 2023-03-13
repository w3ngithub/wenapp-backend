const mongoose = require('mongoose');

const Project = require('../../models/projects/projectModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const { INFOWENEMAIL, MONTHS } = require('../../utils/constants');
const EmailNotification = require('../../utils/email');
const { todayDate } = require('../../utils/common');
const Email = require('../../models/email/emailSettingModel');
const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const { PROJECT_KEY } = require('../../utils/crypto');

exports.getProject = factory.getOne(Project, { path: 'timeLogs' });
exports.getAllProjects = factory.getAll(Project, PROJECT_KEY);
exports.createProject = factory.createOne(Project, ActivityLogs, 'Project');
exports.updateProject = factory.updateOne(Project, ActivityLogs, 'Project');
exports.deleteProject = factory.deleteOne(Project, ActivityLogs, 'Project');

// Partial search for the project name
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
  // pass to next middleware if project matches following id
  if (req.body.project === process.env.OTHER_PROJECT_ID) {
    next();
    return;
  }
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

// Get total time spent on a single project
exports.getTotalTimeSpent = asyncError(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(new AppError('Project not found.', 400));
  }

  const { totalTimeSpent } = project;

  res.status(200).json({
    status: 'success',
    data: {
      totalTimeSpent
    }
  });
});

// Get weekly time spent on a single project
exports.getWeeklyTimeSpent = asyncError(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(new AppError('Project not found.', 400));
  }

  const { weeklyTimeSpent } = project;

  res.status(200).json({
    status: 'success',
    data: {
      weeklyTimeSpent
    }
  });
});

exports.projectMaintenanceReminder = asyncError(async (req, res, next) => {
  const projects = await Project.find({
    $and: [
      {
        maintenance: { $exists: true, $ne: [] }
      },
      {
        maintenance: {
          $elemMatch: {
            enabled: true
          }
        }
      }
    ]
  });
  const emailContent = await Email.findOne({ module: 'project-maintenance' });

  projects.forEach((project) => {
    const maintenance = project.maintenance[0];
    if (maintenance.selectMonths && maintenance.selectMonths.length !== 0) {
      maintenance.selectMonths.forEach((month) => {
        if (todayDate().getMonth() === MONTHS[month]) {
          if (todayDate().getDate() === maintenance.emailDay) {
            new EmailNotification().sendEmail({
              email: [INFOWENEMAIL, maintenance.sendEmailTo],
              subject:
                emailContent.title.replace(/@project/i, project.name) ||
                'maintenance of project',
              message: emailContent.body.replace(/@project/i, project.name)
            });
          }
        }
      });
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: 'successful'
    }
  });
});
