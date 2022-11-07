const asyncError = require('../utils/asyncError');

/**
 * check attendace time middleware for user attendance
 */
exports.checkAttendaceTime = asyncError(async (req, res, next) => {
  console.log(req.body);

  const now = new Date();
  next();
});
