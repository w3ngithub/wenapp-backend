const mongoose = require('mongoose');

const Leave = require('../../models/leaves/leaveModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const common = require('../../utils/common');
const Email = require('../../models/email/emailSettingModel');
const {
  POSITIONS,
  INFOWENEMAIL,
  HRWENEMAIL,
  LEAVE_CANCELLED,
  LEAVE_PENDING,
  LEAVE_APPROVED
} = require('../../utils/constants');
const APIFeatures = require('../../utils/apiFeatures');
const LeaveQuarter = require('../../models/leaves/leaveQuarter');
const User = require('../../models/users/userModel');
const EmailNotification = require('../../utils/email');

exports.getLeave = factory.getOne(Leave);
exports.createLeave = factory.createOne(Leave);
exports.updateLeave = factory.updateOne(Leave);
exports.deleteLeave = factory.deleteOne(Leave);

exports.getAllLeaves = asyncError(async (req, res, next) => {
  const { fromDate, toDate } = req.query;

  const features = new APIFeatures(Leave.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .search();
  if (fromDate && toDate) {
    const doc = await features.query.find({
      leaveDates: { $gte: fromDate, $lte: toDate }
    });
    const count = await Leave.countDocuments({
      ...features.formattedQuery,
      leaveDates: { $gt: fromDate, $lt: toDate }
    });

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
        count
      }
    });
  } else {
    const [doc, count] = await Promise.all([
      features.query,
      Leave.countDocuments(features.formattedQuery)
    ]);
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
        count
      }
    });
  }
});

// Update leave status of user for approve or cancel
exports.updateLeaveStatus = asyncError(async (req, res, next) => {
  const { leaveId, status } = req.params;
  const { remarks, reason } = req.body;

  if (!leaveId || !status) {
    return next(new AppError('Missing leave ID or status in the route.', 400));
  }

  const leave = await Leave.findById(leaveId);

  if (!leave) {
    return next(new AppError('No leave found of the user.', 400));
  }

  let leaveStatus;

  if (status === 'approve') {
    leaveStatus = 'approved';
  } else if (status === 'cancel') {
    leaveStatus = 'cancelled';
  } else {
    return next(
      new AppError('Please specify exact leave status in the route.', 400)
    );
  }

  leave.remarks = remarks;
  leave.leaveStatus = leaveStatus;

  if (reason) {
    leave.cancelReason = reason;
  }

  await leave.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: leave
    }
  });
});

