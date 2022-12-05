const Notifications = require('../../models/notification/notificationModel');

const registerNotificationHandlers = (io, socket) => {
  socket.on('initial-notification', (response) => {
    console.log('inital notification', response);
    io.emit('notification', 'hello');
  });

  socket.on('invite-user', async (response) => {
    console.log(response);
    await Notifications.create(response);
  });
};

module.exports = { registerNotificationHandlers };
