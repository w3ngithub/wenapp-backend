const Notifications = require('../../models/notification/notificationModel');
const Leave = require('../../models/leaves/leaveModel');
const NoticeType = require('../../models/notices/noticeTypeModel');

const registerNotificationHandlers = (io, socket) => {
  // gets total count of not viewed notification of individual user
  socket.on('get-notification-count', async ({ _id, key, joinDate }) => {
    const notViewNotification = await Notifications.find({
      showTo: {
        $in: [_id, key]
      },
      viewedBy: {
        $nin: [_id]
      },
      createdAt: { $gte: joinDate }
    }).count();

    socket.emit('send-notViewed-notification-count', notViewNotification);
  });

  // updates viewed notifications of individual user
  socket.on('viewed-notification', async ({ _id, key }) => {
    await Notifications.updateMany(
      {
        showTo: {
          $in: [_id, key]
        },
        viewedBy: {
          $nin: [_id]
        }
      },
      { $push: { viewedBy: _id } }
    );
  });

  socket.on('invite-user', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification', bellNotification);
  });

  socket.on('disable-user', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification', bellNotification);
  });

  socket.on('signup-user', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification', bellNotification);
  });

  socket.on('late-attendance', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification-for-user', bellNotification);
  });

  socket.on('approve-leave', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification-for-user', bellNotification);
  });

  socket.on('cancel-leave', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification-for-user', bellNotification);
  });

  socket.on('apply-leave', async (response) => {
    const bellNotificationUser = await Notifications.create(response);

    const pendingLeaves = await Leave.find({
      leaveStatus: { $eq: 'pending' }
    }).count();

    const bellNotification = await Notifications.create({
      showTo: ['admin', 'hr'],
      remarks: `You have ${pendingLeaves} pending leave request. Please review.`,
      module: 'Leave'
    });

    io.sockets.emit('bell-notification', bellNotificationUser);
    io.sockets.emit('bell-notification', bellNotification);
  });

  socket.on('add-blog', async (response) => {
    const bellNotification = await Notifications.create(response);
    io.sockets.emit('bell-notification', bellNotification);
  });

  socket.on('add-notice', async (response) => {
    const noticeType = await NoticeType.findOne({ _id: response.noticeTypeId });

    const bellNotification = await Notifications.create({
      showTo: response.showTo,
      module: response.module,
      remarks: `You have new ${noticeType.name}.`
    });

    io.sockets.emit('bell-notification', bellNotification);
  });
};

module.exports = { registerNotificationHandlers };
