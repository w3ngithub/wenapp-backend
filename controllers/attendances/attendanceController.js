const mongoose = require('mongoose');

const Attendance = require('../../models/attendances/attendanceModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const common = require('../../utils/common');
const Email = require('../../models/email/emailSettingModel');
const User = require('../../models/users/userModel');

const EmailNotification = require('../../utils/email');
const { HRWENEMAIL, INFOWENEMAIL } = require('../../utils/constants');

exports.getAttendance = factory.getOne(Attendance);
exports.getAllAttendances = factory.getAll(Attendance);
exports.createAttendance = factory.createOne(Attendance);
exports.updateAttendance = factory.updateOne(Attendance);
exports.deleteAttendance = factory.deleteOne(Attendance);

// Update punch out time and mid day exit and notes
exports.updatePunchOutTime = asyncError(async (req, res, next) => {
  const reqBody = {
    midDayExit: req.body.midDayExit,
    punchOutTime: Date.now(),
    punchOutNote: req.body.punchOutNote,
    updatedBy: req.user.id,
    punchOutLocation: req.body.punchOutLocation,
    punchOutIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  };

  const doc = await Attendance.findByIdAndUpdate(req.params.id, reqBody, {
    new: true,
    runValidators: true
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

// Search attendances with date range and for particular user
exports.searchAttendances = asyncError(async (req, res, next) => {
  const { fromDate, toDate, user, page, limit } = req.query;

  const pages = page * 1 || 1;
  const limits = limit * 1 || 100;
  const skip = (pages - 1) * limit;

  const matchConditions = [
    { attendanceDate: { $gte: new Date(fromDate) } },
    { attendanceDate: { $lte: new Date(toDate) } }
  ];

  if (user) {
    matchConditions.push({
      user: mongoose.Types.ObjectId(user)
    });
  }

  const attendances = await Attendance.aggregate([
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
      $set: {
        user: {
          $arrayElemAt: ['$user.name', 0]
        }
      }
    },
    {
      $group: {
        _id: {
          attendanceDate: '$attendanceDate',
          user: '$user'
        },
        data: {
          $addToSet: {
            punchInTime: '$punchInTime',
            attendanceDate: '$attendanceDate',
            createdAt: '$createdAt',
            createdBy: '$createdBy',
            midDayExit: '$midDayExit',
            punchOutTime: '$punchOutTime',
            updatedAt: '$updatedAt',
            user: '$user',
            _id: '$_id',
            punchOutNote: '$punchOutNote',
            punchInNote: '$punchInNote',
            punchInLocation: '$punchInLocation',
            punchOutLocation: '$punchOutLocation',
            punchInIp: '$punchInIp',
            punchOutIp: '$punchOutIp'
          }
        }
      }
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: +skip }, { $limit: +limits }]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      attendances
    }
  });
});

// Get users count for today's punch in
exports.getPunchInCountToday = asyncError(async (req, res, next) => {
  const todayDate = common.todayDate();

  const attendance = await Attendance.aggregate([
    {
      $match: {
        attendanceDate: { $eq: todayDate }
      }
    },
    { $group: { _id: '$user' } },
    {
      $count: 'count'
    }
  ]);

  res.status(200).json({
    status: 'success',
    attendance
  });
});

// Search attendaces with late arrival time
exports.getLateArrivalAttendances = asyncError(async (req, res, next) => {
  const { fromDate, toDate, user, lateArrivalLeaveCut } = req.query;
  const matchConditions = [
    { attendanceDate: { $gte: new Date(fromDate) } },
    { attendanceDate: { $lte: new Date(toDate) } },
    { lateArrivalLeaveCut: { $eq: +lateArrivalLeaveCut !== 1 } }
  ];

  if (user) {
    matchConditions.push({
      user: mongoose.Types.ObjectId(user)
    });
  }

  const attendances = await Attendance.aggregate([
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
      $set: {
        user: {
          $arrayElemAt: ['$user.name', 0]
        },
        userId: { $arrayElemAt: ['$user._id', 0] },
        officeTime: '$user.officeTime'
      }
    },
    {
      $group: {
        _id: { attendaceDate: '$attendanceDate', user: '$userId' },
        data: { $push: '$$ROOT' }
      }
    },
    {
      $unwind: '$data'
    },
    { $sort: { 'data.punchInTime': 1 } },
    {
      $group: {
        _id: '$_id',
        data: { $first: '$$ROOT' }
      }
    },
    {
      $unwind: '$data'
    },
    {
      $project: {
        _id: '$data.data._id',
        attendanceDate: '$data.data.attendanceDate',
        user: '$data.data.user',
        lateArrivalLeaveCut: '$data.data.lateArrivalLeaveCut',
        midDayExit: '$data.data.midDayExit',
        punchInTime: '$data.data.punchInTime',
        punchOutTime: '$data.data.punchOutTime',
        userId: '$data.data.userId',
        punchInLocation: '$punchInLocation',
        punchOutLocation: '$punchOutLocation',
        officeTime: {
          $arrayElemAt: ['$data.data.officeTime', 0]
        }
      }
    },
    {
      $addFields: {
        punchHour: {
          $hour: '$punchInTime'
        },
        punchMinutes: {
          $minute: '$punchInTime'
        },
        startHour: { $convert: { input: '$officeTime.hour', to: 'int' } },
        startMinute: { $convert: { input: '$officeTime.minute', to: 'int' } }
      }
    },
    {
      $match: {
        $expr: {
          $or: [
            {
              $and: [
                { $eq: ['$punchHour', '$startHour'] },
                { $gt: ['$punchMinutes', '$startMinute'] }
              ]
            },
            {
              $and: [{ $gt: ['$punchHour', '$startHour'] }]
            }

            // {
            //   $and: [{ punchHour: { $eq: 4 } }, { PunchMinutes: { $gt: 45 } }]
            // },
            // { $and: [{ punchHour: { $gt: 4 } }] }
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          userId: '$userId',
          user: '$user'
        },
        data: { $push: '$$ROOT' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      attendances: attendances
    }
  });
});

exports.leaveCutForLateAttendace = asyncError(async (req, res, next) => {
  await Attendance.updateMany(
    { _id: { $in: req.body.attendance } },
    { lateArrivalLeaveCut: true }
  );

  const leaveCutUser = await User.findById(req.body.userId);

  const emailContent = await Email.findOne({ module: 'late-attendance' });

  const message = `<b><em>${
    leaveCutUser.name
  }</em> late arival leave cut at ${req.body.leaveCutdate
    .toString()
    .split(',')
    .map((x) => `<p>${x.split('T')[0]}</p>`)
    .join('')}</b>`;

  new EmailNotification().sendEmail({
    email: [INFOWENEMAIL, HRWENEMAIL, leaveCutUser.email],
    subject:
      emailContent.title.replace(/@username/i, leaveCutUser.name) ||
      `late arrival leave cut`,
    message:
      emailContent.body.replace(/@username/i, leaveCutUser.name).replace(
        /@date/i,
        req.body.leaveCutdate
          .toString()
          .split(',')
          .map((x) => `<p>${x.split('T')[0]}</p>`)
          .join('')
      ) || message
  });

  res.status(200).json({
    status: 'success',
    data: 'Successfull !'
  });
});
