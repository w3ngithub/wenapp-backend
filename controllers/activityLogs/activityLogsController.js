const ActivityLogs = require('../../models/activityLogs/activityLogsModel');
const asyncError = require('../../utils/asyncError');
const factory = require('../factoryController');

exports.getActivityLog = factory.getOne(ActivityLogs);
exports.getAllActivityLogs = factory.getAll(ActivityLogs);
exports.createActivityLog = factory.createOne(ActivityLogs);
// exports.updateActivityLog = factory.updateOne(ActivityLogs);

exports.deleteActivityLog = asyncError(async (req, res, next) => {
  await ActivityLogs.deleteMany({
    createdAt: {
      $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: 'Sucessfully deleted Activity Logs '
    }
  });
});

exports.updateActivityLog = asyncError(async (req, res, next) => {
  const updatedActivities = await ActivityLogs.updateMany(
    { _id: { $in: req.body.activities } },
    { $push: { viewedBy: req.body.user } },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      data: updatedActivities
    }
  });
});