// Calculate  applied leave days of a user of a year
exports.calculateLeaveDays = asyncError(async (req, res, next) => {
  const { currentFiscalYearStartDate, currentFiscalYearEndDate } =
    req.fiscalYear;
  const userId = mongoose.Types.ObjectId(req.params.userId);

  const leaveCounts = await Leave.aggregate([
    {
      $unwind: '$leaveDates'
    },
    {
      $match: {
        user: userId,
        leaveStatus: 'approved',
        $and: [
          { leaveDates: { $gte: new Date(currentFiscalYearStartDate) } },
          { leaveDates: { $lte: new Date(currentFiscalYearEndDate) } }
        ]
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leaveType',
        foreignField: '_id',
        as: 'leaveType'
      }
    },
    {
      $group: {
        _id: '$leaveType',
        leavesTaken: {
          $sum: {
            $cond: [{ $eq: ['$halfDay', ''] }, 1, 0.5]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: leaveCounts
    }
  });
});

// Calculate  applied leave days of a user of a quarter
exports.calculateLeaveDaysofQuarter = asyncError(async (req, res, next) => {
  const { leaveTypes } = req;
  const latestYearQuarter = await LeaveQuarter.findOne().sort({
    createdAt: -1
  });

  const userId = mongoose.Types.ObjectId(req.params.userId);

  const { firstQuarter, secondQuarter, thirdQuarter, fourthQuarter } =
    latestYearQuarter;

  const currentDate = new Date();
  let currentQuarterIndex = 0;
  if (
    currentDate >= new Date(firstQuarter.fromDate) &&
    currentDate <= new Date(firstQuarter.toDate)
  ) {
    currentQuarterIndex = 1;
  } else if (
    currentDate >= new Date(secondQuarter.fromDate) &&
    currentDate <= new Date(secondQuarter.toDate)
  ) {
    currentQuarterIndex = 2;
  } else if (
    currentDate >= new Date(thirdQuarter.fromDate) &&
    currentDate <= new Date(thirdQuarter.toDate)
  ) {
    currentQuarterIndex = 3;
  } else {
    currentQuarterIndex = 4;
  }

  const tillNowQuarter = [
    firstQuarter,
    secondQuarter,
    thirdQuarter,
    fourthQuarter
  ];

  tillNowQuarter.length = currentQuarterIndex;

  const quarterLeaves = await Promise.all(
    tillNowQuarter.map((q) => {
      const { fromDate, toDate } = q;
      return Leave.aggregate([
        {
          $match: {
            user: userId,
            leaveStatus: 'approved',
            $or: [
              {
                leaveType: leaveTypes[0]._id
              },
              { leaveType: leaveTypes[1]._id }
            ]
          }
        },
        {
          $unwind: '$leaveDates'
        },
        {
          $match: {
            $and: [
              { leaveDates: { $gte: new Date(fromDate) } },
              { leaveDates: { $lte: new Date(toDate) } }
            ]
          }
        },
        {
          $lookup: {
            from: 'leave_types',
            localField: 'leaveType',
            foreignField: '_id',
            as: 'leaveType'
          }
        },
        {
          $group: {
            _id: null,
            leavesTaken: {
              $sum: {
                $cond: [{ $eq: ['$halfDay', ''] }, 1, 0.5]
              }
            }
          }
        }
      ]);
    })
  );
  const { allocatedLeaves } = JSON.parse(JSON.stringify(req.user));
  const allocatedLeavesOfUser = allocatedLeaves || {};
  const totalQuarter = [
    allocatedLeavesOfUser.firstQuarter,
    allocatedLeavesOfUser.secondQuarter,
    allocatedLeavesOfUser.thirdQuarter,
    allocatedLeavesOfUser.fourthQuarter
  ];

  totalQuarter.length = currentQuarterIndex;

  let remainingLeaves = 0;
  if (req.user.position.name !== POSITIONS.intern) {
    totalQuarter.forEach((q, i) => {
      if (remainingLeaves < 0) {
        remainingLeaves = 0;
      }
      if (quarterLeaves[i][0] && quarterLeaves[i][0].leavesTaken) {
        remainingLeaves += q - quarterLeaves[i][0].leavesTaken;
      } else {
        remainingLeaves += q;
      }
    });
  }

  const { leavesTaken } = quarterLeaves[quarterLeaves.length - 1][0] || {
    leavesTaken: 0
  };

  if (req.user.position.name === POSITIONS.intern) {
    remainingLeaves = totalQuarter[totalQuarter.length - 1] - leavesTaken;
  }

  res.status(200).json({
    status: 'success',
    data: {
      remainingLeaves,
      leavesTaken
    }
  });
});

// Calculate remaining and applied leave days of all users
exports.calculateLeaveDaysOfUsers = asyncError(async (req, res, next) => {
  const { quarter } = req.query;
  const { leaveTypes } = req;

  const latestYearQuarter = await LeaveQuarter.findOne().sort({
    createdAt: -1
  });

  const { firstQuarter, secondQuarter, thirdQuarter, fourthQuarter } =
    latestYearQuarter;

  const tillNowQuarter = [
    firstQuarter,
    secondQuarter,
    thirdQuarter,
    fourthQuarter
  ];

  tillNowQuarter.length = quarter;

  const leaveCounts = await Promise.all(
    tillNowQuarter.map((q) => {
      const { fromDate, toDate } = q;
      return Leave.aggregate([
        {
          $unwind: '$leaveDates'
        },
        {
          $match: {
            leaveStatus: 'approved',
            $and: [
              { leaveDates: { $gte: new Date(fromDate) } },
              { leaveDates: { $lte: new Date(toDate) } }
            ],
            $or: [
              {
                leaveType: leaveTypes[0]._id
              },
              { leaveType: leaveTypes[1]._id }
            ]
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $group: {
            _id: {
              name: '$user.name',
              _id: '$user._id',
              position: '$user.position',
              allocatedLeaves: '$user.allocatedLeaves'
            },
            leavesTaken: {
              $sum: {
                $cond: [{ $eq: ['$halfDay', ''] }, 1, 0.5]
              }
            }
          }
        }
      ]);
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      data: leaveCounts
    }
  });
});

// Get all users on leave today
exports.getUsersOnLeaveToday = asyncError(async (req, res, next) => {
  const todayDate = common.todayDate();

  const leave = await Leave.aggregate([
    {
      $unwind: '$leaveDates'
    },
    {
      $match: {
        leaveStatus: 'approved',
        leaveDates: { $eq: todayDate }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leaveType',
        foreignField: '_id',
        as: 'leaveType'
      }
    },
    {
      $group: {
        _id: {
          user: '$user.name',
          leaveDates: '$leaveDates',
          leaveType: '$leaveType.name'
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: leave
    }
  });
});

// Get week range approved leaves
exports.getWeekLeaves = asyncError(async (req, res, next) => {
  const { todayDate, afterOneWeekDate } = req;

  const newLeaves = await Leave.aggregate([
    {
      $match: {
        leaveStatus: 'approved',
        $or: [
          {
            $and: [
              {
                'leaveDates.0': { $lt: todayDate }
              },
              { 'leaveDates.1': { $gt: afterOneWeekDate } }
            ]
          },

          {
            $or: [
              { 'leaveDates.0': { $gte: todayDate, $lte: afterOneWeekDate } },
              {
                'leaveDates.1': { $gte: todayDate, $lte: afterOneWeekDate }
              }
            ]
          },
          {
            'leaveDates.0': { $gte: todayDate, $lte: afterOneWeekDate }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leaveType',
        foreignField: '_id',
        as: 'leaveType'
      }
    },

    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        _id: '$user._id',
        user: '$user.name',
        leaveDates: '$leaveDates',
        halfDay: '$halfDay',
        leaveType: '$leaveType.name'
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: newLeaves
    }
  });
});
exports.getTodayLeaves = asyncError(async (req, res, next) => {
  const todayDate = common.todayDate();
  const newLeaves = await Leave.aggregate([
    {
      $match: {
        leaveStatus: 'approved',
        $or: [
          {
            leaveDates: todayDate
          },
          {
            'leaveDates.0': {
              $eq: todayDate
            }
          },
          {
            'leaveDates.1': {
              $eq: todayDate
            }
          },
          {
            'leaveDates.0': {
              $lt: todayDate
            },
            'leaveDates.1': {
              $gt: todayDate
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leaveType',
        foreignField: '_id',
        as: 'leaveType'
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: newLeaves
    }
  });
});

// Delete selected leave dates of user
exports.deleteSelectedLeaveDate = asyncError(async (req, res, next) => {
  const leaveId = mongoose.Types.ObjectId(req.params.leaveId);
  const leaveDate = new Date(req.params.leaveDate);

  await Leave.findByIdAndUpdate(leaveId, {
    $pull: { leaveDates: leaveDate }
  });

  res.status(200).json({
    status: 'success',
    message: `Selected Leave Date : ${req.params.leaveDate} has been deleted.`
  });
});

// Filter leaves with search criteria
exports.filterExportLeaves = asyncError(async (req, res, next) => {
  const { fromDate, toDate, leaveStatus, user } = req.body;

  const matchConditions = [
    { leaveDates: { $gte: new Date(fromDate) } },
    { leaveDates: { $lte: new Date(toDate) } }
  ];

  if (user) {
    matchConditions.push({
      user: mongoose.Types.ObjectId(user)
    });
  }

  if (leaveStatus) {
    matchConditions.push({
      leaveStatus: leaveStatus
    });
  }

  const leave = await Leave.aggregate([
    {
      $match: {
        $and: matchConditions
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leaveType',
        foreignField: '_id',
        as: 'leaveType'
      }
    },
    {
      $group: {
        _id: {
          user: '$user.name',
          leaveDates: '$leaveDates',
          leaveType: '$leaveType.name',
          leaveStatus: '$leaveStatus',
          reason: '$reason'
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: leave
    }
  });
});

// Get pending leaves count
exports.getPendingLeavesCount = asyncError(async (req, res, next) => {
  const leaves = await Leave.find({ leaveStatus: { $eq: 'pending' } }).count();

  res.status(200).json({
    status: 'success',
    data: {
      leaves
    }
  });
});

// Get count of all users on leave today
exports.getUsersCountOnLeaveToday = asyncError(async (req, res, next) => {
  const todayDate = common.todayDate();

  const leaves = await Leave.aggregate([
    {
      $match: {
        leaveStatus: 'approved',
        $or: [
          {
            'leaveDates.0': { $eq: todayDate }
          },
          {
            'leaveDates.0': { $lte: todayDate },
            'leaveDates.1': { $gte: todayDate }
          }
        ]
      }
    },
    {
      $count: 'count'
    }
  ]);

  res.status(200).json({
    status: 'success',
    leaves
  });
});

// get Fiscal year leaves
exports.getFiscalYearLeaves = asyncError(async (req, res, next) => {
  const { currentFiscalYearStartDate, currentFiscalYearEndDate } =
    req.fiscalYear;
  const leaveCounts = await Leave.aggregate([
    {
      $match: {
        leaveStatus: 'approved'
      }
    },
    {
      $unwind: '$leaveDates'
    },
    {
      $match: {
        $and: [
          { leaveDates: { $gte: new Date(currentFiscalYearStartDate) } },
          { leaveDates: { $lte: new Date(currentFiscalYearEndDate) } }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leaveType',
        foreignField: '_id',
        as: 'leaveType'
      }
    },
    {
      $group: {
        _id: {
          id: '$_id',
          user: '$user.name',
          leaveType: '$leaveType.name',
          leaveStatus: '$leaveStatus',
          reason: '$reason',
          halfDay: '$halfDay'
        },

        leaveDates: {
          $push: '$leaveDates'
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: leaveCounts
    }
  });
});

exports.sendLeaveApplyEmailNotifications = asyncError(
  async (req, res, next) => {
    if (req.body.leaveStatus === LEAVE_PENDING) {
      const user = await User.findById(req.body.user);

      const emailContent = await Email.findOne({ module: 'leave-pending' });

      const message = `<b><em>${user.name}</em> applied for leave on dates ${req.body.leaveDates}</b>`;

      new EmailNotification().sendEmail({
        email: [INFOWENEMAIL, HRWENEMAIL],
        subject:
          emailContent.title.replace(/@username/i, user.name) ||
          `${user.name} applied for leave`,
        message:
          emailContent.body
            .replace(/@username/i, user.name)
            .replace(/@reason/i, req.body.leaveReason)
            .replace(/@leavetype/i, req.body.leaveType)
            .replace(
              /@date/i,
              req.body.leaveDates
                .toString()
                .split(',')
                .map((x) => `<p>${x.split('T')[0]}</p>`)
                .join('')
            ) || message
      });
    } else if (req.body.leaveStatus === LEAVE_CANCELLED) {
      const emailContent = await Email.findOne({ module: 'leave-cancel' });

      new EmailNotification().sendEmail({
        email: [INFOWENEMAIL, HRWENEMAIL, req.body.user.email],
        subject:
          emailContent.title.replace(/@username/i, req.body.user.name) ||
          `${req.body.user.name}  leaves cancelled`,
        message:
          emailContent.body
            .replace(/@username/i, req.body.user.name)
            .replace(/@reason/i, req.body.leaveCancelReason || '')
            .replace(
              /@date/i,
              req.body.leaveDates
                .toString()
                .split(',')
                .map((x) => `<p>${x.split('T')[0]}</p>`)
                .join('')
            ) || 'Leave Cancelled'
      });
    } else if (req.body.leaveStatus === LEAVE_APPROVED) {
      const emailContent = await Email.findOne({ module: 'leave-approve' });

      new EmailNotification().sendEmail({
        email: [req.body.user.email],
        subject: emailContent.title || `${req.body.user.name}  leaves approved`,
        message: emailContent.body
          .replace(/@username/i, req.body.user.name)
          .replace(/@reason/i, req.body.leaveApproveReason || '')
      });
    }
    res.status(200).json({
      status: 'success'
    });
  }
);
