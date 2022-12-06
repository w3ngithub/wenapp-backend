const Notifications = require('../../models/notification/notificationModel');
const Leave = require('../../models/leaves/leaveModel');
const NoticeType = require('../../models/notices/noticeTypeModel');

const registerNotificationHandlers = (io, socket) => {
  socket.on('invite-user', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification', bellNotification);
  });

  socket.on('disable-user', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification', bellNotification);
  });

  socket.on('signup-user', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification', bellNotification);
  });

  socket.on('late-attendance', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification-for-user', bellNotification);
  });

  socket.on('approve-leave', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification-for-user', bellNotification);
  });

  socket.on('cancel-leave', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification-for-user', bellNotification);
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

    socket.emit('bell-notification', bellNotificationUser);
    socket.emit('bell-notification', bellNotification);
  });

  socket.on('add-blog', async (response) => {
    const bellNotification = await Notifications.create(response);
    socket.emit('bell-notification', bellNotification);
  });

  socket.on('add-notice', async (response) => {
    const noticeType = await NoticeType.findOne({ _id: response.noticeTypeId });

    const bellNotification = await Notifications.create({
      showTo: response.showTo,
      module: response.module,
      remarks: `You have new ${noticeType.name}.`
    });

    socket.emit('bell-notification', bellNotification);
  });
};

module.exports = { registerNotificationHandlers };
