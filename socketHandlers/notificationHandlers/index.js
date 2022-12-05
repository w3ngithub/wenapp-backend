const Notifications = require('../../models/notification/notificationModel');

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
};

module.exports = { registerNotificationHandlers };
