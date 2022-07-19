const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    holidays: [
      {
        title: {
          type: String,
          required: [true, 'Please provide holiday title.'],
          unique: true,
          trim: true
        },
        date: {
          type: Date,
          required: [true, 'Please provide holiday date.']
        },
        remarks: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Holiday = mongoose.model('Holiday', holidaySchema);
module.exports = Holiday;
