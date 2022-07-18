const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    year: { type: Date, required: true },
    holidays: [
      {
        date: {
          type: Date,
          required: true
        },
        event: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const holidayModel = mongoose.model('holiday', holidaySchema);

module.exports = holidayModel;
