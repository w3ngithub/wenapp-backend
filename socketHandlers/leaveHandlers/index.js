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

    let leaves = await Leave.aggregate([
      {
        $match: {
          leaveStatus: 'approved',
          $or: [
            {
              leaveDates: {
                $elemMatch: {
                  $eq: todayDate
                }
              }
            },
            {
              'leaveDates.0': {
                $lte: todayDate
              },
              'leaveDates.1': {
                $gte: todayDate
              }
            }
          ]
        }
      },
      {
        $count: 'count'
      }
    ]);

    if (leaves.length === 0) {
      leaves = 0;
    } else {
      leaves = leaves[0].count;
    }

    const pendingLeaveCount = await Leave.find({
      leaveStatus: { $eq: 'pending' }
    }).count();

    io.sockets.emit('today-leave-count', leaves, pendingLeaveCount);
  });
};

module.exports = { registerLeaveHandlers };
