const asyncError = require('../utils/asyncError');
const LeaveTypes = require('../models/leaves/leaveTypeModel');
const { LEAVETYPES } = require('../utils/constants');

/**
 * Get Sick and Causal Leave Type Id
 */
exports.getSickCasualLeave = asyncError(async (req, res, next) => {
  const LeaveType = await LeaveTypes.find();

  const leaves = LeaveType.filter(
    (type) =>
      type.name.toLowerCase() === LEAVETYPES.sickLeave.toLowerCase() ||
      type.name.toLowerCase() === LEAVETYPES.casualLeave.toLowerCase()
  );

  req.leaveTypes = leaves;

  next();
});
