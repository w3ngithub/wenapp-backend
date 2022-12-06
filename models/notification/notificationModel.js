const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    remarks: { type: String },
    module: {
      type: String
    },
    showTo: {
      type: [String]
    },
    viewedBy: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Notifications = mongoose.model('Notifications', notificationSchema);
module.exports = Notifications;
