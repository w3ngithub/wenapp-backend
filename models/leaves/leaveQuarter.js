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
      },
      leaves: {
        required: true,
        type: Number
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
      },
      leaves: {
        required: true,
        type: Number
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
      },
      leaves: {
        required: true,
        type: Number
      }
    },
    fourthQuarter: {
      fromDate: {
        type: Date,
        required: true
      },
      toDate: {
        type: Date,
        required: true
      },
      leaves: {
        required: true,
        type: Number
      }
    }
  },
  {
    timestamps: true
  }
);

const LeaveQuarter = mongoose.model('Leave_Quarter', leaveSchema);
module.exports = LeaveQuarter;
