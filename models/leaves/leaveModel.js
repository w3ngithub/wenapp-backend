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
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending'
    },
    assignTo: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    reason: {
      type: String,
      trim: true,
      required: [true, 'Please provide leave reason.'],
      minlength: [10, 'Leave Reason must have more or equal then 50 characters']
    },
    cancelReason:{
      type:String,
      trim:true,
      required:false,
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
    path: 'user assignTo',
    select: '-role -position name'
  }).populate({
    path: 'leaveType',
    select: 'name'
  });
  next();
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
