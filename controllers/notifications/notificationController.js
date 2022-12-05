const Notifications = require('../../models/notification/notificationModel');
const APIFeatures = require('../../utils/apiFeatures');
const asyncError = require('../../utils/asyncError');
const factory = require('../factoryController');

exports.getAllNotifications = asyncError(async (req, res, next) => {
  const { fromDate, toDate } = req.query;

  const features = new APIFeatures(Notifications.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .search();
  if (fromDate && toDate) {
    const doc = await features.query.find({
      createdAt: { $gte: fromDate, $lte: toDate }
    });
    const count = await Notifications.countDocuments({
      ...features.formattedQuery,
      createdAt: { $gt: fromDate, $lt: toDate }
    });

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
        count
      }
    });
  } else {
    const [doc, count] = await Promise.all([
      features.query,
      Notifications.countDocuments(features.formattedQuery)
    ]);
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
        count
      }
    });
  }
});

exports.createNotification = factory.createOne(Notifications);

exports.deleteNotification = asyncError(async (req, res, next) => {
  await Notifications.deleteMany({
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

exports.updateNotification = asyncError(async (req, res, next) => {
  const updatedActivities = await Notifications.updateMany(
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
