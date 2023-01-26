const Configurations = require('../../models/configurations/configurationsModel');
const asyncError = require('../../utils/asyncError');
const factory = require('../factoryController');

exports.getConfigurations = factory.getOne(Configurations);
exports.getAllConfigurations = factory.getAll(Configurations);
exports.createConfiguration = factory.createOne(Configurations);
exports.updateConfiguration = asyncError(async (req, res, next) => {
  await Configurations.updateOne({}, { ...req.body }, { upsert: true });

  res.status(201).json({
    status: 'success',
    data: req.body
  });
});

exports.updateLateAttendanceThreshold = asyncError(async (req, res, next) => {
  await Configurations.updateOne(
    {},
    {
      ...req.body
    }
  );

  res.status(201).json({
    status: 'success',
    data: req.body.lateArrivalThreshold
  });
});

exports.deleteConfiguration = factory.deleteOne(Configurations);
