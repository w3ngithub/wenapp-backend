const mongoose = require('mongoose');

const userDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User detail must belong to a user']
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    dob: Date,
    gender: {
      type: String,
      default: 'Male'
    },
    primaryPhone: {
      type: Number,
      required: [true, 'Please provide your phone number']
    },
    secondaryPhone: Number,
    joinedDate: Date,
    maritalStatus: {
      type: String,
      default: 'Unmarried'
    },
    lastReviewDate: Date,
    exitDate: Date,
    panNumber: Number,
    citNumber: Number,
    bankName: String,
    bankAccNumber: String
  },
  {
    timestamps: true
  }
);

const UserDetail = mongoose.model('UserDetail', userDetailSchema);

module.exports = UserDetail;
