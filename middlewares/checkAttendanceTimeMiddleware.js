const asyncError = require('../utils/asyncError');
const AppError = require('../utils/appError');

/**
 * check attendace time middleware for user attendance
 */
exports.checkAttendaceTime = asyncError(async (req, res, next) => {
  const now = new Date();

  if (req.body.user) {
    next();
    return;
  }

  if (req.body.punchInTime) {
    const punchInTime = new Date(req.body.punchInTime);
    if (
      !(
        punchInTime > new Date(new Date(now.getTime() - 1000 * 60 * 2)) &&
        punchInTime < new Date(new Date().getTime() + 1000 * 60 * 2)
      )
    )
      return next(new AppError('Please Enter Current Time To Punch In', 403));
  }

  if (req.body.punchOutTime) {
    const punchOutTime = new Date(req.body.punchOutTime);
    if (
      !(
        punchOutTime > new Date(new Date(now.getTime() - 1000 * 60 * 2)) &&
        punchOutTime < new Date(new Date().getTime() + 1000 * 60 * 2)
      )
    )
      return next(new AppError('Please Enter Current Time To Punch Out', 403));
  }

  next();
});

exports.setIpForAttendance = asyncError(async (req, res, next) => {
  req.body.punchInIp =
    req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  next();
});
