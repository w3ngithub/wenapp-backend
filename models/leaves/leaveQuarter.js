const mongoose = require('mongoose');
const common = require('../../utils/common');

const quarterSchema = new mongoose.Schema({
  quarterName: String,
  fromDate: Date,
  toDate: Date,
  leaves: Number
});

const leaveQuarterSchema = new mongoose.Schema({
  fiscalYear: {
    type: Date,
    required: true,
    default: common.todayDate()
  },
  quarters: [quarterSchema]
});

const LeaveQuarter = mongoose.model('Leave_Quarter', leaveQuarterSchema);

module.exports = LeaveQuarter;
