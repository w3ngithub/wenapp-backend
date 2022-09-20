const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    firstQuarter: {
      fromDate: {
        type: Date,
        required: true
      },
      toDate: {
        type: Date,
        required: true
      }
    },
    secondQuarter: {
      fromDate: {
        type: Date,
        required: true
      },
      toDate: {
        type: Date,
        required: true
      }
    },
    thirdQuarter: {
      fromDate: {
        type: Date,
        required: true
      },
      toDate: {
        type: Date,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

const LeaveQuarter = mongoose.model('Leave_Quarter', leaveSchema);
module.exports = LeaveQuarter;
