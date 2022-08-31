const asyncError = require('../utils/asyncError');

/**
 * Get current fiscal Year start and end date
 */
exports.getWeekDate = asyncError(async (req, res, next) => {
  const today = new Date();
  const afterOneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  req.todayDate = today;
  req.afterOneWeekDate = afterOneWeek;

  next();
});
