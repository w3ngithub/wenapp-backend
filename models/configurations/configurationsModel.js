const mongoose = require('mongoose');

const configurationsSchema = new mongoose.Schema(
  {
    isMaintenanceEnabled: {
      type: Boolean,

      default: false
    }
  },
  {
    timestamps: true
  }
);

const Configurations = mongoose.model('Configurations', configurationsSchema);
module.exports = Configurations;
