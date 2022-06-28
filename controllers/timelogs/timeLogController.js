const TimeLog = require('../../models/timelogs/timeLogModel');
const factory = require('../factoryController');
const AppError = require('../../utils/appError');

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
