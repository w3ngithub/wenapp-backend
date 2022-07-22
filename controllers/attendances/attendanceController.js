const mongoose = require('mongoose');

const Attendance = require('../../models/attendances/attendanceModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');
const asyncError = require('../../utils/asyncError');
const APIFeatures = require('../../utils/apiFeatures');

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
    updatedBy: req.user.id
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
  const { fromDate, toDate, user } = req.query;

  const matchConditions = [
    { attendanceDate: { $gte: new Date(fromDate) } },
    { attendanceDate: { $lte: new Date(toDate) } }
  ];

  if (user) {
    matchConditions.push({
      user: mongoose.Types.ObjectId(user)
    });
  }

  const features = new APIFeatures(
    Attendance.find({ $and: matchConditions }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const attendances = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      attendances
    }
  });
});
