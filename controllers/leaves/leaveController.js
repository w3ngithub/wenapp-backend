const mongoose = require('mongoose');
const Leave = require('../../models/leaves/leaveModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const common = require('../../utils/common');
const Email = require('../../models/email/emailSettingModel');
const {
  INFOWENEMAIL,
  HRWENEMAIL,
  LEAVE_CANCELLED,
  LEAVE_PENDING,
  LEAVE_APPROVED,
  LEAVE_REJECTED,
  USER_CANCELLED
} = require('../../utils/constants');
const APIFeatures = require('../../utils/apiFeatures');
const { LEAVETYPES: leaveType } = require('../../utils/constants');
const User = require('../../models/users/userModel');
const EmailNotification = require('../../utils/email');
const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const UserLeave = require('../../models/leaves/UserLeavesModel');

exports.getLeave = factory.getOne(Leave);
exports.createLeave = factory.createOne(Leave, ActivityLogs, 'Leave');
exports.updateLeave = factory.updateOne(Leave, ActivityLogs, 'Leave');
exports.deleteLeave = factory.deleteOne(Leave, ActivityLogs, 'Leave');

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
  const { remarks, reason, reapplyreason } = req.body;
  const { fiscalYear, quarters } = req.fiscalYear;

  if (!leaveId || !status) {
    return next(new AppError('Missing leave ID or status in the route.', 400));
  }

  const leave = await Leave.findById(leaveId);

  if (!leave) {
    return next(new AppError('No leave found of the user.', 400));
  }

  let leaveStatus;
  const previousStatus = leave.leaveStatus;

  if (status === 'approve') {
    leaveStatus = 'approved';
  } else if (status === 'cancel') {
    leaveStatus = 'cancelled';
  } else if (status === 'reject') {
    leaveStatus = 'rejected';
  } else if (status === 'pending') {
    leaveStatus = 'pending';
  } else if (status === 'user-cancel') {
    leaveStatus = 'user cancelled';
  } else {
    return next(
      new AppError('Please specify exact leave status in the route.', 400)
    );
  }

  leave.remarks = remarks;
  leave.leaveStatus = leaveStatus;

  if (reason && status !== 'pending') {
    if (status === 'reject') {
      leave.rejectReason = reason;
    } else {
      leave.cancelReason = reason || leave.cancelReason;
    }
  }

  if (status === 'pending' && reapplyreason) {
    leave.reapplyreason = reapplyreason;
  }

  await leave.save();

  if (
    [leaveType.casualLeave, leaveType.sickLeave].includes(leave.leaveType.name)
  ) {
    const userLeave = await UserLeave.findOne({
      fiscalYear: fiscalYear,
      user: leave.user._id
    });

    let userLeaveToUpdate = [...userLeave.leaves];

    if (status === 'approve') {
      // update userLeave for each leave day taken of specififc quarter
      leave.leaveDates.forEach((l) => {
        const leaveTakenQuarter = quarters.find(
          (quarter) =>
            new Date(quarter.fromDate) <= new Date(l) &&
            new Date(l) <= new Date(quarter.toDate)
        );

        const updateLeave = userLeaveToUpdate.map((x) =>
          x.quarter._id.toString() === leaveTakenQuarter._id.toString()
            ? {
                ...JSON.parse(JSON.stringify(x)),
                approvedLeaves: {
                  sickLeaves:
                    leaveType.sickLeave === leave.leaveType.name
                      ? x.approvedLeaves.sickLeaves + 1
                      : x.approvedLeaves.sickLeaves,
                  casualLeaves:
                    leaveType.casualLeave === leave.leaveType.name
                      ? x.approvedLeaves.casualLeaves + 1
                      : x.approvedLeaves.casualLeaves
                },
                remainingLeaves: x.remainingLeaves - 1
              }
            : x
        );

        userLeaveToUpdate = [...updateLeave];
      });
    }

    if (
      status === 'cancel' &&
      ['approved', 'user cancelled'].includes(previousStatus)
    ) {
      // update userLeave for each leave day taken of specififc quarter
      leave.leaveDates.forEach((l) => {
        const leaveTakenQuarter = quarters.find(
          (quarter) =>
            new Date(quarter.fromDate) <= new Date(l) &&
            new Date(l) <= new Date(quarter.toDate)
        );

        const updateLeave = userLeaveToUpdate.map((x) =>
          x.quarter._id.toString() === leaveTakenQuarter._id.toString()
            ? {
                ...JSON.parse(JSON.stringify(x)),
                approvedLeaves: {
                  sickLeaves:
                    leaveType.sickLeave === leave.leaveType.name
                      ? x.approvedLeaves.sickLeaves - 1
                      : x.approvedLeaves.sickLeaves,
                  casualLeaves:
                    leaveType.casualLeave === leave.leaveType.name
                      ? x.approvedLeaves.casualLeaves - 1
                      : x.approvedLeaves.casualLeaves
                },
                remainingLeaves: x.remainingLeaves + 1
              }
            : x
        );

        userLeaveToUpdate = [...updateLeave];
      });
    }

    userLeave.leaves = userLeaveToUpdate;
    await userLeave.save();
  }

  // update userLeave of a user

  if (status === 'pending') {
    await ActivityLogs.create({
      status: 'updated',
      module: 'Leave',
      activity: `${leave.user.name} reapplied Leave`,
      user: {
        name: req.user.name,
        photo: req.user.photoURL
      }
    });
  } else if (status === 'reject') {
    await ActivityLogs.create({
      status: 'updated',
      module: 'Leave',
      activity:
        req.user.name === leave.user.name
          ? `${req.user.name} rejected Leave`
          : `${req.user.name} rejected Leave of ${leave.user.name}`,
      user: {
        name: req.user.name,
        photo: req.user.photoURL
      }
    });
  } else {
    await ActivityLogs.create({
      status: status === 'cancel' ? 'deleted' : 'updated',
      module: 'Leave',
      activity:
        req.user.name === leave.user.name
          ? `${req.user.name} ${
              status === 'approve' ? 'approved' : 'cancelled'
            } Leave`
          : `${req.user.name} ${
              status === 'approve' ? 'approved' : 'cancelled'
            } Leave of ${leave.user.name}`,
      user: {
        name: req.user.name,
        photo: req.user.photoURL
      }
    });
  }

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
        _id: '$leaveType.name',
        leavesTaken: {
          $sum: {
            $cond: [{ $eq: ['$halfDay', ''] }, 1, 0.5]
          }
        }
      }
    },
    { $unwind: '$_id' }
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

