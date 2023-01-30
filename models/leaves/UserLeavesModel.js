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
        causalLeaves: {
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
        type: mongoose.Schemas.ObjectId,
        ref: 'Leave_Quarter.quarters',
        required: true
      }
    }
  ]
});

const UserLeave = mongoose.model('User_Leave', UserLeaveSchema);

module.exports = UserLeave;