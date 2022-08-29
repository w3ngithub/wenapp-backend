const mongoose = require('mongoose');

const Leave = require('../../models/leaves/leaveModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const common = require('../../utils/common');

exports.getLeave = factory.getOne(Leave);
exports.getAllLeaves = factory.getAll(Leave);
exports.createLeave = factory.createOne(Leave);
exports.updateLeave = factory.updateOne(Leave);
exports.deleteLeave = factory.deleteOne(Leave);

const allocatedLeaveDays = process.env.ALLOCATED_TOTAL_LEAVE_DAYS * 1;

// Update leave status of user for approve or cancel
exports.updateLeaveStatus = asyncError(async (req, res, next) => {
  const { leaveId, status } = req.params;
  const { remarks } = req.body;

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

  await leave.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: leave
    }
  });
});

// Calculate remaining and applied leave days
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
      $group: {
        _id: 'null',
        leavesTaken: {
          $sum: {
            $cond: [{ $eq: ['$halfDay', false] }, 1, 0.5]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        leavesTaken: 1,
        leavesRemaining: {
          $subtract: [allocatedLeaveDays, '$leavesTaken']
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

// Calculate remaining and applied leave days of all users
exports.calculateLeaveDaysOfUsers = asyncError(async (req, res, next) => {
  const { currentFiscalYearStartDate, currentFiscalYearEndDate } =
    req.fiscalYear;

  const leaveCounts = await Leave.aggregate([
    {
      $unwind: '$leaveDates'
    },
    {
      $match: {
        leaveStatus: 'approved',
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
      $group: {
        _id: '$user.name',
        leavesTaken: {
          $sum: {
            $cond: [{ $eq: ['$halfDay', false] }, 1, 0.5]
          }
        }
      }
    },
    {
      $project: {
        _id: 1,
        leavesTaken: 1,
        leavesRemaining: {
          $subtract: [allocatedLeaveDays, '$leavesTaken']
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
      $unwind: '$leaveDates'
    },
    {
      $match: {
        leaveStatus: 'approved',
        leaveDates: { $eq: todayDate }
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
          user: '$user.name',
          leaveDates: '$leaveDates',
          leaveType: '$leaveType.name',
          leaveStatus: '$leaveStatus',
          reason: '$reason',
          halfDay: '$halfDay'
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
