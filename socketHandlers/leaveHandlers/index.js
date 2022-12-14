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

    const leaves = await Leave.aggregate([
      {
        $match: {
          leaveStatus: 'approved',
          $or: [
            {
              'leaveDates.0': { $eq: todayDate }
            },
            {
              'leaveDates.0': { $lte: todayDate },
              'leaveDates.1': { $gte: todayDate }
            }
          ]
        }
      },
      {
        $count: 'count'
      }
    ]);

    const pendingLeaveCount = await Leave.find({
      leaveStatus: { $eq: 'pending' }
    }).count();

    io.sockets.emit('today-leave-count', leaves[0].count, pendingLeaveCount);
  });
};

module.exports = { registerLeaveHandlers };
