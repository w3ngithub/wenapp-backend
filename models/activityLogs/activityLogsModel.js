const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    activity: {
      type: String
    },
    status: { type: String, enum: ['created', 'updated', 'deleted'] },
    module: String
  },
  {
    timestamps: true
  }
);

const ActivityLogs = mongoose.model('Activity_Log', activityLogSchema);
module.exports = ActivityLogs;
