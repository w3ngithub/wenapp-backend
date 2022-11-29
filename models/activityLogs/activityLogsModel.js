const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    activity: {
      type: String
    },
    status: { type: String, enum: ['created', 'updated', 'deleted'] },
    module: String,
    user: {
      name: String,
      photo: { type: String, default: null }
    },
    viewedBy: {
      type: [String],
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

const ActivityLogs = mongoose.model('Activity_Log', activityLogSchema);
module.exports = ActivityLogs;
