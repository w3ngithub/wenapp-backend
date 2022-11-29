const mongoose = require('mongoose');

const TimeLog = require('../../models/timelogs/timeLogModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const common = require('../../utils/common');
const APIFeatures = require('../../utils/apiFeatures');

exports.getTimeLog = factory.getOne(TimeLog);
//exports.getAllTimeLogs = factory.getAll(TimeLog);
exports.createTimeLog = factory.createOne(TimeLog);
exports.updateTimeLog = factory.updateOne(TimeLog);
exports.deleteTimeLog = factory.deleteOne(TimeLog);

//get all the timelogs with sorting

exports.getAllTimeLogs = asyncError(async (req, res, next) => {
  if (
    TimeLog.schema.path(req.query.sort.replace('-', '')) instanceof
      mongoose.Schema.Types.ObjectId &&
    req.query.sort.includes('user')
  ) {
    const ApiInstance = new APIFeatures(TimeLog.find({}), req.query);
    const newfeatures = ApiInstance.filter().search().formattedQuery;
    const paginatedfeature = ApiInstance.paginate().paginateObject;

    let newFilter = {};

    Object.keys(newfeatures).forEach((data) => {
      if (TimeLog.schema.path(data) instanceof mongoose.Schema.Types.ObjectId) {
        newFilter[data] = new mongoose.Types.ObjectId(newfeatures[data]);
      } else {
        newFilter[data] = newfeatures[data];
      }
    });
    const orderSort = req.query.sort[0] === '-' ? -1 : 1;

    const [sortedData, totalCount] = await Promise.all([
      TimeLog.aggregate([
        {
          $match: newFilter
        },
        {
          $lookup: {
            from: 'users',
            let: { user_id: '$user' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$user_id', '$_id'] } } },
              {
                $lookup: {
                  from: 'user_position_types',
                  localField: 'positionType',
                  foreignField: '_id',
                  as: 'positionTypes'
                }
              },
              {
                $set: {
                  positionType: { $arrayElemAt: ['$positionTypes', 0] }
                }
              },
              {
                $project: {
                  name: 1,
                  positionType: 1
                }
              }
            ],
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $sort: { 'user.name': orderSort }
        },
        {
          $lookup: {
            from: 'projects',
            let: { project_id: '$project' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$project_id', '$_id'] } } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'createdBy'
                }
              },

              {
                $lookup: {
                  from: 'users',
                  localField: 'updatedBy',
                  foreignField: '_id',
                  as: 'updatedBy'
                }
              },
              {
                $set: {
                  createdBy: { $arrayElemAt: ['$createdBy', 0] },
                  updatedBy: { $arrayElemAt: ['$updatedBy', 0] }
                }
              },
              { $project: { name: 1, slug: 1, createdBy: 1, updatedBy: 1 } }
            ],
            as: 'projects'
          }
        },
        {
          $lookup: {
            from: 'timelog_types',
            let: { logtype_id: '$logType' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$logtype_id', '$_id'] } } },
              { $project: { name: 1 } }
            ],
            as: 'logTypes'
          }
        },
        { $skip: paginatedfeature.skip },
        { $limit: paginatedfeature.limit },
        {
          $set: {
            project: { $arrayElemAt: ['$projects', 0] },
            logType: { $arrayElemAt: ['$logTypes', 0] }
          }
        },
        {
          $unset: ['logTypes', 'projects']
        }
      ]),
      TimeLog.countDocuments(newfeatures)
    ]);

    return res.status(200).json({
      status: 'success',
      results: sortedData.length,
      data: {
        data: sortedData,
        count: totalCount
      }
    });
  }
  const features = new APIFeatures(TimeLog.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .search();

  const [doc, count] = await Promise.all([
    features.query,
    TimeLog.countDocuments(features.formattedQuery)
  ]);

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
      count
    }
  });
});

