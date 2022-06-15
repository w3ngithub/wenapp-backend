const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { userPosition, userRoles } = require('../utils/constant');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not same!'
      }
    },
    role: {
      type: String,
      default: 'normal'
    },
    position: {
      type: String,
      default: 'OT'
    },
    active: {
      type: Boolean,
      default: true
    },
    dob: {
      type: Date,
      required: [true, 'Please provide your date of birth.']
    },
    gender: {
      type: String,
      default: 'Male'
    },
    primaryPhone: {
      type: Number,
      required: [true, 'Please provide your primary phone number.']
    },
    secondaryPhone: Number,
    joinDate: {
      type: Date,
      required: [true, 'Please provide your join date.']
    },
    maritalStatus: {
      type: String,
      default: 'Unmarried'
    },
    lastReviewDate: Date,
    exitDate: Date,
    panNumber: Number,
    citNumber: Number,
    bankName: String,
    bankAccNumber: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Return user role value in response object as virtual field
userSchema.virtual('roleValue').get(function () {
  return userRoles[this.role];
});

// Return user position value in response object as virtual field
userSchema.virtual('positionValue').get(function () {
  return userPosition[this.position];
});

// Document Middleware
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Query Middleware : Select active users only
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Check user password with saved db password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Save password changed date on db
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Check if user is trying to change password after expiration
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Password reset token for user
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
