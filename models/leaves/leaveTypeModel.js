const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide leave type.'],
    unique: true,
    trim: true
  },
  leaveDays: {
    type: Number
  }
});

const LeaveType = mongoose.model('Leave_Type', leaveTypeSchema);

module.exports = LeaveType;
