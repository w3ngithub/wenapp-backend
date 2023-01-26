const mongoose = require('mongoose');

const UserLeaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user for user leave.']
  },
  fiscalYear: {
    type: Date,
    required: true
  },
  leaves: [
    {
      allocatedLeaves: {
        type: Number,
        default: 0
      },
      remainingLeaves: {
        type: Number,
        default: 0
      },
      approvedLeaves: {
        sickLeaves: {
          type: Number,
          default: 0
        },
        casualLeaves: {
          type: Number,
          default: 0
        }
      },
      carriedOverLeaves: {
        type: Number,
        default: 0
      },
      leaveDeductionBalance: {
        type: Number,
        default: 0
      },
      quarter: {
        type: mongoose.Schema.ObjectId,
        ref: 'Leave_Quarter.quarters',
        required: true
      }
    }
  ]
});

UserLeaveSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user leaves.quarter',
    select: ''
  })
  next();
});

const UserLeave = mongoose.model('User_Leave', UserLeaveSchema);

module.exports = UserLeave;