// Get future  approved/pending leaves
exports.getFutureLeaves = asyncError(async (req, res, next) => {
  const { todayDate } = req;

  const newLeaves = await Leave.aggregate([
    {
      $match: {
        leaveDates: {
          $elemMatch: {
            $gte: todayDate
          }
        },
        $or: [
          {
            leaveStatus: 'approved'
          },

          {
            leaveStatus: 'pending'
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
    { $unwind: '$leaveDates' },
    {
      $project: {
        _id: '$user._id',
        user: '$user.name',
        leaveDates: '$leaveDates',
        halfDay: '$halfDay',
        leaveType: '$leaveType.name',
        leaveStatus: '$leaveStatus',
        isSpecial: '$leaveType.isSpecial'
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
        leaveDates: todayDate
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              _id: 0,
              name: 1
            }
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
      $project: {
        user: 1,
        leaveType: 1,
        leaveDates: 1,
        halfDay: 1
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

  ActivityLogs.create({
    status: 'deleted',
    module: 'Leave',
    activity: `${req.user.name} deleted Leave Date : ${req.params.leaveDate}`,
    user: {
      name: req.user.name,
      photo: req.user.photoURL
    }
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
        leaveDates: todayDate
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
          isSpecial: '$leaveType.isSpecial',
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

      const message = `<b><em>${user.name}</em>  applied for leave on dates ${req.body.leaveDates}</b>`;

      new EmailNotification().sendEmail({
        email: [INFOWENEMAIL, HRWENEMAIL],
        subject: !req.body.reapply
          ? emailContent.title.replace(/@username/i, user.name)
          : `${user.name}  re-applied for leave`,
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
    } else if (req.body.leaveStatus === USER_CANCELLED) {
      const emailContent = await Email.findOne({ module: 'user-leave-cancel' });

      new EmailNotification().sendEmail({
        email: [INFOWENEMAIL, HRWENEMAIL],
        subject:
          emailContent.title.replace(/@username/i, req.body.user.name) ||
          `${req.body.user.name} cancelled leave `,
        message:
          emailContent.body
            .replace(/@username/i, req.body.user.name)
            .replace(/@reason/i, req.body.userCancelReason || '')
            .replace(
              /@date/i,
              req.body.leaveDates
                .toString()
                .split(',')
                .map((x) => `<p>${x.split('T')[0]}</p>`)
                .join('')
            ) || 'Leave Cancelled'
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
    } else if (req.body.leaveStatus === LEAVE_REJECTED) {
      console.log(req.body);
      const emailContent = await Email.findOne({ module: 'leave-reject' });

      new EmailNotification().sendEmail({
        email: [req.body.user.email],
        subject:
          emailContent.title.replace(/@username/i, req.body.user.name) ||
          `${req.body.user.name}  leaves rejected`,
        message: emailContent.body
          .replace(/@username/i, req.body.user.name)
          .replace(/@reason/i, req.body.leaveCancelReason || '')
          .replace(
            /@date/i,
            req.body.leaveDates
              .toString()
              .split(',')
              .map((x) => `<p>${x.split('T')[0]}</p>`)
              .join('')
          )
      });
    }

    res.status(200).json({
      status: 'success'
    });
  }
);
