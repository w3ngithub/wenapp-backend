const asyncError = require('../utils/asyncError');
const AppError = require('../utils/appError');

/**
 * check if maintenance mode is on
 */
exports.checkMaintenanceMode = asyncError(async (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'M') {
    return next(
      new AppError('service unavailable!  please try again later', 503)
    );
  }

  next();
});
