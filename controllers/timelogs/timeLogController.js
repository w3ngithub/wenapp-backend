const TimeLog = require('../../models/timelogs/timeLogModel');
const factory = require('../factoryController');

exports.setProjectUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.project) req.body.project = req.params.projectId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getTimeLog = factory.getOne(TimeLog);
exports.getAllTimeLogs = factory.getAll(TimeLog);
exports.createTimeLog = factory.createOne(TimeLog);
exports.updateTimeLog = factory.updateOne(TimeLog);
exports.deleteTimeLog = factory.deleteOne(TimeLog);
