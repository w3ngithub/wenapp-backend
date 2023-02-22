const Notifications = require('../../models/notification/notificationModel');
const APIFeatures = require('../../utils/apiFeatures');
const asyncError = require('../../utils/asyncError');

exports.getAllNotifications = asyncError(async (req, res, next) => {
  const { role, userId, joinDate } = req.query;

  const features = new APIFeatures(
    Notifications.find({
      showTo: {
        $in: [role, userId]
      },
      createdAt: { $gte: joinDate }
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .search();

  const [doc, count] = await Promise.all([
    features.query,
    Notifications.countDocuments({
      ...features.formattedQuery,
      showTo: {
        $in: [role, userId]
      },
      createdAt: { $gte: joinDate }
    })
  ]);
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc,
      count
    }
  });
});

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
