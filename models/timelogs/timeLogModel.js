const mongoose = require('mongoose');
const Project = require('../projects/projectModel');

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
      required: [true, 'Please provide date.']
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
    totalHours: {
      type: Number,
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

// Calculate total time for each time log
timeLogSchema.pre('save', function (next) {
  this.totalHours = this.hours + this.minutes / 60;
  next();
});

// Populate required data
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

// Return start and end of week date as object
const dateInThisWeek = () => {
  const todayObj = new Date();
  const todayDate = todayObj.getDate();
  const todayDay = todayObj.getDay();

  // get first date of week
  const firstDayOfWeek = new Date(todayObj.setDate(todayDate - todayDay));

  // get last date of week
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 5);

  return {
    firstDayOfWeek,
    lastDayOfWeek
  };
};

// Static method to calculate total time spent for the project
timeLogSchema.statics.calcTotalTimeSpentOnProject = async function (projectId) {
  const totalProjectTime = await this.aggregate([
    {
      $match: { project: projectId }
    },
    {
      $group: {
        _id: '$project',
        timeSpent: { $sum: '$totalHours' }
      }
    }
  ]);

  if (totalProjectTime.length > 0) {
    await Project.findByIdAndUpdate(projectId, {
      totalTimeSpent: totalProjectTime[0].timeSpent
    });
  } else {
    await Project.findByIdAndUpdate(projectId, {
      totalTimeSpent: 0
    });
  }
};

// Static method to calculate total time spent for the project
timeLogSchema.statics.calcWeeklyTimeSpentOnProject = async function (
  projectId
) {
  const { firstDayOfWeek, lastDayOfWeek } = dateInThisWeek();

  const weeklyProjectTime = await this.aggregate([
    {
      $match: {
        project: projectId,
        $and: [
          { logDate: { $gte: firstDayOfWeek } },
          { logDate: { $lte: lastDayOfWeek } }
        ]
      }
    },
    {
      $group: {
        _id: '$project',
        timeSpent: { $sum: '$totalHours' }
      }
    }
  ]);

  if (weeklyProjectTime.length > 0) {
    await Project.findByIdAndUpdate(projectId, {
      weeklyTimeSpent: weeklyProjectTime[0].timeSpent
    });
  } else {
    await Project.findByIdAndUpdate(projectId, {
      weeklyTimeSpent: 0
    });
  }
};

// Call static methods to calculate the time log after saved in db
timeLogSchema.post('save', function () {
  // this points to current timelog
  this.constructor.calcTotalTimeSpentOnProject(this.project);
  this.constructor.calcWeeklyTimeSpentOnProject(this.project);
});

const TimeLog = mongoose.model('TimeLog', timeLogSchema);
module.exports = TimeLog;
