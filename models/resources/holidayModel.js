const mongoose = require('mongoose');

const holidaysSchema = new mongoose.Schema(
  {
    holidays: {
      type: [
        {
          title: {
            type: String,
            required: [true, 'Please provide holiday title.'],
            trim: true
          },
          date: {
            type: Date,
            required: [true, 'Please provide holiday date.']
          },
          remarks: String
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

const Holiday = mongoose.model('Holiday', holidaysSchema);

module.exports = Holiday;
