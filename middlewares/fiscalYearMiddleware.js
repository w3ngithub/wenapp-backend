const asyncError = require('../utils/asyncError');
const LeaveQuarter = require('../models/leaves/leaveQuarter');

/**
 * Get current fiscal Year start and end date
 */
exports.getFiscalYear = asyncError(async (req, res, next) => {
  const latestYearQuarter = await LeaveQuarter.findOne().sort({
    createdAt: -1
  });

  req.fiscalYear = {
    currentFiscalYearStartDate: new Date(
      latestYearQuarter.firstQuarter.fromDate
    ),
    currentFiscalYearEndDate: new Date(latestYearQuarter.fourthQuarter.toDate)
  };

  next();
});
