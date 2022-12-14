const asyncError = require('../utils/asyncError');
const AppError = require('../utils/appError');
const Configurations = require('../models/configurations/configurationsModel');

/**
 * check if maintenance mode is on
 */
exports.checkMaintenanceMode = asyncError(async (req, res, next) => {
  const configs = await Configurations.find();
  if (configs[0] && configs[0].isMaintenanceEnabled) {
    return next(
      new AppError('service unavailable!  please try again later', 503)
    );
  }

  next();
});
