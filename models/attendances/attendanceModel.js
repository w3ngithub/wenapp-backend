const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    attendanceDate: {
      type: Date,
      default: Date.now()
    },
    punchInTime: {
      type: Date,
      default: Date.now(),
      required: [true, 'Please provide punch in time.']
    },
    punchOutTime: {
      type: Date,
      default: Date.now(),
      required: [true, 'Please provide punch out time.']
    },
    punchInNote: String,
    punchOutNote: String,
    midDayExit: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
