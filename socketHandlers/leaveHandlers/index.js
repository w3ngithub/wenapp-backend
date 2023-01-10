const Leave = require('../../models/leaves/leaveModel');
const common = require('../../utils/common');

const registerLeaveHandlers = (io, socket) => {
  socket.on('dashboard-pending', async () => {
    const pendingLeaveCount = await Leave.find({
      leaveStatus: { $eq: 'pending' }
    }).count();

    io.sockets.emit('pending-leave-count', pendingLeaveCount);
  });

  socket.on('dashboard-leave', async () => {
    const todayDate = common.todayDate();

    const leaves = await Leave.find({
      leaveStatus: 'approved',
      leaveDates: {
        $elemMatch: {
          $eq: todayDate
        }
      }
    }).count();

    const pendingLeaveCount = await Leave.find({
      leaveStatus: { $eq: 'pending' }
    }).count();

    io.sockets.emit('today-leave-count', leaves, pendingLeaveCount);
  });
};

module.exports = { registerLeaveHandlers };
