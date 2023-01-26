const mongoose = require('mongoose');

const configurationsSchema = new mongoose.Schema(
  {
    isMaintenanceEnabled: {
      type: Boolean,

      default: false
    },
    lateArrivalThreshold: {
      type: Number,
      default: 10
    },
    officeHour: {
      type: Number,
      default: 9
    }
  },
  {
    timestamps: true
  }
);

const Configurations = mongoose.model('Configurations', configurationsSchema);
module.exports = Configurations;
