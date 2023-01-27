const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user for leave.']
    },
    halfDay: {
      type: String,
      default: ''
    },
    leaveType: {
      type: mongoose.Schema.ObjectId,
      ref: 'Leave_Type',
      required: [true, 'Please provide leave type.']
    },
    leaveDates: [Date],
    leaveStatus: {
      type: String,
      enum: ['pending', 'approved', 'cancelled', 'rejected', 'user cancelled'],
      default: 'pending'
    },
    reason: {
      type: String,
      trim: true,
      required: [true, 'Please provide leave reason.'],
      minlength: [10, 'Leave Reason must have more or equal then 50 characters']
    },
    cancelReason: {
      type: String,
      trim: true,
      required: false
    },
    rejectReason: {
      type: String,
      trim: true,
      required: false
    },
    reapplyreason: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Populate required data
leaveSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-role -position name email'
  }).populate({
    path: 'leaveType',
    select: 'name'
  });
  next();
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
