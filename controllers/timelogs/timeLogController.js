const mongoose = require('mongoose');

const TimeLog = require('../../models/timelogs/timeLogModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const common = require('../../utils/common');

exports.getTimeLog = factory.getOne(TimeLog);
exports.getAllTimeLogs = factory.getAll(TimeLog);
exports.createTimeLog = factory.createOne(TimeLog);
exports.updateTimeLog = factory.updateOne(TimeLog);
exports.deleteTimeLog = factory.deleteOne(TimeLog);

// Check for allowed time log days before add/edit
exports.checkTimeLogDays = (req, res, next) => {
  const { logDate } = req.body;

  const today = new Date().getDate();
  const logDay = new Date(logDate).getDate();

  const allowedTimeLogDays = process.env.ALLOWED_TIMELOG_DAYS;

  if (!(today - logDay <= allowedTimeLogDays)) {
    return next(
      new AppError(
        `You are not allowed to add/edit time log after ${allowedTimeLogDays} Days`,
        400
      )
    );
  }
  next();
};

// Get weekly time summary of user with time log details
exports.getUserWeeklyTimeSpent = asyncError(async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.user.id);

  const { firstDayOfWeek, lastDayOfWeek } = common.dateInThisWeek();

  const userTimeSummary = await TimeLog.aggregate([
    {
      $match: {
        user: userId,
        $and: [
          { logDate: { $gte: firstDayOfWeek } },
          { logDate: { $lte: lastDayOfWeek } }
        ]
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              slug: 1,
              name: 1
            }
          }
        ],
        as: 'project'
      }
    },
    {
      $lookup: {
        from: 'timelog_types',
        localField: 'logType',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 0,
              name: 1
            }
          }
        ],
        as: 'logType'
      }
    },
    {
      $group: {
        _id: '$user',
        timeSpentThisWeek: { $sum: '$totalHours' },
        timeLogs: {
          $push: {
            project: '$project',
            logType: '$logType',
            logDate: '$logDate',
            totalHours: '$totalHours',
            remarks: '$remarks'
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      weeklySummary: userTimeSummary
    }
  });
});

// Get user total time spent on a day for projects
exports.getUserTodayTimeSpent = asyncError(async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.user.id);

  const { todayDate, tomorrowDate } = common.todayTomorrowDate();

  const timeSpentToday = await TimeLog.aggregate([
    {
      $match: {
        user: userId,
        $and: [
          { logDate: { $gte: todayDate } },
          { logDate: { $lt: tomorrowDate } }
        ]
      }
    },
    {
      $group: {
        _id: '$user',
        timeSpentToday: { $sum: '$totalHours' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      timeSpentToday
    }
  });
});

// Get weekly time summary of user with time log details
exports.getWeeklyReport = asyncError(async (req, res, next) => {
  const { fromDate, toDate, projectStatus, logType, client } = req.query;

  const matchConditions = [
    { logDate: { $gte: new Date(fromDate) } },
    { logDate: { $lte: new Date(toDate) } }
  ];

  if (logType) {
    matchConditions.push({
      logType: { $eq: mongoose.Types.ObjectId(logType) }
    });
  }

  if (projectStatus) {
    matchConditions.push({
      'project.projectStatus': { $eq: mongoose.Types.ObjectId(projectStatus) }
    });
  }

  if (client) {
    matchConditions.push({
      'project.client': { $eq: mongoose.Types.ObjectId(client) }
    });
  }

  const report = await TimeLog.aggregate([
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'project'
      }
    },
    {
      $match: {
        $and: matchConditions
      }
    },
    {
      $group: {
        _id: '$project',
        timeSpent: { $sum: '$totalHours' }
      }
    },
    {
      $addFields: { project: '$_id' }
    },
    {
      $project: {
        _id: 0,
        'project._id': 1,
        'project.name': 1,
        'project.projectStatus': 1,
        'project.client': 1,
        timeSpent: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});
