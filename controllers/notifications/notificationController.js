const Notifications = require('../../models/notification/notificationModel');
const APIFeatures = require('../../utils/apiFeatures');
const asyncError = require('../../utils/asyncError');
const Holidays = require('../../models/resources/holidayModel');
const { yesterdayDate, todayDate } = require('../../utils/common');
const Attendance = require('../../models/attendances/attendanceModel');
const User = require('../../models/users/userModel');
const Leave = require('../../models/leaves/leaveModel');

exports.getAllNotifications = asyncError(async (req, res, next) => {
  const { role, userId } = req.query;

  const features = new APIFeatures(
    Notifications.find({
      showTo: {
        $in: [role, userId]
      }
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
      }
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

exports.notifyToApplyLeave = asyncError(async (req, res, next) => {
  const holidays = await Holidays.findOne().sort({ createdAt: -1 }).limit(1);

  const holidayList = holidays.holidays.map(
    (holiday) => holiday.date.toISOString().split('T')[0]
  );

  // check if yesterday was not weekend and holiday
  if (
    ![0, 6].includes(yesterdayDate().getDay()) &&
    !holidayList.includes(yesterdayDate().toISOString().split('T')[0])
  ) {
    const attendance = await Attendance.aggregate([
      {
        $match: {
          $and: [{ attendanceDate: { $eq: yesterdayDate() } }]
        }
      }
    ]);

    const userWithAttendance = attendance.map((att) => att.user.toString());

    const Users = await User.find({ active: { $ne: false } });

    // filter users with no yesterday's punch
    const yesterdayNoPunchUser = Users.filter(
      (user) => !userWithAttendance.includes(user._id.toString())
    );

    const yesterdayPunchUser = Users.filter((user) =>
      userWithAttendance.includes(user._id.toString())
    );

    yesterdayNoPunchUser.forEach(async (user) => {
      const leave = await Leave.find({
        user: user._id,
        leaveDates: {
          $elemMatch: {
            $eq: yesterdayDate()
          }
        }
      });

      const todayAttendance = await Attendance.find({
        user: user._id,
        attendanceDate: todayDate()
      });

      // send notification if yesterday not leaves taken and punched in today
      if (
        leave &&
        leave.length === 0 &&
        todayAttendance &&
        todayAttendance.length !== 0
      ) {
        await Notifications.create({
          showTo: user._id,
          module: 'Leave',
          remarks: `You have not applied for Leave. Please apply !`
        });
      }
    });

    yesterdayPunchUser.forEach(async (user) => {
      const yesterdayAttendance = await Attendance.find({
        user: user._id,
        attendanceDate: yesterdayDate()
      }).sort({ punchInTime: -1 });

      const totalOfficeHour =
        yesterdayAttendance
          .filter((att) => att.punchOutTime)
          .map(
            (att) =>
              new Date(att.punchOutTime).getTime() -
              new Date(att.punchInTime).getTime()
          )
          .reduce((officeHour, hour) => officeHour + hour, 0) /
        (1000 * 3600);

      // send notification if  and punched in today
      if (totalOfficeHour && totalOfficeHour < 4.5) {
        await Notifications.create({
          showTo: user._id,
          module: 'Leave',
          remarks: `You have not applied for Leave. Please apply !`
        });
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: 'success'
    }
  });
});
