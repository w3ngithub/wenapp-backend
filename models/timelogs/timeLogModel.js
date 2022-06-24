const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    logType: {
      type: mongoose.Schema.ObjectId,
      ref: 'TimeLog_Type',
      required: [true, 'Please provide log type.']
    },
    logDate: {
      type: Date,
      required: [true, 'Please provide date.'],
      default: Date.now()
    },
    hours: {
      type: Number,
      required: [true, 'Please provide hours.'],
      default: 0
    },
    minutes: {
      type: Number,
      required: [true, 'Please provide minutes.'],
      default: 0
    },
    remarks: {
      type: String,
      trim: true,
      required: [true, 'Please provide remarks.'],
      minlength: [10, 'Remarks must have more or equal then 50 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

timeLogSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-role -position name'
  })
    .populate({
      path: 'project',
      select:
        '-projectTypes -projectStatus -projectTags -client -developers -designers -qa -devOps name'
    })
    .populate({
      path: 'logType',
      select: 'name'
    });
  next();
});

const TimeLog = mongoose.model('TimeLog', timeLogSchema);
module.exports = TimeLog;
