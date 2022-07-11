const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide notice title.'],
      unique: true,
      trim: true
    },
    details: {
      type: String,
      trim: true,
      required: [true, 'Please provide notice detail.'],
      minlength: [10, 'Details must have more or equal than 50 characters']
    },
    noticeType: {
      type: mongoose.Schema.ObjectId,
      ref: 'Notice_Type'
    },
    createdBy: String,
    updatedBy: String
  },
  {
    timestamps: true
  }
);

noticeSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'noticeType',
    select: 'name'
  });
  next();
});

const Notice = mongoose.model('Notice', noticeSchema);
module.exports = Notice;
