const mongoose = require('mongoose');
const { todayDate } = require('../../utils/common');
const {
  LEAVETYPES: leaveType,
  LEAVE_APPROVED
} = require('../../utils/constants');
const { LeaveQuarter } = require('./leaveQuarter');
const LeaveType = require('./leaveTypeModel');
const UserLeave = require('./UserLeavesModel');

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
    },
    leaveDocument: {
      type: String
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
    select: 'name isSpecial'
  });
  next();
});

leaveSchema.pre('save', async function (next) {
  const leaves = await this.constructor.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(this.user),
        leaveStatus: { $in: ['approved', 'pending'] }
      }
    },
    {
      $unwind: '$leaveDates'
    },
    {
      $match: {
        leaveDates: { $in: this.leaveDates }
      }
    }
  ]);
  if (leaves && leaves.length === 0) {
    next();
    return;
  }

  const err = new Error(
    `Leave has been already applied for ${
      leaves[0].leaveDates.toISOString().split('T')[0]
    }`
  );

  next(err);
});

// update userLeave Document of user with approve status
leaveSchema.post('save', async (doc) => {
  // update when applied leave is directed applied fom apply section and role is hr/admin
  if (doc.createdAt === doc.updatedAt) {
    const leaveTypeDoc = await LeaveType.findById(doc.leaveType);

    // update only if applied leave is sick or casual leave and status is approved
    if (
      [leaveType.casualLeave, leaveType.sickLeave].includes(
        leaveTypeDoc.name
      ) &&
      doc.leaveStatus === LEAVE_APPROVED
    ) {
      const latestYearQuarter = await LeaveQuarter.findOne().sort({
        createdAt: -1
      });

      const userLeave = await UserLeave.findOne({
        fiscalYear: latestYearQuarter.fiscalYear,
        user: doc.user
      });

      let userLeaveToUpdate = [...userLeave.leaves];

      doc.leaveDates.forEach(async (leave) => {
        const leaveTakenQuarter = latestYearQuarter.quarters.find(
          (quarter) =>
            new Date(quarter.fromDate) <= new Date(leave) &&
            new Date(leave) <= new Date(quarter.toDate)
        );

        const updateLeave = userLeaveToUpdate.map((x) =>
          x.quarter._id.toString() === leaveTakenQuarter._id.toString()
            ? {
                ...JSON.parse(JSON.stringify(x)),
                approvedLeaves: {
                  sickLeaves:
                    leaveType.sickLeave === leaveTypeDoc.name
                      ? x.approvedLeaves.sickLeaves + 1
                      : x.approvedLeaves.sickLeaves,
                  casualLeaves:
                    leaveType.casualLeave === leaveTypeDoc.name
                      ? x.approvedLeaves.casualLeaves + 1
                      : x.approvedLeaves.casualLeaves
                },
                remainingLeaves: x.remainingLeaves - 1
              }
            : x
        );

        userLeaveToUpdate = [...updateLeave];
      });
      userLeave.leaves = userLeaveToUpdate;
      await userLeave.save();
    }
  }
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
