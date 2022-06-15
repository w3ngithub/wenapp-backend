const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const asyncError = require('../utils/asyncError');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Invite = require('../models/inviteModel');
const sendEmail = require('../utils/email');

// Create sign-in token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

// Hash token for user invite and password reset token
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Create and send response for sign-in
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * Send invitation link for user to signup and complete profile
 */
exports.inviteUser = asyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await Invite.create({
    email: req.body.email
  });

  // Generate the random invite token
  const token = user.createInviteToken();
  await user.save({ validateBeforeSave: false });

  const inviteURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/signup/${token}`;

  const message = `Please signup and complete your profile by clicking the provided link : ${inviteURL}`;
  // Send it to user's email
  try {
    await sendEmail({
      email,
      subject: 'Your sign up link (valid for 60 mins) ',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Invitation for sign up sent to email!'
    });
  } catch (err) {
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    user.inviteTokenUsed = false;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

/**
 * Save user in db
 * Create jwt sign-in token
 * Finally send created user in api response
 */
exports.signup = asyncError(async (req, res, next) => {
  const hashedToken = hashToken(req.params.token);

  const { email } = req.body;

  const invitedUser = await Invite.findOne({
    email,
    inviteTokenExpires: { $gt: Date.now() },
    inviteTokenUsed: false
  });

  if (!invitedUser || invitedUser.inviteToken !== hashedToken) {
    return next(new AppError('Your sign up token has expired.', 400));
  }

  const newUser = await User.create({
    name: req.body.name,
    email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    position: req.body.position,
    photo: req.body.photo,
    dob: req.body.dob,
    gender: req.body.gender,
    primaryPhone: req.body.primaryPhone,
    secondaryPhone: req.body.secondaryPhone,
    maritalStatus: req.body.maritalStatus,
    joinDate: req.body.joinDate
  });

  if (newUser) {
    await Invite.findByIdAndUpdate(invitedUser._id, { inviteTokenUsed: true });
  }
  createSendToken(newUser, 201, req, res);
});

/**
 * Check user login
 * Create jwt sign-in token
 * Finally send logged in user with token in api response
 */
exports.login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

/**
 * Check user based on email
 * Generate reset token and send to user email
 */
exports.forgotPassword = asyncError(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Please use provided link for password reset : ${resetURL}`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for only 30 minutes) ',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

/**
 * Get user based on the reset password token saved in db
 * Set new password
 * Update passwordChangedAt property in db
 * Log the user and send jwt token
 */
exports.resetPassword = asyncError(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = hashToken(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Update passwordChangedAt property for the user
  // Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

/**
 * Update user password
 */
exports.updatePassword = asyncError(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log user in, send JWT
  createSendToken(user, 200, req, res);
});

// Logout user from app
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

/**
 * Protect route based on the user exist
 */
exports.protect = asyncError(async (req, res, next) => {
  // Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Grant access to protected routes
  req.user = currentUser;
  next();
});

/**
 * Check role for the permission
 */
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