// Get weekly logs of user
exports.getWeeklyLogsOfUser = asyncError(async (req, res, next) => {
  const { firstDayOfWeek, lastDayOfWeek } = common.dateInThisWeek();

  const features = new APIFeatures(
    TimeLog.find({
      $and: [
        { logDate: { $gte: firstDayOfWeek } },
        { logDate: { $lte: lastDayOfWeek } }
      ]
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (
    TimeLog.schema.path(req.query.sort.replace('-', '')) instanceof
      mongoose.Schema.Types.ObjectId &&
    req.query.sort.includes('project')
  ) {
    const ApiInstance = new APIFeatures(TimeLog.find({}), req.query);
    const paginatedfeature = ApiInstance.paginate().paginateObject;

    const orderSort = req.query.sort[0] === '-' ? -1 : 1;

    const [sortedData, totalCount] = await Promise.all([
      TimeLog.aggregate([
        {
          $match: {
            $and: [
              { logDate: { $gte: firstDayOfWeek } },
              { logDate: { $lte: lastDayOfWeek } }
            ]
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { user_id: '$user' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$user_id', '$_id'] } } },
              {
                $lookup: {
                  from: 'user_position_types',
                  localField: 'positionType',
                  foreignField: '_id',
                  as: 'positionTypes'
                }
              },
              {
                $set: {
                  positionType: { $arrayElemAt: ['$positionTypes', 0] }
                }
              },
              {
                $project: {
                  name: 1,
                  positionType: 1
                }
              }
            ],
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },

        {
          $lookup: {
            from: 'projects',
            let: { project_id: '$project' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$project_id', '$_id'] } } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'createdBy'
                }
              },

              {
                $lookup: {
                  from: 'users',
                  localField: 'updatedBy',
                  foreignField: '_id',
                  as: 'updatedBy'
                }
              },
              {
                $set: {
                  createdBy: { $arrayElemAt: ['$createdBy', 0] },
                  updatedBy: { $arrayElemAt: ['$updatedBy', 0] }
                }
              },
              {
                $project: {
                  name: 1,
                  slug: 1,
                  createdBy: 1,
                  updatedBy: 1,
                  lowerName: { $toLower: '$name' }
                }
              }
            ],
            as: 'project'
          }
        },
        {
          $unwind: '$project'
        },
        {
          $sort: {
            'project.lowerName': orderSort
          }
        },
        {
          $lookup: {
            from: 'timelog_types',
            let: { logtype_id: '$logType' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$logtype_id', '$_id'] } } },
              { $project: { name: 1 } }
            ],
            as: 'logTypes'
          }
        },
        { $skip: paginatedfeature.skip },
        { $limit: paginatedfeature.limit },
        {
          $set: {
            logType: { $arrayElemAt: ['$logTypes', 0] }
          }
        },
        {
          $unset: ['logTypes', 'projects', 'project.lowerName']
        }
      ]),
      TimeLog.countDocuments({
        ...features.formattedQuery,
        logDate: { $gte: firstDayOfWeek }
      })
    ]);

    return res.status(200).json({
      status: 'success',
      results: sortedData.length,
      data: {
        data: sortedData,
        count: totalCount
      }
    });
  }

  const [doc, count] = await Promise.all([
    features.query,
    TimeLog.countDocuments({
      ...features.formattedQuery,
      logDate: { $gte: firstDayOfWeek }
    })
  ]);

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
      count
    }
  });
});

// Check for allowed time log days before add/edit
exports.checkTimeLogDays = (req, res, next) => {
  const { logDate } = req.body;

  const today = new Date().getDate();
  const logDay = new Date(logDate).getDate();

  const allowedTimeLogDays = process.env.ALLOWED_TIMELOG_DAYS;

  if (!['admin', 'manager'].includes(req.user.roleKey)) {
    if (!(today - logDay <= allowedTimeLogDays)) {
      return next(
        new AppError(
          `You are not allowed to add/edit time log after ${allowedTimeLogDays} Days`,
          400
        )
      );
    }
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
      $sort: {
        'project.createdAt': -1
      }
    },
    {
      $sort: {
        'project.createdAt': -1
      }
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

// Get time log summary for chart
exports.getTimelogForChart = asyncError(async (req, res, next) => {
  const { project, logType } = req.query;

  const matchConditions = [
    { project: { $eq: mongoose.Types.ObjectId(project) } }
  ];

  if (logType) {
    const logs = logType.split(',');
    matchConditions.push({
      logType: { $in: logs.map((log) => mongoose.Types.ObjectId(log)) }
    });
  }

  const chart = await TimeLog.aggregate([
    {
      $match: {
        $and: matchConditions
      }
    },
    {
      $lookup: {
        from: 'timelog_types',
        localField: 'logType',
        foreignField: '_id',
        as: 'logType'
      }
    },
    {
      $group: {
        _id: '$logType',
        timeSpent: { $sum: '$totalHours' }
      }
    },
    {
      $addFields: { logType: '$_id' }
    },
    {
      $project: {
        _id: 0,
        'logType.name': 1,
        'logType.color': 1,
        timeSpent: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      chart
    }
  });
});

// Get worklog reports
exports.getWorklogReport = asyncError(async (req, res, next) => {
  const { fromDate, toDate, logType, user, project } = req.query;

  const matchConditions = [
    { logDate: { $gte: new Date(fromDate) } },
    { logDate: { $lte: new Date(toDate) } }
  ];

  if (logType) {
    matchConditions.push({
      logType: { $eq: mongoose.Types.ObjectId(logType) }
    });
  }

  if (user) {
    matchConditions.push({
      user: { $eq: mongoose.Types.ObjectId(user) }
    });
  }

  if (project) {
    matchConditions.push({
      project: { $eq: mongoose.Types.ObjectId(project) }
    });
  }

  const report = await TimeLog.aggregate([
    {
      $match: {
        $and: matchConditions
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
              name: 1
            }
          }
        ],
        as: 'project'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              name: 1
            }
          }
        ],
        as: 'user'
      }
    },
    {
      $group: {
        _id: '$user',
        timeLogs: {
          $push: {
            project: '$project',
            logType: '$logType',
            logDate: '$logDate',
            totalHours: '$totalHours',
            remarks: '$remarks'
          }
        },
        totalTimeSpent: { $sum: '$totalHours' }
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
