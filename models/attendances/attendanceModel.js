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
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user createdBy updatedBy',
    select: '-role -position name'
  });
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
