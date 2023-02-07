const { default: mongoose } = require('mongoose');
const UserLeave = require('../../models/leaves/UserLeavesModel');
const asyncError = require('../../utils/asyncError');
const factory = require('../factoryController');

exports.createUserLeave = factory.createOne(UserLeave);
exports.updateUserLeave = factory.updateOne(UserLeave);

exports.getUserLeave = asyncError(async (req, res, next) => {
  const matchConditions = [
    { fiscalYear: { $eq: new Date(req.query.fiscalYear) } }
  ];

  if (req.query.userId) {
    matchConditions.push({ user: mongoose.Types.ObjectId(req.query.userId) });
  }

  const quarter = req.query.quarterId
    ? {
        $filter: {
          input: '$leaves',
          as: 'leaves',
          cond: {
            $eq: [
              '$$leaves.quarter._id',
              mongoose.Types.ObjectId(req.query.quarterId)
            ]
          }
        }
      }
    : 1;

  const userLeaves = await UserLeave.aggregate([
    {
      $match: { $and: matchConditions }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              leaveadjustmentBalance: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 1,
        user: 1,
        fiscalYear: 1,
        leaves: quarter
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: userLeaves
  });
});

exports.updateAllocatedLeave = asyncError(async (req, res) => {
  const { quarterId, fiscalYear } = req.query;
  const { id } = req.params;

  const userLeave = await UserLeave.findOne({
    _id: id,
    fiscalYear: fiscalYear
  });

  const updateLeave = userLeave.leaves.map((x) =>
    x.quarter._id.toString() === quarterId.toString()
      ? {
          ...x,
          allocatedLeaves: req.body.allocatedLeaves
        }
      : x
  );
  userLeave.leaves = updateLeave;
  await userLeave.save();

  res.status(200).json({
    status: 'success',
    data: userLeave
  });
});
