const asyncError = require('../utils/asyncError');

const Holiday = require('../models/holidays/holidayModel');

// const AppError = require('../utils/appError');

/**
 * Get current fiscal Year start and end date
 */
exports.getFiscalYear = asyncError(async (req, res, next) => {
  const currentFullYear = new Date().getFullYear();

  let currentFiscalYearStartDate = new Date(`${currentFullYear}-07-15`);
  let currentFiscalYearEndDate = new Date(`${currentFullYear + 1}-07-14`);

  // check if fiscal year start date and end date lies in weekends
  if (new Date(currentFiscalYearStartDate).getDay() === 6) {
    const updatedStartDate = new Date(currentFiscalYearStartDate);
    currentFiscalYearStartDate = updatedStartDate.setDate(
      updatedStartDate.getDate() + 2
    );
  }

  if (new Date(currentFiscalYearStartDate).getDay() === 0) {
    const updatedStartDate = new Date(currentFiscalYearStartDate);
    currentFiscalYearStartDate = updatedStartDate.setDate(
      updatedStartDate.getDate() + 1
    );
  }

  if (new Date(currentFiscalYearEndDate).getDay() === 6) {
    const updatedEndDate = new Date(currentFiscalYearEndDate);
    currentFiscalYearEndDate = updatedEndDate.setDate(
      updatedEndDate.getDate() - 1
    );
  }

  if (new Date(currentFiscalYearEndDate).getDay() === 0) {
    const updatedEndDate = new Date(currentFiscalYearEndDate);
    currentFiscalYearEndDate = updatedEndDate.setDate(
      updatedEndDate.getDate() - 2
    );
  }

  // get latest fiscal year holiday
  const latestHolidayYear = await Holiday.findOne().sort({ createdAt: -1 });

  const holidaysList = latestHolidayYear.holidays.map((holiday) =>
    holiday.date.toString()
  );

  // check if fiscal year start date and end date lies in holidays
  if (holidaysList.includes(new Date(currentFiscalYearStartDate).toString())) {
    currentFiscalYearStartDate = new Date(currentFiscalYearStartDate).setDate(
      new Date(currentFiscalYearStartDate).getDate() + 1
    );
  }

  if (holidaysList.includes(new Date(currentFiscalYearEndDate).toString())) {
    currentFiscalYearEndDate = new Date(currentFiscalYearEndDate).setDate(
      new Date(currentFiscalYearEndDate).getDate() - 1
    );
  }

  req.fiscalYear = {
    currentFiscalYearStartDate: new Date(currentFiscalYearStartDate),
    currentFiscalYearEndDate: new Date(currentFiscalYearEndDate)
  };

  console.log(req.fiscalYear);

  next();
});
