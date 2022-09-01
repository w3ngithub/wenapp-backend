const User = require('../../models/users/userModel');
const asyncError = require('../../utils/asyncError');
const AppError = require('../../utils/appError');
const factory = require('../factoryController');

// Compare two object and keep allowed fields to be updated
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Middleware to assign current logged in user id to params
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Update current user
exports.updateMe = asyncError(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // Filtered out fields names that are allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'dob',
    'gender',
    'primaryPhone',
    'secondaryPhone',
    'joinDate',
    'maritalStatus',
    'photoURL'
  );

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Delete current user
exports.deleteMe = asyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    message: null
  });
});

// Disable selected user
exports.disableUser = asyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: { $ne: false } });

  res.status(200).json({
    status: 'success',
    data: {
      message: 'User disabled.'
    }
  });
});

// Import users
exports.importUsers = asyncError(async (req, res, next) => {
  await User.insertMany([...req.body], { lean: true });

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Users Imported.'
    }
  });
});

// Get all ative users count
exports.getActiveUser = asyncError(async (req, res, next) => {
  const user = await User.find({ active: { $ne: false } }).count();

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// get users between 15 of this month to 14 of next month
exports.getBirthMonthUser = asyncError(async (req, res, next) => {
  const currentDate = new Date();

  const activeUsers = await User.find({ active: { $ne: false } });

  let birthMonthUsers = [];

  if (currentDate.getMonth() === 11) {
    birthMonthUsers = activeUsers.filter((x) => {
      const dobYear = new Date(x.dob).getFullYear();

      if (currentDate.getDate() < 15) {
        return (
          new Date(x.dob) >=
            new Date(`${dobYear}/${currentDate.getMonth()}/15`) &&
          new Date(`${dobYear}/${currentDate.getMonth() + 1}/15`)
        );
      }
      return (
        new Date(x.dob) >=
          new Date(`${dobYear}/${currentDate.getMonth() + 1}/15`) &&
        new Date(x.dob) < new Date(`${dobYear + 1}/${1}/15`)
      );
    });
  } else {
    birthMonthUsers = activeUsers.filter((x) => {
      const dobYear = new Date(x.dob).getFullYear();

      if (currentDate.getDate() > 14) {
        return (
          new Date(x.dob) >=
            new Date(`${dobYear}/${currentDate.getMonth() + 1}/15`) &&
          new Date(x.dob) <
            new Date(`${dobYear}/${currentDate.getMonth() + 2}/15`)
        );
      }
      return (
        new Date(x.dob) >=
          new Date(`${dobYear}/${currentDate.getMonth()}/15`) &&
        new Date(x.dob) <
          new Date(`${dobYear}/${currentDate.getMonth() + 1}/15`)
      );
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      users: birthMonthUsers
    }
  });
});

// get users for review of salary

exports.getSalarayReviewUsers = asyncError(async (req, res, next) => {
  const presentDate = new Date();

  // get Users with salary review time before 3 months
  const users = await User.aggregate([
    {
      $set: {
        newSalaryReviewDate: {
          $dateAdd: {
            startDate: '$lastReviewDate',
            unit: 'year',
            amount: 1
          }
        }
      }
    },
    {
      $match: {
        $and: [
          { newSalaryReviewDate: { $gte: presentDate } },
          {
            newSalaryReviewDate: {
              $lte: new Date(presentDate.getTime() + 90 * 24 * 60 * 60 * 1000)
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        newSalaryReviewDate: 1,
        lastReviewDate: 1,
        photoURL: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: users
    }
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
