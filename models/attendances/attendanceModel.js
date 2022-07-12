const mongoose = require('mongoose');
const common = require('../../utils/common');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    attendanceDate: {
      type: Date,
      default: common.todayDate()
    },
    punchInTime: {
      type: Date,
      default: Date.now(),
      required: [true, 'Please provide punch in time.']
    },
    punchOutTime: Date,
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